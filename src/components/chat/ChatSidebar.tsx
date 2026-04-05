import { useState, useRef, useEffect } from "react";
import { MessageSquare, Plus, MoreHorizontal, Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/hooks/useChat";

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession?: (id: string) => void;
  onRenameSession?: (id: string, newTitle: string) => void;
}

interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onRename?: (newTitle: string) => void;
}

const SessionItem = ({ session, isActive, onSelect, onDelete, onRename }: SessionItemProps) => {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setDraft(session.title);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [renaming, session.title]);

  const commitRename = () => {
    if (draft.trim() && draft.trim() !== session.title) {
      onRename?.(draft.trim());
    }
    setRenaming(false);
  };

  const cancelRename = () => {
    setDraft(session.title);
    setRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") cancelRename();
  };

  return (
    <div
      className={cn(
        "glass-hover group flex w-full items-center gap-1 rounded-2xl px-2 py-1.5 text-sm transition-all duration-200",
        isActive
          ? "bg-white/10 text-foreground backdrop-blur-sm"
          : "text-[hsl(var(--on-surface-variant))] hover:text-foreground"
      )}
    >
      {renaming ? (
        <div className="flex flex-1 items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Chat name"
            title="Chat name"
            className="min-w-0 flex-1 rounded-md bg-background/60 px-2 py-0.5 text-sm text-foreground outline-none ring-1 ring-primary/40"
          />
          <button type="button" onClick={commitRename} title="Confirm rename" aria-label="Confirm rename" className="shrink-0 text-primary hover:text-primary/80">
            <Check className="h-3.5 w-3.5" />
          </button>
          <button type="button" onClick={cancelRename} title="Cancel rename" aria-label="Cancel rename" className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center gap-2.5 py-0.5 text-left"
        >
          <MessageSquare className="h-4 w-4 shrink-0" />
          <span className="truncate">{session.title}</span>
        </button>
      )}

      {!renaming && (onDelete || onRename) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/15 hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
              aria-label="Session options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onRename && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setRenaming(true);
                }}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
            )}
            {onRename && onDelete && <DropdownMenuSeparator />}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, onRenameSession }: ChatSidebarProps) => {
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
        <div className="space-y-0.5 px-1 pr-2">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onSelect={() => onSelectSession(session.id)}
              onDelete={onDeleteSession ? () => onDeleteSession(session.id) : undefined}
              onRename={onRenameSession ? (t) => onRenameSession(session.id, t) : undefined}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default ChatSidebar;
