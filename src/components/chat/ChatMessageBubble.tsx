import ReactMarkdown from "react-markdown";
import { Children, isValidElement, useMemo, useState, type ReactNode, lazy, Suspense } from "react";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Check, Copy, Bug, Download, ThumbsDown, ThumbsUp } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import tentenIcon from "@/assets/tenten-icon.png";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { type ChartSpec } from "@/components/chat/MarkdownChartLazy";

const MarkdownChartLazy = lazy(() => import("@/components/chat/MarkdownChartLazy").then((m) => ({ default: m.MarkdownChart })));


const extractText = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("").trim();
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return extractText(node.props.children);
  }

  return "";
};

const parseMarkdownTable = (children: ReactNode) => {
  const rows = Children.toArray(children)
    .filter(isValidElement)
    .map((section) => {
      const sectionChildren = Children.toArray(section.props.children).filter(isValidElement);

      return sectionChildren.map((row) => {
        const cells = Children.toArray(row.props.children).filter(isValidElement);
        return cells.map((cell) => extractText(cell.props.children));
      });
    })
    .flat();

  const [header = [], ...body] = rows;

  return {
    header,
    body,
    rows,
  };
};

const MarkdownTable = ({ children }: { children: ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const { header, body, rows } = useMemo(() => parseMarkdownTable(children), [children]);

  const handleCopyTable = async () => {
    const tableText = rows.map((row) => row.join("\t")).join("\n");

    try {
      await navigator.clipboard.writeText(tableText);
      setCopied(true);
      toast.success("Table copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy table:", error);
      toast.error("Failed to copy table");
    }
  };

  const handleDownloadTable = async () => {
    try {
      const XLSX = await import("xlsx");
      const worksheetData = body.length > 0
        ? [header, ...body]
        : rows;
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Table");
      XLSX.writeFile(workbook, `ec-data-agent-table-${Date.now()}.xlsx`);

      setDownloaded(true);
      toast.success("Table downloaded");
      window.setTimeout(() => setDownloaded(false), 1500);
    } catch (error) {
      console.error("Failed to download table:", error);
      toast.error("Failed to download table");
    }
  };

  return (
    <div className="my-2 rounded-lg border border-border">
      <div className="flex items-center justify-end gap-1 border-b border-border/80 px-2 py-1.5">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleCopyTable}
                aria-label={copied ? "Copied table" : "Copy table"}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? "Copied table" : "Copy table"}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={handleDownloadTable}
                aria-label={downloaded ? "Downloaded table" : "Download xlsx"}
              >
                {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{downloaded ? "Downloaded table" : "Download xlsx"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="overflow-x-auto">
        <Table>{children}</Table>
      </div>
    </div>
  );
};

const normalizeMarkdownContent = (value: string) => {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .trimEnd();
};

const isChartSpec = (value: unknown): value is ChartSpec => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const chart = value as Partial<ChartSpec>;

  if (chart.type === "bar" || chart.type === "line") {
    return Boolean(
      chart.title &&
      chart.description &&
      chart.xKey &&
      Array.isArray(chart.series) &&
      Array.isArray(chart.data),
    );
  }

  if (chart.type === "pie") {
    return Boolean(
      chart.title &&
      chart.description &&
      chart.labelKey &&
      chart.valueKey &&
      Array.isArray(chart.data),
    );
  }

  return false;
};

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
  const normalizedContent = useMemo(() => normalizeMarkdownContent(content), [content]);
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
    await copyToClipboard(normalizedContent, "Response copied", setCopied);
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
        <img src={tentenIcon} alt="EC Data Agent" className="shrink-0 h-8 w-8 rounded-lg object-cover" />
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
          <div className="prose prose-sm dark:prose-invert max-w-none break-words prose-headings:mb-3 prose-headings:mt-5 prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-blockquote:my-4 prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-hr:my-5 prose-hr:border-border prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline [&_code]:rounded-[0.35rem] [&_code]:bg-background/70 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-background/80 [&_pre]:p-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold tracking-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold tracking-tight">{children}</h3>,
                h4: ({ children }) => <h4 className="text-base font-semibold tracking-tight">{children}</h4>,
                p: ({ children }) => <p className="whitespace-pre-wrap leading-7">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6">{children}</ol>,
                blockquote: ({ children }) => <blockquote>{children}</blockquote>,
                hr: () => <Separator className="my-5" />,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer noopener">
                    {children}
                  </a>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).replace(/\n$/, "");

                  if (match?.[1] === "chart") {
                    try {
                      const parsed = JSON.parse(codeContent);

                      if (isChartSpec(parsed)) {
                        return (
                          <Suspense fallback={<div className="my-4 rounded-lg border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">Loading chart...</div>}>
                            <MarkdownChartLazy spec={parsed} />
                          </Suspense>
                        );
                      }
                    } catch (error) {
                      // Chart block detected but incomplete/invalid JSON - show loading state instead of code
                      console.error("Failed to parse chart block:", error);
                      return <div className="my-4 rounded-lg border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">Chart loading...</div>;
                    }
                  }

                  if (match) {
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.75rem",
                          background: "transparent",
                          padding: "1rem",
                        }}
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <pre>{children}</pre>,
                table: ({ children }) => <MarkdownTable>{children}</MarkdownTable>,
                thead: ({ children }) => <TableHeader>{children}</TableHeader>,
                tbody: ({ children }) => <TableBody>{children}</TableBody>,
                tr: ({ children }) => <TableRow>{children}</TableRow>,
                th: ({ children }) => <TableHead className="text-xs font-semibold">{children}</TableHead>,
                td: ({ children }) => <TableCell className="text-xs">{children}</TableCell>,
              }}
            >
              {normalizedContent}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && (
          <TooltipProvider delayDuration={150}>
            <div className="mt-3 flex flex-wrap items-center gap-0.5 border-t border-border/60 pt-2.5 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCopyMessage}
                    aria-label={copied ? "Copied" : "Copy text"}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied" : "Copy text"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-full", feedback === "like" && "text-foreground")}
                    onClick={handleLike}
                    disabled={isSubmittingFeedback}
                    aria-label={feedback === "like" ? "Remove like" : "Like response"}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{feedback === "like" ? "Remove like" : "Like"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-full", feedback === "dislike" && "text-foreground")}
                    onClick={handleDislikeClick}
                    disabled={isSubmittingFeedback}
                    aria-label={feedback === "dislike" ? "Remove dislike" : "Dislike response"}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{feedback === "dislike" ? "Remove dislike" : "Dislike"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCopyDebugInfo}
                    aria-label={debugCopied ? "Copied debug info" : "Copy debug info"}
                  >
                    {debugCopied ? <Check className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{debugCopied ? "Copied debug info" : "Copy debug info"}</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
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
