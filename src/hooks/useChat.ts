import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { mirrorInsert, mirrorUpdate } from "@/integrations/supabase/dualWrite";
import { toast } from "sonner";

const STREAM_INTERVAL_MS = 16; // ~60fps tick
const STREAM_TARGET_MS = 1700; // target total stream duration in ms

export type ChatMode = "ec" | "10ms";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  session_id: string;
  user_id: string;
  mode: ChatMode;
  feedback?: "like" | "dislike" | null;
  feedback_note?: string | null;
}

export interface ChatSession {
  id: string;
  status: string;
  title: string;
  mode: ChatMode;
  created_at: string;
  updated_at: string;
}

interface UseChatOptions {
  onCharactersUsed?: (chars: number) => void;
  hasEnoughTenergy?: boolean;
}

export function useChat(mode: ChatMode, options: UseChatOptions = {}) {
  const { onCharactersUsed, hasEnoughTenergy = true } = options;
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
      .eq("mode", mode)
      .neq("status", "deleted")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading sessions:", error);
      return;
    }
    setSessions((data || []) as ChatSession[]);
  }, [userId, mode]);

  useEffect(() => {
    if (userId) loadSessions();
  }, [userId, loadSessions]);

  // Load messages for current session
  const loadMessages = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .eq("mode", mode)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }
    setMessages((data || []) as ChatMessage[]);
  }, [mode]);

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
      .insert({ user_id: userId, title: "New Chat", mode })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create chat session");
      console.error(error);
      return null;
    }
    const session = data as ChatSession;
    mirrorInsert("chat_sessions", { id: session.id, user_id: userId, title: session.title, mode, status: session.status, created_at: session.created_at, updated_at: session.updated_at });
    setSessions((prev) => [session, ...prev]);
    setCurrentSessionId(session.id);
    setMessages([]);
    return session.id;
  }, [userId, mode]);

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
  const sendMessage = useCallback(async (input: string, attachmentUrl?: string) => {
    if (!userId || !input.trim()) return;

    if (!hasEnoughTenergy) {
      toast.error("You've used all your Tenergy for today. Come back tomorrow!");
      return;
    }

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSession();
      if (!sessionId) return;
    }

    const messageContent = attachmentUrl
      ? `${input.trim()}\n\n![attached image](${attachmentUrl})`
      : input.trim();
    const { data: userMsg, error: userErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, user_id: userId, role: "user", content: messageContent, mode })
      .select()
      .single();

    if (userErr) {
      toast.error("Failed to save message");
      return;
    }
    mirrorInsert("chat_messages", { id: (userMsg as ChatMessage).id, session_id: sessionId, user_id: userId, role: "user", content: messageContent, mode, created_at: (userMsg as ChatMessage).created_at });
    setMessages((prev) => [...prev, userMsg as ChatMessage]);

    // Update session title if first message
    if (messages.length === 0) {
      const title = input.trim().slice(0, 50) + (input.trim().length > 50 ? "..." : "");
      await supabase.from("chat_sessions").update({ title, updated_at: new Date().toISOString() }).eq("id", sessionId);
      mirrorUpdate("chat_sessions", { title, updated_at: new Date().toISOString() }, "id", sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
      );
    } else {
      await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
      mirrorUpdate("chat_sessions", { updated_at: new Date().toISOString() }, "id", sessionId);
    }

    // Call webhook
    setIsLoading(true);
    setStreamingMessage("");
    try {
      const body: Record<string, unknown> = { user: userName, input: messageContent, sessionId, mode };
      if (attachmentUrl) {
        body.attachments = [{ file_url: attachmentUrl }];
      }
      const invokeController = new AbortController();
      const invokeTimeout = window.setTimeout(() => invokeController.abort(), 120_000); // 120 s client-side guard
      let data: unknown, error: unknown;
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const session = (await supabase.auth.getSession()).data.session;
        const res = await fetch(`${supabaseUrl}/functions/v1/chat-with-agent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify(body),
          signal: invokeController.signal,
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          error = new Error((errBody as Record<string, string>).error || `HTTP ${res.status}`);
        } else {
          data = await res.json();
        }
      } finally {
        window.clearTimeout(invokeTimeout);
      }

      if (error) throw error;

      // Handle array response from webhook
      const responseData = Array.isArray(data) ? data[0] : data;
      const assistantContent = responseData?.output || responseData?.message || responseData?.response || JSON.stringify(responseData);

      await new Promise<void>((resolve) => {
        let currentIndex = 0;
        // Dynamically scale chunk size so the stream always finishes in ~STREAM_TARGET_MS
        // Minimum 2 chars/tick for very short messages, no upper cap so long ones stream fast
        const totalTicks = STREAM_TARGET_MS / STREAM_INTERVAL_MS;
        const chunkSize = Math.max(2, Math.ceil(assistantContent.length / totalTicks));

        const streamTimer = window.setInterval(() => {
          currentIndex = Math.min(currentIndex + chunkSize, assistantContent.length);
          setStreamingMessage(assistantContent.slice(0, currentIndex));

          if (currentIndex >= assistantContent.length) {
            window.clearInterval(streamTimer);
            resolve();
          }
        }, STREAM_INTERVAL_MS);
      });

      // Save assistant message
      const { data: assistantMsg, error: assistantErr } = await supabase
        .from("chat_messages")
        .insert({ session_id: sessionId, user_id: userId, role: "assistant", content: assistantContent, mode })
        .select()
        .single();

      if (assistantErr) {
        console.error("Failed to save assistant message:", assistantErr);
      } else {
        mirrorInsert("chat_messages", { id: (assistantMsg as ChatMessage).id, session_id: sessionId, user_id: userId, role: "assistant", content: assistantContent, mode, created_at: (assistantMsg as ChatMessage).created_at });

        // Save SQL run data BEFORE updating messages state so the fetch effect picks it up
        if (responseData?.executed_sql && responseData?.bq_result) {
          const bqResultStr = typeof responseData.bq_result === 'string' 
            ? responseData.bq_result 
            : JSON.stringify(responseData.bq_result);
          await supabase.from("agent_sql_runs").insert({
            message_id: (assistantMsg as ChatMessage).id,
            executed_sql: responseData.executed_sql,
            bq_result: bqResultStr,
          });
          mirrorInsert("agent_sql_runs", {
            message_id: (assistantMsg as ChatMessage).id,
            executed_sql: responseData.executed_sql,
            bq_result: bqResultStr,
          });
        }

        setStreamingMessage(null);
        setMessages((prev) => [...prev, assistantMsg as ChatMessage]);

        // Track character usage (user input + assistant response)
        if (onCharactersUsed) {
          const totalChars = messageContent.length + assistantContent.length;
          onCharactersUsed(totalChars);
        }
      }
    } catch (err) {
      console.error("Error calling agent:", err);
      setStreamingMessage(null);
      toast.error("Failed to get response from agent");
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentSessionId, userName, messages.length, createSession, hasEnoughTenergy, mode, onCharactersUsed, uploadAttachment]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from("chat_sessions")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to delete session:", error);
      throw error;
    }
    mirrorUpdate("chat_sessions", { status: "deleted", updated_at: new Date().toISOString() }, "id", sessionId);

    setSessions((prev) => prev.filter((session) => session.id !== sessionId));

    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([]);
      setStreamingMessage(null);
    }
  }, [currentSessionId]);

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
    mirrorUpdate("chat_messages", updates, "id", messageId);

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

  const renameSession = useCallback(async (sessionId: string, newTitle: string) => {
    const title = newTitle.trim();
    if (!title) return;
    const { error } = await supabase
      .from("chat_sessions")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", sessionId);

    if (error) {
      console.error("Failed to rename session:", error);
      throw error;
    }
    mirrorUpdate("chat_sessions", { title, updated_at: new Date().toISOString() }, "id", sessionId);
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title } : s)));
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
    deleteSession,
    renameSession,
    updateMessageFeedback,
  };
}
