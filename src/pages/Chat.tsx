import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import SuggestedMessages from "@/components/chat/SuggestedMessages";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, ArrowLeft, PanelLeftClose, PanelLeft, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useCallback } from "react";
import tentenIcon from "@/assets/tenten-icon.png";
import { runWithViewTransition } from "@/lib/viewTransitions";

const Chat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sqlRunData, setSqlRunData] = useState<Record<string, { executed_sql: string; bq_result: string }>>({});
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, updateProfile, uploadAvatar } = useProfile();

  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    createSession,
    selectSession,
    updateMessageFeedback,
  } = useChat();

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) runWithViewTransition(() => navigate("/auth"));
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) runWithViewTransition(() => navigate("/auth"));
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch SQL run data for assistant messages
  useEffect(() => {
    const fetchSqlData = async () => {
      const assistantMessages = messages.filter(m => m.role === "assistant");
      if (assistantMessages.length === 0) return;

      const messageIds = assistantMessages.map(m => m.id);
      const { data } = await supabase
        .from("agent_sql_runs")
        .select("message_id, executed_sql, bq_result")
        .in("message_id", messageIds);

      if (data) {
        const dataByMessageId: Record<string, { executed_sql: string; bq_result: string }> = {};
        data.forEach(row => {
          dataByMessageId[row.message_id] = {
            executed_sql: row.executed_sql,
            bq_result: row.bq_result
          };
        });
        setSqlRunData(dataByMessageId);
      }
    };

    fetchSqlData();
  }, [messages]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleNewChat = async () => {
    await createSession();
    if (isMobile) setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="h-dvh flex flex-col bg-background overflow-x-hidden">
      {/* Top bar */}
      <header className="h-12 sm:h-14 shrink-0 border-b border-border bg-card flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 transition-transform duration-200 hover:scale-110"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" /> : <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <img src={tentenIcon} alt="EC Data Agent" className="shrink-0 h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-none">EC Data Agent</h1>
              <p className="text-xs text-muted-foreground">Your data assistant</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-0.5 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 transition-all duration-200 hover:scale-105 active:scale-95" 
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-1 text-sm">New Chat</span>
          </Button>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => runWithViewTransition(() => navigate("/"))}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-auto sm:px-3 transition-smooth hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1 text-sm">Dashboard</span>
          </Button>
          {profile && (
            <div className="shrink-0">
              <ProfileDropdown
                profile={profile}
                onUpdateProfile={updateProfile}
                onUploadAvatar={uploadAvatar}
              />
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isMobile
            ? `absolute inset-y-12 left-0 z-40 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : sidebarOpen ? "w-64 shrink-0" : "w-0"
        }`}>
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 animate-in fade-in duration-500">
              <div className="text-center space-y-3 sm:space-y-4 animate-in slide-in-from-bottom-4 duration-700 max-w-sm sm:max-w-md px-2">
                <img src={tentenIcon} alt="EC Data Agent" className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl object-cover mx-auto animate-in zoom-in duration-700" />
                <h2 className="text-lg sm:text-xl font-semibold animate-in fade-in duration-700 delay-200">Hello! I'm EC Data Agent</h2>
                <p className="text-sm sm:text-base text-muted-foreground animate-in fade-in duration-700 delay-300">
                  I'm here to help you explore and analyze your English Centre data. Ask me anything about branches, students, revenue, and more!
                </p>
              </div>
              <div className="mt-6 sm:mt-8 w-full animate-in fade-in duration-700 delay-500">
                <SuggestedMessages onSelect={(msg) => sendMessage(msg)} />
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-3xl w-full mx-auto overflow-hidden">
                {messages.map((msg) => {
                  const sqlData = sqlRunData[msg.id];
                  return (
                    <ChatMessageBubble
                      key={msg.id}
                      id={msg.id}
                      role={msg.role}
                      content={msg.content}
                      sessionId={msg.session_id}
                      userId={msg.user_id}
                      feedback={msg.feedback}
                      feedbackNote={msg.feedback_note}
                      onFeedbackChange={updateMessageFeedback}
                      userAvatarUrl={profile?.avatar_url}
                      userInitials={profile?.full_name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      userRole={profile?.role}
                      executed_sql={sqlData?.executed_sql || null}
                      bq_result={sqlData?.bq_result || null}
                    />
                  );
                })}
                {isLoading && !streamingMessage && (
                  <div className="flex gap-3 py-4 px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <img src={tentenIcon} alt="EC Data Agent" className="shrink-0 h-8 w-8 rounded-lg object-cover" />
                    <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2 transition-colors duration-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                {streamingMessage && (
                  <ChatMessageBubble
                    id="streaming-preview"
                    role="assistant"
                    content={streamingMessage}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          <ChatInput onSend={(msg, attachment) => sendMessage(msg, attachment)} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;