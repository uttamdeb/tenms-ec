import ReactMarkdown from "react-markdown";
import { useState } from "react";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Bot, Check, Copy, Bug, ThumbsDown, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ChatMessageBubbleProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  sessionId?: string;
  userId?: string;
  feedback?: "like" | "dislike" | null;
  feedbackNote?: string | null;
  userAvatarUrl?: string | null;
  userInitials?: string;
  onFeedbackChange?: (messageId: string, feedback: "like" | "dislike" | null, feedbackNote?: string | null) => Promise<void>;
}

const ChatMessageBubble = ({
  id,
  role,
  content,
  sessionId,
  userId,
  feedback,
  feedbackNote,
  userAvatarUrl,
  userInitials = "U",
  onFeedbackChange,
}: ChatMessageBubbleProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const [debugCopied, setDebugCopied] = useState(false);
  const [dislikeOpen, setDislikeOpen] = useState(false);
  const [note, setNote] = useState(feedback === "dislike" ? feedbackNote || "" : "");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const copyToClipboard = async (value: string, successMessage: string, setFlag: (value: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setFlag(true);
      toast.success(successMessage);
      window.setTimeout(() => setFlag(false), 1500);
    } catch (error) {
      console.error("Clipboard copy failed:", error);
      toast.error("Failed to copy");
    }
  };

  const handleCopyMessage = async () => {
    await copyToClipboard(content, "Response copied", setCopied);
  };

  const handleCopyDebugInfo = async () => {
    const debugInfo = [
      `message_id: ${id}`,
      `session_id: ${sessionId || ""}`,
      `user_id: ${userId || ""}`,
    ].join("\n");

    await copyToClipboard(debugInfo, "Debug info copied", setDebugCopied);
  };

  const handleLike = async () => {
    if (!onFeedbackChange) return;

    setIsSubmittingFeedback(true);
    try {
      const nextFeedback = feedback === "like" ? null : "like";
      await onFeedbackChange(id, nextFeedback, null);
      toast.success(nextFeedback === "like" ? "Marked as helpful" : "Like removed");
    } catch {
      toast.error("Failed to save feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDislikeSubmit = async () => {
    if (!onFeedbackChange) return;

    const trimmedNote = note.trim();
    if (!trimmedNote) {
      toast.error("Please add a note for the dislike");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      await onFeedbackChange(id, "dislike", trimmedNote);
      setDislikeOpen(false);
      toast.success("Feedback saved");
    } catch {
      toast.error("Failed to save feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleDislikeClick = async () => {
    if (!onFeedbackChange) return;

    if (feedback === "dislike") {
      setIsSubmittingFeedback(true);
      try {
        await onFeedbackChange(id, null, null);
        setNote("");
        toast.success("Dislike removed");
      } catch {
        toast.error("Failed to save feedback");
      } finally {
        setIsSubmittingFeedback(false);
      }
      return;
    }

    setDislikeOpen(true);
  };

  return (
    <div className={cn("flex gap-3 py-4 px-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="shrink-0 h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary-foreground" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-4 py-3 text-sm sm:max-w-[80%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:my-2 [&_pre]:bg-background/50 [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:text-xs">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-border">
                    <Table>{children}</Table>
                  </div>
                ),
                thead: ({ children }) => <TableHeader>{children}</TableHeader>,
                tbody: ({ children }) => <TableBody>{children}</TableBody>,
                tr: ({ children }) => <TableRow>{children}</TableRow>,
                th: ({ children }) => <TableHead className="text-xs font-semibold">{children}</TableHead>,
                td: ({ children }) => <TableCell className="text-xs">{children}</TableCell>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={handleCopyMessage}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy text"}</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 px-2 text-xs", feedback === "like" && "text-primary")}
              onClick={handleLike}
              disabled={isSubmittingFeedback}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>Like</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 px-2 text-xs", feedback === "dislike" && "text-destructive")}
              onClick={handleDislikeClick}
              disabled={isSubmittingFeedback}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>Dislike</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs"
              onClick={handleCopyDebugInfo}
            >
              {debugCopied ? <Check className="h-3.5 w-3.5" /> : <Bug className="h-3.5 w-3.5" />}
              <span>{debugCopied ? "Copied" : "Copy debug info"}</span>
            </Button>
          </div>
        )}
      </div>
      {isUser && (
        <Avatar className="shrink-0 h-8 w-8">
          <AvatarImage src={userAvatarUrl || undefined} />
          <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{userInitials}</AvatarFallback>
        </Avatar>
      )}

      <Dialog open={dislikeOpen} onOpenChange={setDislikeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Why was this response not helpful?</DialogTitle>
            <DialogDescription>
              Your note will be stored with the message feedback so the team can review it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a short note about what was wrong or missing"
            className="min-h-28"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDislikeOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDislikeSubmit} disabled={isSubmittingFeedback}>
              Save feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatMessageBubble;
