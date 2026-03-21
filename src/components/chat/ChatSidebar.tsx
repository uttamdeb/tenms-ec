import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/hooks/useChat";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat }: ChatSidebarProps) => {
  return (
    <aside className="surface-recessed flex h-full flex-col rounded-[1.75rem] px-3 py-4 text-sidebar-foreground">
      <div className="px-2 pb-4">
        <p className="headline-agent text-xl">Recent Chats</p>
        <p className="label-tech mt-1">Last 7 days</p>
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
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "glass-hover flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition-all duration-200",
                session.id === currentSessionId
                  ? "bg-white/10 text-foreground backdrop-blur-sm"
                  : "text-[hsl(var(--on-surface-variant))] hover:text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar;
