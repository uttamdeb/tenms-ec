import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STREAM_CHUNK_SIZE = 3;
const STREAM_INTERVAL_MS = 11;
const POLL_INTERVAL_MS = 3_000;   // check for assistant reply every 3 s
const POLL_TIMEOUT_MS = 180_000;  // give up after 180 s

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  session_id: string;
  user_id: string;
  feedback?: "like" | "dislike" | null;
  feedback_note?: string | null;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string | null>(null);
  const [userName, setUserName] = useState("user");
  const [userId, setUserId] = useState<string | null>(null);

  // Get user info
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        // Fetch profile name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profile?.full_name) {
          setUserName(profile.full_name);
        } else {
          setUserName(user.email?.split("@")[0] || "user");
        }
      }
    };
    getUser();
  }, []);

  // Load sessions
  const loadSessions = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading sessions:", error);
      return;
    }
    setSessions((data || []) as ChatSession[]);
  }, [userId]);

  useEffect(() => {
    if (userId) loadSessions();
  }, [userId, loadSessions]);

  // Load messages for current session
  const loadMessages = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }
    setMessages((data || []) as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (currentSessionId) loadMessages(currentSessionId);
    else setMessages([]);
    setStreamingMessage(null);
  }, [currentSessionId, loadMessages]);

  // Create new session
  const createSession = useCallback(async () => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: userId, title: "New Chat" })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create chat session");
      console.error(error);
      return null;
    }
    const session = data as ChatSession;
    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.id);
    setMessages([]);
    return session.id;
  }, [userId]);

  // Upload attachment to storage
  const uploadAttachment = useCallback(async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from("chat-images")
      .upload(filePath, file);

    if (error) {
      console.error("Failed to upload attachment:", error);
      toast.error("Failed to upload image");
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("chat-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }, [userId]);

  // Send message
  const sendMessage = useCallback(async (input: string, attachment?: File) => {
    if (!userId || (!input.trim() && !attachment)) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSession();
      if (!sessionId) return;
    }

    // Upload attachment if present
    let attachmentUrl: string | null = null;
    if (attachment) {
      attachmentUrl = await uploadAttachment(attachment);
      if (!attachmentUrl) return; // upload failed
    }

    // Save user message (include image URL in content if attached)
    const messageContent = input.trim() || (attachmentUrl ? "[Image]" : "");
    const { data: userMsg, error: userErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, user_id: userId, role: "user", content: messageContent })
      .select()
      .single();

    if (userErr) {
      toast.error("Failed to save message");
      return;
    }
    setMessages((prev) => [...prev, userMsg as ChatMessage]);

    // Update session title if first message
    if (messages.length === 0) {
      const title = input.trim().slice(0, 50) + (input.trim().length > 50 ? "..." : "");
      await supabase.from("chat_sessions").update({ title, updated_at: new Date().toISOString() }).eq("id", sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
      );
    } else {
      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
    }

    // Call webhook (fire-and-forget — the edge function writes the result to the DB)
    setIsLoading(true);
    setStreamingMessage("");
    try {
      const body: Record<string, unknown> = { user: userName, input: messageContent, sessionId };
      if (attachmentUrl) {
        body.attachments = [{ file_url: attachmentUrl }];
      }

      // Record the timestamp just before firing so we can detect the new assistant row
      const fireTimestamp = new Date().toISOString();

      // Fire the edge function — don't await the response (avoids Cloudflare 60 s timeout)
      supabase.functions.invoke("chat-with-agent", { body }).catch((err) => {
        console.warn("Edge function invoke returned an error (may be expected if Cloudflare closes early):", err);
      });

      // Poll chat_messages for the assistant's reply written by the edge function
      const assistantRow = await new Promise<ChatMessage>((resolve, reject) => {
        const deadline = Date.now() + POLL_TIMEOUT_MS;
        const poll = async () => {
          if (Date.now() > deadline) {
            reject(new Error("Timed out waiting for agent response after 180 seconds."));
            return;
          }
          const { data, error: pollErr } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("session_id", sessionId)
            .eq("role", "assistant")
            .gt("created_at", fireTimestamp)
            .order("created_at", { ascending: false })
            .limit(1);

          if (pollErr) {
            console.error("Poll error:", pollErr);
          }

          if (data && data.length > 0) {
            resolve(data[0] as ChatMessage);
            return;
          }

          window.setTimeout(poll, POLL_INTERVAL_MS);
        };
        // Start first poll after a short delay (webhook takes at least a few seconds)
        window.setTimeout(poll, POLL_INTERVAL_MS);
      });

      // Simulate streaming for the polled content
      const assistantContent = assistantRow.content;
      await new Promise<void>((resolve) => {
        let currentIndex = 0;
        const streamTimer = window.setInterval(() => {
          currentIndex = Math.min(currentIndex + STREAM_CHUNK_SIZE, assistantContent.length);
          setStreamingMessage(assistantContent.slice(0, currentIndex));

          if (currentIndex >= assistantContent.length) {
            window.clearInterval(streamTimer);
            resolve();
          }
        }, STREAM_INTERVAL_MS);
      });

      // The assistant message is already in the DB (written by the edge function).
      // Chat.tsx's useEffect will automatically reload SQL run data when messages change.
      setStreamingMessage(null);
      setMessages((prev) => [...prev, assistantRow]);
    } catch (err) {
      console.error("Error calling agent:", err);
      setStreamingMessage(null);
      toast.error("Failed to get response from agent. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentSessionId, userName, messages.length, createSession]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const updateMessageFeedback = useCallback(async (
    messageId: string,
    feedback: "like" | "dislike" | null,
    feedbackNote?: string | null,
  ) => {
    const updates = {
      feedback,
      feedback_note: feedback === "dislike" ? (feedbackNote?.trim() || null) : null,
    };

    const { error } = await supabase
      .from("chat_messages")
      .update(updates)
      .eq("id", messageId);

    if (error) {
      console.error("Failed to update message feedback:", error);
      throw error;
    }

    setMessages((prev) => prev.map((message) => (
      message.id === messageId
        ? {
            ...message,
            feedback,
            feedback_note: updates.feedback_note,
          }
        : message
    )));
  }, []);

  return {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingMessage,
    userName,
    sendMessage,
    createSession,
    selectSession,
    updateMessageFeedback,
  };
}
