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
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
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

  useEffect(() => {
    if (!isLoading || streamingMessage) {
      setThinkingSeconds(0);
      return;
    }

    setThinkingSeconds(0);
    const timer = window.setInterval(() => {
      setThinkingSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLoading, streamingMessage]);

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
    <div className="surface-shell relative flex h-dvh flex-col overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.08),transparent_24%),radial-gradient(circle_at_100%_100%,hsl(var(--primary)/0.06),transparent_22%)]" />
      <header className="surface-shell relative z-20 flex h-16 shrink-0 items-center justify-between px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" /> : <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <img src={tentenIcon} alt="EC Data Agent" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
            <div className="min-w-0">
              <h1 className="headline-agent truncate text-xl leading-[1.05] sm:text-[1.75rem]">EC Data Agent</h1>
              <p className="label-tech mt-1 hidden sm:block">A 10MS ORIGINLABS INITIATIVE | HIGHLY CONFIDENTIAL</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button 
            variant="default"
            size="sm"
            className="shrink-0 px-4 sm:px-5"
            onClick={handleNewChat}
          >
            <Plus className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">New Chat</span>
          </Button>
          <ThemeToggle />
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => runWithViewTransition(() => navigate("/"))}
            className="hidden sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-1">Dashboard</span>
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

      <div className="relative z-10 flex flex-1 overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isMobile
            ? `absolute inset-y-12 left-0 z-40 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : sidebarOpen ? "w-[18rem] shrink-0 pr-3" : "w-0"
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
            className="fixed inset-0 z-30 bg-background/72 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Chat area */}
        <div className="surface-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 animate-in fade-in duration-500">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <p className="label-tech">EC data workspace</p>
                  <div className="space-y-4">
                    <h2 className="headline-agent max-w-xl text-4xl leading-[0.92] sm:text-6xl">
                      Explore the <span className="text-primary">Dashboard</span>
                      <br />
                      with EC Data Agent.
                    </h2>
                    <p className="max-w-xl text-lg leading-8 text-[hsl(var(--on-surface-variant))]">
                      Ask about branch performance, admissions, revenue collection, classroom operations, tele-eligible leads, and other English Centre metrics to begin the deep dive.
                    </p>
                  </div>
                </div>
                <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
                  <div className="surface-card rounded-[1.5rem] p-5 shadow-sm sm:col-span-2">
                    <div className="mb-10 flex items-start justify-between gap-4">
                      <img src={tentenIcon} alt="EC Data Agent" className="h-10 w-10 rounded-xl object-contain" />
                      <span className="label-tech">EC Data Dashboard</span>
                    </div>
                    <div>
                      <h3 className="headline-agent text-2xl">Branch Performance Overview</h3>
                      <p className="mt-2 text-sm text-[hsl(var(--on-surface-variant))]">Review RTA, admissions, and revenue trends across all branches.</p>
                    </div>
                  </div>
                  <div className="surface-card rounded-[1.5rem] p-5 shadow-sm">
                    <span className="label-tech">Revenue collection</span>
                    <p className="mt-8 text-lg font-semibold">Track month-wise revenue collected amount since Jan 2026.</p>
                  </div>
                  <div className="surface-card rounded-[1.5rem] p-5 shadow-sm">
                    <span className="label-tech">Agent analysis</span>
                    <p className="mt-8 text-lg font-semibold">Generate summaries, compare branches, and validate operational data quickly.</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 w-full animate-in fade-in duration-700 delay-500">
                <SuggestedMessages onSelect={(msg) => sendMessage(msg)} />
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="mx-auto flex w-full max-w-5xl flex-col overflow-hidden px-3 py-4 sm:px-6 sm:py-6">
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
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex gap-3 px-2 py-4 duration-300 sm:px-4">
                    <div className="cta-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                      <img src={tentenIcon} alt="EC Data Agent" className="h-4 w-4 object-contain" />
                    </div>
                    <div className="surface-card flex items-center gap-2 rounded-[1.25rem] px-4 py-3 transition-colors duration-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {thinkingSeconds <= 0
                          ? "Thinking..."
                          : `Thinking for ${thinkingSeconds} ${thinkingSeconds === 1 ? "sec" : "secs"}`}
                      </span>
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