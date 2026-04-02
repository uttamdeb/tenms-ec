import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/hooks/useChat";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession?: (id: string) => void;
}

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession }: ChatSidebarProps) => {
  return (
    <aside className="surface-recessed flex h-full flex-col rounded-[1.75rem] px-3 py-4 text-sidebar-foreground">
      <div className="px-2 pb-4">
        <p className="headline-agent text-xl">Recent Chats</p>
      </div>
      <div className="px-2 pb-4">
        <Button 
          onClick={onNewChat} 
          variant="outline" 
          className="w-full justify-start gap-2 bg-transparent" 
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 px-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "glass-hover group grid w-full grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-all duration-200",
                session.id === currentSessionId
                  ? "bg-white/10 text-foreground backdrop-blur-sm"
                  : "text-[hsl(var(--on-surface-variant))] hover:text-foreground"
              )}
            >
              <button
                onClick={() => onSelectSession(session.id)}
                className="flex min-w-0 items-center gap-3 py-1 text-left"
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{session.title}</span>
              </button>
              {onDeleteSession && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="flex h-8 w-8 items-center justify-center justify-self-end rounded-lg border border-border/60 bg-background/40 text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Delete session"
                  aria-label="Delete session"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar;
