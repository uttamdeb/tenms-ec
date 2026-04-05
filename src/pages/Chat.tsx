import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/hooks/useChat";
import { useTenergy } from "@/hooks/useTenergy";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatMessageBubble from "@/components/chat/ChatMessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import SuggestedMessages from "@/components/chat/SuggestedMessages";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, ArrowLeft, PanelLeftClose, PanelLeft, Plus, Zap, LayoutGrid, X } from "lucide-react";
import ChatGallery from "@/components/chat/ChatGallery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useCallback, lazy, Suspense } from "react";

const QueryGuide = lazy(() => import("@/components/chat/QueryGuide"));
const ReleaseNotes = lazy(() => import("@/components/chat/ReleaseNotes"));
import tentenIcon from "@/assets/tenten-icon.png";
import { runWithViewTransition } from "@/lib/viewTransitions";

const THINKING_NOTES = [
  "Cross-checking branch signals before making bold claims.",
  "Dusting off the trend lines and looking for the weird bits.",
  "Comparing registrations against RTA to spot hidden drift.",
  "Looking for anomalies that refuse to stay quiet.",
  "Turning raw tables into something a human can actually use.",
  "Checking whether the spike is real or just a reporting hiccup.",
  "Following the breadcrumbs from summary to root cause.",
  "Lining up month-on-month movement with branch-level context.",
  "Separating seasonal patterns from actual operational issues.",
  "Stress-testing the story before writing the conclusion.",
  "Scanning for outliers with main-character energy.",
  "Trying not to be impressed by suspiciously perfect numbers.",
  "Looking for the one metric that explains the other three.",
  "Checking if the trend bends before the business feels it.",
  "Translating dashboard chaos into executive-grade signal.",
  "Inspecting the data for plot twists and quiet warnings.",
  "Matching branch performance with what the funnel is actually doing.",
  "Hunting for the gap between activity and outcome.",
  "Running a quick sanity check on the dramatic-looking dip.",
  "Finding the pattern hiding behind the noise.",
  "Looking for where registrations rise but conversion gets lazy.",
  "Checking whether the anomaly is local, systemic, or just loud.",
  "Building the report one suspicious metric at a time.",
  "Watching the trendline like it owes us an explanation.",
  "Preparing observations, anomalies, and recommendations with receipts.",
];

const getRandomThinkingNote = (currentNote?: string) => {
  if (THINKING_NOTES.length === 1) return THINKING_NOTES[0];

  let nextNote = THINKING_NOTES[Math.floor(Math.random() * THINKING_NOTES.length)];
  while (nextNote === currentNote) {
    nextNote = THINKING_NOTES[Math.floor(Math.random() * THINKING_NOTES.length)];
  }

  return nextNote;
};

const Chat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryWidth, setGalleryWidth] = useState(560);
  const galleryResizing = useRef(false);
  const [sqlRunData, setSqlRunData] = useState<Record<string, { executed_sql: string; bq_result: string }>>({});
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [thinkingNote, setThinkingNote] = useState(THINKING_NOTES[0]);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const { tenergy, isUnlimited, hasEnoughTenergy, addUsage } = useTenergy();

  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    streamingMessage,
    sendMessage,
    createSession,
    selectSession,
    deleteSession,
    renameSession,
    updateMessageFeedback,
  } = useChat({ onCharactersUsed: addUsage, hasEnoughTenergy });

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
      setThinkingNote(THINKING_NOTES[0]);
      return;
    }

    setThinkingSeconds(0);
    setThinkingNote(getRandomThinkingNote());
    const timer = window.setInterval(() => {
      setThinkingSeconds((current) => {
        const nextSeconds = current + 1;
        if (nextSeconds % 4 === 0) {
          setThinkingNote((currentNote) => getRandomThinkingNote(currentNote));
        }
        return nextSeconds;
      });
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

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      if (isMobile) setSidebarOpen(false);
    } catch (err) {
      console.error("Delete session failed:", err);
      toast.error("Failed to delete chat session");
    }
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      await renameSession(id, newTitle);
    } catch (err) {
      console.error("Rename session failed:", err);
      toast.error("Failed to rename chat session");
    }
  };

  return (
    <div className="surface-shell relative flex h-dvh flex-col overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.08),transparent_24%),radial-gradient(circle_at_100%_100%,hsl(var(--primary)/0.06),transparent_22%)]" />
      <header className="surface-shell relative z-20 flex h-16 shrink-0 items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <PanelLeftClose className="h-4 w-4 sm:h-5 sm:w-5" /> : <PanelLeft className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <img src={tentenIcon} alt="EC Data Agent" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
            <div className="min-w-0 flex-1">
              <h1 className="headline-agent truncate text-[0.95rem] leading-[1.05] sm:text-[1.75rem]">EC Data Agent</h1>
              <p className="label-tech mt-1 hidden sm:block">A 10MS ORIGINLABS INITIATIVE | HIGHLY CONFIDENTIAL</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" />
            <span>{isUnlimited ? "Unlimited" : tenergy}</span>
            <span className="hidden text-xs font-normal opacity-70 sm:inline">Tenergy</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`h-10 shrink-0 gap-1.5 px-2 sm:px-3 transition-colors duration-200 ${galleryOpen ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => { setGalleryOpen(!galleryOpen); if (!galleryOpen && isMobile) setSidebarOpen(false); }}
            title="Gallery"
          >
            <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden text-sm sm:inline">Gallery</span>
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="h-10 w-10 shrink-0 px-0 sm:h-9 sm:w-auto sm:px-5"
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
        <div className={`transition-all duration-300 ease-in-out ${
          isMobile
            ? `absolute inset-y-12 left-0 z-40 w-64 overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
            : sidebarOpen ? "w-[18rem] shrink-0 pr-3 overflow-visible" : "w-0 overflow-hidden"
        }`}>
          <ChatSidebar
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={handleSelectSession}
            onNewChat={handleNewChat}
            onDeleteSession={handleDeleteSession}
            onRenameSession={handleRenameSession}
          />
        </div>

        {/* Overlay for mobile sidebar / gallery */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-30 bg-background/72 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}


        {/* Chat area */}
        <div className="surface-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-10 sm:py-12 animate-in fade-in duration-500">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <p className="label-tech">EC data workspace</p>
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="headline-agent max-w-xl text-[2.65rem] leading-[0.92] sm:text-6xl">
                      Explore the <span className="text-primary">Dashboard</span>
                      <br />
                      with EC Data Agent.
                    </h2>
                    <p className="max-w-xl text-base leading-7 text-[hsl(var(--on-surface-variant))] sm:text-lg sm:leading-8">
                      Ask about branch performance, admissions, revenue collection, classroom operations, tele-eligible leads, and other English Centre metrics to begin the deep dive.
                    </p>
                  </div>
                </div>
                <div className="grid w-full max-w-xl gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="surface-card rounded-[1.5rem] p-4 shadow-sm sm:col-span-2 sm:p-5">
                    <div className="mb-6 flex items-start justify-between gap-4 sm:mb-10">
                      <img src={tentenIcon} alt="EC Data Agent" className="h-10 w-10 rounded-xl object-contain" />
                      <span className="label-tech">EC Data Dashboard</span>
                    </div>
                    <div>
                      <h3 className="headline-agent text-xl sm:text-2xl">Branch Performance Overview</h3>
                      <p className="mt-2 text-sm text-[hsl(var(--on-surface-variant))]">Review RTA, admissions, and revenue trends across all branches.</p>
                    </div>
                  </div>
                  <div className="surface-card rounded-[1.5rem] p-4 shadow-sm sm:p-5">
                    <span className="label-tech">Revenue collection</span>
                    <p className="mt-5 text-base font-semibold sm:mt-8 sm:text-lg">Track month-wise revenue collected amount since Jan 2026.</p>
                  </div>
                  <div className="surface-card rounded-[1.5rem] p-4 shadow-sm sm:p-5">
                    <span className="label-tech">Agent analysis</span>
                    <p className="mt-5 text-base font-semibold sm:mt-8 sm:text-lg">Generate summaries, compare branches, and validate operational data quickly.</p>
                  </div>
                </div>
              </div>
              <div className="mx-auto mt-5 w-full max-w-5xl animate-in fade-in duration-700 delay-300 sm:mt-8">
                <Suspense fallback={null}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <QueryGuide isBIUser={profile?.role === "BI"} />
                    <ReleaseNotes isBIUser={profile?.role === "BI"} />
                  </div>
                </Suspense>
              </div>
              <div className="mt-4 w-full animate-in fade-in duration-700 delay-500 sm:mt-6">
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
                    <div className="surface-card flex max-w-[min(32rem,calc(100vw-7rem))] items-start gap-3 rounded-[1.25rem] px-4 py-3 transition-colors duration-300">
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                      <div className="min-w-0 space-y-1">
                        <span className="block text-sm text-muted-foreground">
                          {thinkingSeconds <= 0
                            ? "Thinking..."
                            : `Thinking for ${thinkingSeconds} ${thinkingSeconds === 1 ? "sec" : "secs"}`}
                        </span>
                        <p className="text-xs leading-5 text-[hsl(var(--on-surface-variant))] sm:text-[0.8125rem]">
                          {thinkingNote}
                        </p>
                      </div>
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

          <ChatInput onSend={(msg, attachmentUrl) => sendMessage(msg, attachmentUrl)} disabled={isLoading} userId={profile?.id} />
        </div>

        {/* Mobile gallery — fullscreen slide-up */}
        <div
          className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 ease-out sm:hidden ${
            galleryOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="headline-agent text-xl">Gallery</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 transition-transform duration-200 hover:rotate-90"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-y-contain px-2 pb-2 [-webkit-overflow-scrolling:touch]">
            {galleryOpen && <ChatGallery />}
          </div>
        </div>

        {/* Desktop gallery — slide in from right */}
        <div
          className={`relative hidden shrink-0 sm:flex transition-all duration-300 ease-out origin-right ${
            galleryOpen ? "pl-3 opacity-100 scale-x-100" : "w-0 pl-0 opacity-0 pointer-events-none"
          }`}
          style={{ width: galleryOpen ? galleryWidth : 0 }}
        >
          {/* Resize handle */}
          <div
            className="absolute left-0 top-0 z-10 h-full w-1.5 cursor-col-resize rounded-full transition-colors hover:bg-primary/20 active:bg-primary/30"
            onMouseDown={(e) => {
              e.preventDefault();
              galleryResizing.current = true;
              const startX = e.clientX;
              const startW = galleryWidth;
              const onMove = (ev: MouseEvent) => {
                if (!galleryResizing.current) return;
                const delta = startX - ev.clientX;
                setGalleryWidth(Math.max(320, Math.min(800, startW + delta)));
              };
              const onUp = () => {
                galleryResizing.current = false;
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
              };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />
          <aside
            className={`surface-recessed flex h-full w-full flex-col rounded-[1.75rem] px-3 py-4 transition-all duration-300 ease-out ${
              galleryOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between px-2 pb-3">
              <p className="headline-agent text-xl">Gallery</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full text-muted-foreground transition-transform duration-200 hover:rotate-90 hover:text-foreground"
                onClick={() => setGalleryOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {galleryOpen && <ChatGallery />}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Chat;