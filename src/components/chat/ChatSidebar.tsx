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
    <div className="flex flex-col h-full bg-card border-r border-border transition-colors duration-300 ease-in-out">
      <div className="p-3 border-b border-border transition-colors duration-300">
        <Button 
          onClick={onNewChat} 
          variant="outline" 
          className="w-full gap-2 transition-all duration-200 hover:scale-105 active:scale-95" 
          size="sm"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-md text-sm truncate flex items-center gap-2 transition-all duration-200 transform hover:scale-105",
                session.id === currentSessionId
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
