import { useEffect, useState, type CSSProperties } from "react";
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import { Loader2, ArrowLeft, PanelLeftClose, PanelLeft, Plus, Zap, LayoutGrid, X, Maximize2, Minimize2, ChevronDown } from "lucide-react";
import ChatGallery from "@/components/chat/ChatGallery";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useCallback, lazy, Suspense } from "react";

type ChatMode = "ec" | "10ms";

interface ChatProps {
  mode: ChatMode;
}

const QueryGuide = lazy(() => import("@/components/chat/QueryGuide"));
const ReleaseNotes = lazy(() => import("@/components/chat/ReleaseNotes"));
import tentenIcon from "@/assets/tenten-icon.png";
import { runWithViewTransition } from "@/lib/viewTransitions";

const THINKING_NOTES = [
  "Dusting off the trend lines and looking for the weird bits.",
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
  "Hunting for the gap between activity and outcome.",
  "Running a quick sanity check on the dramatic-looking dip.",
  "Finding the pattern hiding behind the noise.",
  "Checking whether the anomaly is local, systemic, or just loud.",
  "Building the report one suspicious metric at a time.",
  "Watching the trendline like it owes us an explanation.",
  "Preparing observations, anomalies, and recommendations with receipts.",
  "Reconciling source tables before trusting the headline number.",
  "Checking whether today is quiet or the pipeline is just late.",
  "Comparing operational movement with what the admissions sheet claims.",
  "Testing whether the drop is real, delayed, or mislabeled.",
  "Tracing the metric from raw rows to executive summary.",
  "Checking if the funnel is healthy or just cosmetically stable.",
  "Looking for the segment where the pattern first starts to wobble.",
  "Verifying the count before turning it into a conclusion.",
  "Checking whether the branch mix changed before the totals did.",
  "Pulling signal out of the spreadsheet noise.",
  "Looking for the operational reason hiding behind the aggregate.",
  "Checking if the trend is broad-based or driven by one outlier branch.",
  "Reviewing the numbers like they just said something suspicious.",
  "Cross-checking the pattern before calling it a pattern.",
  "Looking for the detail that changes the whole read.",
  "Sorting the useful signal from the decorative noise.",
  "Checking whether the summary still holds at a closer look.",
  "Following the numbers until they start making sense.",
  "Testing the obvious explanation before trusting it.",
  "Looking for what changed, what stayed stable, and what is pretending.",
  "Reading between the rows before writing the takeaway.",
];

const getRandomThinkingNote = (currentNote?: string) => {
  if (THINKING_NOTES.length === 1) return THINKING_NOTES[0];

  let nextNote = THINKING_NOTES[Math.floor(Math.random() * THINKING_NOTES.length)];
  while (nextNote === currentNote) {
    nextNote = THINKING_NOTES[Math.floor(Math.random() * THINKING_NOTES.length)];
  }

  return nextNote;
};

const Chat = ({ mode }: ChatProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryFullscreen, setGalleryFullscreen] = useState(false);
  const [galleryWidth, setGalleryWidth] = useState(560);
  const galleryResizing = useRef(false);
  const [sidebarWidth, setSidebarWidth] = useState(288); // 18rem default
  const sidebarResizing = useRef(false);
  const [sqlRunData, setSqlRunData] = useState<Record<string, { executed_sql: string; bq_result: string }>>({});
  const [thinkingNote, setThinkingNote] = useState(THINKING_NOTES[0]);
  const [thoughtDurations, setThoughtDurations] = useState<Record<string, number>>({});
  const [streamingPreviewMeta, setStreamingPreviewMeta] = useState<{ messageId: string | null; thinkingDuration: number | null }>({
    messageId: null,
    thinkingDuration: null,
  });
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
    pendingJobId,
    thinkingDurationSeconds,
    sendMessage,
    createSession,
    selectSession,
    deleteSession,
    renameSession,
    updateMessageFeedback,
  } = useChat(mode, {
    onCharactersUsed: addUsage,
    hasEnoughTenergy,
    onAssistantMessageReady: ({ messageId, thinkingDuration }) => {
      setStreamingPreviewMeta({
        messageId,
        thinkingDuration,
      });
    },
  });

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
    if (!isLoading) {
      setThinkingNote(THINKING_NOTES[0]);
      return;
    }

    if (streamingMessage) {
      return;
    }

    setThinkingNote(getRandomThinkingNote());
    const timer = window.setInterval(() => {
      setThinkingNote((currentNote) => getRandomThinkingNote(currentNote));
    }, 4000);

    return () => window.clearInterval(timer);
  }, [isLoading, streamingMessage]);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === "assistant" && streamingPreviewMeta.messageId === lastMsg.id && streamingPreviewMeta.thinkingDuration != null) {
      const dur = streamingPreviewMeta.thinkingDuration;
      setThoughtDurations(prev => prev[lastMsg.id] ? prev : { ...prev, [lastMsg.id]: dur });
      setStreamingPreviewMeta({ messageId: null, thinkingDuration: null });
    }
  }, [messages, streamingPreviewMeta]);

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
    <div
      className="surface-shell relative flex h-dvh flex-col overflow-hidden text-foreground"
      style={{
        "--chat-sidebar-width": `${sidebarOpen ? sidebarWidth : 0}px`,
        "--chat-gallery-width": `${galleryOpen && !galleryFullscreen ? galleryWidth : galleryOpen && galleryFullscreen ? 0 : 0}px`,
      } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_20%_0%,hsl(var(--primary)/0.08),transparent_24%),radial-gradient(circle_at_100%_100%,hsl(var(--primary)/0.06),transparent_22%)]" />
      <header className="surface-shell relative z-20 shrink-0 px-3 py-2.5 sm:min-h-[5.1rem] sm:px-6 sm:py-3">
        <div className="hidden items-center justify-between gap-2 sm:flex">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </Button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <img src={tentenIcon} alt="10MS Data Agent" className="h-8 w-8 shrink-0 rounded-lg object-contain" />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-3">
                  <h1 className="headline-agent truncate pb-[0.08em] text-[1.75rem] leading-[1.06]">10MS Data Agent</h1>
                  <HoverCard openDelay={80} closeDelay={120}>
                    <HoverCardTrigger asChild>
                      <button
                        type="button"
                        className="label-tech inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold text-primary transition-colors hover:bg-primary/15"
                      >
                        <span>{mode === "10ms" ? "Mode: 10MS" : "Mode: EC"}</span>
                        <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent align="start" className="w-48 rounded-2xl border-border/60 bg-background/95 p-2 backdrop-blur-xl">
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => mode !== "ec" && runWithViewTransition(() => navigate("/ec-chat"))}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${mode === "ec" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"}`}
                        >
                          <span>EC</span>
                          <span className="label-tech text-[0.55rem]">Branch</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => mode !== "10ms" && runWithViewTransition(() => navigate("/10ms-chat"))}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${mode === "10ms" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"}`}
                        >
                          <span>10MS</span>
                          <span className="label-tech text-[0.55rem]">Online</span>
                        </button>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <p className="label-tech mt-1 truncate">A 10MS ORIGINLABS INITIATIVE | HIGHLY CONFIDENTIAL</p>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>{isUnlimited ? "Unlimited" : tenergy}</span>
              <span className="text-xs font-normal opacity-70">Tenergy</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`h-10 shrink-0 gap-1.5 px-3 transition-colors duration-200 ${galleryOpen ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setGalleryOpen(!galleryOpen); if (!galleryOpen && isMobile) setSidebarOpen(false); }}
              title="Gallery"
            >
              <LayoutGrid className="h-5 w-5" />
              <span className="text-sm">Gallery</span>
            </Button>
            <Button 
              variant="default"
              size="sm"
              className="h-9 shrink-0 px-5"
              onClick={handleNewChat}
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1">New Chat</span>
            </Button>
            <ThemeToggle />
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => runWithViewTransition(() => navigate("/"))}
              className="inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1">Mode</span>
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
        </div>

        <div className="space-y-2 sm:hidden">
          <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-2">
            <div className="flex justify-start">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>
            </div>
            <div className="min-w-0 text-center">
              <div className="flex items-center justify-center gap-2">
                <img src={tentenIcon} alt="10MS Data Agent" className="h-7 w-7 shrink-0 rounded-lg object-contain" />
                <h1 className="headline-agent truncate text-[1rem] leading-[1.05]">10MS Data Agent</h1>
              </div>
            </div>
            {profile && (
              <div className="flex justify-end">
                <ProfileDropdown
                  profile={profile}
                  onUpdateProfile={updateProfile}
                  onUploadAvatar={uploadAvatar}
                />
              </div>
            )}
            {!profile && <div />}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HoverCard openDelay={80} closeDelay={120}>
              <HoverCardTrigger asChild>
                <button
                  type="button"
                  className="label-tech inline-flex h-10 shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 text-[0.62rem] font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <span>{mode === "10ms" ? "Mode: 10MS" : "Mode: EC"}</span>
                  <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent align="start" className="w-48 rounded-2xl border-border/60 bg-background/95 p-2 backdrop-blur-xl">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => mode !== "ec" && runWithViewTransition(() => navigate("/ec-chat"))}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${mode === "ec" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"}`}
                  >
                    <span>EC</span>
                    <span className="label-tech text-[0.55rem]">Branch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => mode !== "10ms" && runWithViewTransition(() => navigate("/10ms-chat"))}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${mode === "10ms" ? "bg-primary/10 text-primary" : "text-foreground hover:bg-white/5"}`}
                  >
                    <span>10MS</span>
                    <span className="label-tech text-[0.55rem]">Online</span>
                  </button>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Button
              variant="ghost"
              size="sm"
              className={`h-10 shrink-0 gap-1.5 rounded-full px-3 transition-colors duration-200 ${galleryOpen ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => { setGalleryOpen(!galleryOpen); if (!galleryOpen && isMobile) setSidebarOpen(false); }}
              title="Gallery"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-sm">Gallery</span>
            </Button>

            <Button 
              variant="default"
              size="sm"
              className="h-10 w-10 shrink-0 rounded-full px-0"
              onClick={handleNewChat}
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button 
              variant="ghost"
              size="sm"
              onClick={() => runWithViewTransition(() => navigate("/"))}
              className="h-10 shrink-0 rounded-full px-3 text-muted-foreground hover:text-foreground"
              title="Mode"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1 text-sm">Mode</span>
            </Button>

            <ThemeToggle />

            <div className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 text-sm font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" />
              <span>{isUnlimited ? "Unlimited" : tenergy}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4">
        {/* Sidebar */}
        <div
          className={`transition-[transform,opacity] duration-300 ease-in-out ${
            galleryFullscreen ? "hidden" :
            isMobile
              ? `absolute inset-y-0 left-0 z-40 w-72 max-w-[85vw] overflow-hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
              : `relative hidden w-[var(--chat-sidebar-width)] shrink-0 sm:flex origin-left transition-all duration-300 ease-out ${sidebarOpen ? "pr-3 opacity-100 scale-x-100" : "pr-0 opacity-0 scale-x-95 pointer-events-none"}`
          }`}
        >
          <div
            className={`h-full w-full transition-all duration-300 ease-out ${
              !isMobile && sidebarOpen ? "translate-x-0 opacity-100" : !isMobile ? "-translate-x-6 opacity-0" : ""
            }`}
          >
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              onDeleteSession={handleDeleteSession}
              onRenameSession={handleRenameSession}
            />
          </div>
          {/* Resize handle (desktop only) */}
          {!isMobile && sidebarOpen && (
            <div
              className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize rounded-full transition-colors hover:bg-primary/20 active:bg-primary/30"
              onMouseDown={(e) => {
                e.preventDefault();
                sidebarResizing.current = true;
                const startX = e.clientX;
                const startW = sidebarWidth;
                const onMove = (ev: MouseEvent) => {
                  if (!sidebarResizing.current) return;
                  setSidebarWidth(Math.max(200, Math.min(480, startW + ev.clientX - startX)));
                };
                const onUp = () => {
                  sidebarResizing.current = false;
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                };
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            />
          )}
        </div>

        {/* Overlay for mobile sidebar / gallery */}
        {sidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 z-30 bg-background/72 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}


        {/* Chat area */}
        <div className={`surface-panel relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] transition-all duration-300 ${galleryFullscreen ? "hidden" : ""}`}>
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-10 sm:py-12 animate-in fade-in duration-500">
              <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:gap-10 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl space-y-4 sm:space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <p className="label-tech">{mode === "10ms" ? "10MS data workspace" : "EC data workspace"}</p>
                  <div className="space-y-3 sm:space-y-4">
                    <h2 className="headline-agent max-w-xl text-[2.65rem] leading-[0.92] sm:text-6xl">
                      Explore the <span className="text-primary">Dashboard</span>
                      <br />
                      with 10MS Data Agent.
                    </h2>
                    <p className="max-w-xl text-base leading-7 text-[hsl(var(--on-surface-variant))] sm:text-lg sm:leading-8">
                      {mode === "10ms"
                        ? "Ask about OB, HSC, SSC, SMP, BPP, TenTen, Delivery, Traffic, renewals, and enrollment-season performance to begin the deep dive."
                        : "Ask about branch performance, admissions, revenue collection, classroom operations, tele-eligible leads, and other English Centre metrics to begin the deep dive."}
                    </p>
                  </div>
                </div>
                <div className="grid w-full max-w-xl gap-3 sm:gap-4 sm:grid-cols-2">
                  <div className="surface-card rounded-[1.5rem] p-4 shadow-sm sm:col-span-2 sm:p-5">
                    <div className="mb-6 flex items-start justify-between gap-4 sm:mb-10">
                      <img src={tentenIcon} alt="10MS Data Agent" className="h-10 w-10 rounded-xl object-contain" />
                      <span className="label-tech">{mode === "10ms" ? "10MS Data Workspace" : "EC Data Workspace"}</span>
                    </div>
                    <div>
                      <h3 className="headline-agent text-xl sm:text-2xl">{mode === "10ms" ? "Online segment performance" : "Branch Performance Overview"}</h3>
                      <p className="mt-2 text-sm text-[hsl(var(--on-surface-variant))]">
                        {mode === "10ms"
                          ? "Review enrollment-season revenue, product-tier performance, renewal health, and cohort behavior across the 10 Minute School online academic segment."
                          : "Review RTA, admissions, and revenue trends across all branches."}
                      </p>
                    </div>
                  </div>
                  <Suspense fallback={null}>
                    <QueryGuide isBIUser={profile?.role === "BI"} />
                    <ReleaseNotes isBIUser={profile?.role === "BI"} />
                  </Suspense>
                </div>
              </div>
              <div className="mt-4 w-full animate-in fade-in duration-700 delay-500 sm:mt-6">
                <SuggestedMessages mode={mode} onSelect={(msg) => sendMessage(msg)} />
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
                      thinkingDuration={thoughtDurations[msg.id]}
                    />
                  );
                })}
                {isLoading && !streamingMessage && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 flex gap-3 px-2 py-4 duration-300 sm:px-4">
                    <div className="cta-gradient flex h-8 w-8 shrink-0 items-center justify-center rounded-xl">
                      <img src={tentenIcon} alt="10MS Data Agent" className="h-4 w-4 object-contain" />
                    </div>
                    <div className="surface-card flex max-w-[min(32rem,calc(100vw-7rem))] items-start gap-3 rounded-[1.25rem] px-4 py-3 transition-colors duration-300">
                      <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
                      <div className="min-w-0 space-y-1">
                        <span className="block text-sm text-muted-foreground">
                          {!thinkingDurationSeconds || thinkingDurationSeconds <= 0
                            ? (pendingJobId ? "Queued and thinking..." : "Thinking...")
                            : `Thinking for ${thinkingDurationSeconds} ${thinkingDurationSeconds === 1 ? "sec" : "secs"}`}
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
                    thinkingDuration={streamingPreviewMeta.thinkingDuration ?? undefined}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          <ChatInput onSend={(msg, attachmentUrl) => sendMessage(msg, attachmentUrl)} disabled={isLoading} userId={profile?.id} />
        </div>

        {/* Desktop gallery — slide in from right */}
        <div
          className={`relative hidden sm:flex transition-all duration-300 ease-out origin-right ${
            galleryFullscreen
              ? `min-w-0 flex-1 ${galleryOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`
              : `w-[var(--chat-gallery-width)] shrink-0 ${galleryOpen ? "pl-3 opacity-100 scale-x-100" : "pl-0 opacity-0 pointer-events-none"}`
          }`}
        >
          {/* Resize handle — hidden in fullscreen */}
          {!galleryFullscreen && (
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
          )}
          <aside
            className={`surface-recessed flex h-full w-full flex-col px-3 py-4 transition-all duration-300 ease-out ${
              galleryFullscreen ? "rounded-[2rem]" : "rounded-[1.75rem]"
            } ${galleryOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}
          >
            <div className="flex items-center justify-between px-2 pb-3">
              <p className="headline-agent text-xl">Gallery</p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
                  onClick={() => setGalleryFullscreen((fs) => !fs)}
                  title={galleryFullscreen ? "Restore gallery" : "Expand to fullscreen"}
                >
                  {galleryFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full text-muted-foreground transition-transform duration-200 hover:rotate-90 hover:text-foreground"
                  onClick={() => { setGalleryOpen(false); setGalleryFullscreen(false); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {galleryOpen && <ChatGallery key={`desktop-${mode}`} mode={mode} />}
          </aside>
        </div>
      </div>

      {/* Mobile gallery — fullscreen, rendered outside overflow-hidden container */}
      <div
        className={`fixed inset-0 z-50 flex flex-col bg-background transition-all duration-300 ease-out sm:hidden ${
          galleryOpen ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-4">
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
        <div className="flex-1 overflow-y-auto overscroll-y-contain px-3 pb-4 [-webkit-overflow-scrolling:touch]">
          {galleryOpen && <ChatGallery key={`mobile-${mode}`} mode={mode} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;