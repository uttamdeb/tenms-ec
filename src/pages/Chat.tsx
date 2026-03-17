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
import { Loader2, ArrowLeft, PanelLeftClose, PanelLeft, Plus, Bot } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useRef, useCallback } from "react";

const Chat = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { profile, updateProfile, uploadAvatar } = useProfile();

  const {
    sessions,
    currentSessionId,
    messages,
    isLoading,
    sendMessage,
    createSession,
    selectSession,
  } = useChat();

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate("/auth");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-semibold leading-none">EC Data Agent</h1>
              <p className="text-xs text-muted-foreground">Your data assistant</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          {profile && (
            <ProfileDropdown
              profile={profile}
              onUpdateProfile={updateProfile}
              onUploadAvatar={uploadAvatar}
            />
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className={`${isMobile ? "absolute inset-y-14 left-0 z-40 w-64" : "w-64 shrink-0"}`}>
            <ChatSidebar
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
            />
          </div>
        )}

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && isMobile && (
          <div className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary mx-auto flex items-center justify-center">
                  <Bot className="h-9 w-9 text-primary-foreground" />
                </div>
                <h2 className="text-xl font-semibold">Hello! I'm EC Data Agent</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm here to help you explore and analyze your English Centre data. Ask me anything about branches, students, revenue, and more!
                </p>
              </div>
              <div className="mt-8">
                <SuggestedMessages onSelect={(msg) => sendMessage(msg)} />
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <ChatMessageBubble key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 py-4 px-4">
                    <div className="shrink-0 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          <ChatInput onSend={sendMessage} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
