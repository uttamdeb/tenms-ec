import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Send message
  const sendMessage = useCallback(async (input: string) => {
    if (!userId || !input.trim()) return;

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSession();
      if (!sessionId) return;
    }

    // Save user message
    const { data: userMsg, error: userErr } = await supabase
      .from("chat_messages")
      .insert({ session_id: sessionId, user_id: userId, role: "user", content: input.trim() })
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

    // Call webhook
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("chat-with-agent", {
        body: { user: userName, input: input.trim(), sessionId },
      });

      if (error) throw error;

      // Handle array response from webhook
      const responseData = Array.isArray(data) ? data[0] : data;
      const assistantContent = responseData?.output || responseData?.message || responseData?.response || JSON.stringify(responseData);

      // Save assistant message
      const { data: assistantMsg, error: assistantErr } = await supabase
        .from("chat_messages")
        .insert({ session_id: sessionId, user_id: userId, role: "assistant", content: assistantContent })
        .select()
        .single();

      if (assistantErr) {
        console.error("Failed to save assistant message:", assistantErr);
      } else {
        setMessages((prev) => [...prev, assistantMsg as ChatMessage]);

        // Save SQL run data if present
        if (responseData?.executed_sql && responseData?.bq_result) {
          const bqResultStr = typeof responseData.bq_result === 'string' 
            ? responseData.bq_result 
            : JSON.stringify(responseData.bq_result);
          await supabase.from("agent_sql_runs").insert({
            message_id: (assistantMsg as ChatMessage).id,
            executed_sql: responseData.executed_sql,
            bq_result: bqResultStr,
          });
        }
      }
    } catch (err) {
      console.error("Error calling agent:", err);
      toast.error("Failed to get response from agent");
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
    userName,
    sendMessage,
    createSession,
    selectSession,
    updateMessageFeedback,
  };
}
