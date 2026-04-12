import ReactMarkdown from "react-markdown";
import { Children, isValidElement, useMemo, useRef, useState, type ReactNode, lazy, Suspense, memo } from "react";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Check, Copy, Bug, Download, ThumbsDown, ThumbsUp, Code, Database } from "lucide-react";
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
import tentenGlasses from "@/assets/tenten-glasses.png";
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
      const el = section as React.ReactElement<{ children?: ReactNode }>;
      const sectionChildren = Children.toArray(el.props.children).filter(isValidElement);

      return sectionChildren.map((row) => {
        const rowEl = row as React.ReactElement<{ children?: ReactNode }>;
        const cells = Children.toArray(rowEl.props.children).filter(isValidElement);
        return cells.map((cell) => {
          const cellEl = cell as React.ReactElement<{ children?: ReactNode }>;
          return extractText(cellEl.props.children);
        });
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

const MarkdownTable = memo(({ children, title }: { children: ReactNode; title?: string }) => {
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
    <div className="my-3 w-full min-w-0 rounded-[1.35rem] border border-[hsl(var(--outline-ghost)/0.22)] bg-[hsl(var(--surface-high))]/88 backdrop-blur-xl transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-[hsl(var(--surface-high))]/92 dark:bg-[hsl(var(--surface-high))]/72 dark:hover:bg-[hsl(var(--surface-high))]/78">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        {title && (
          <span className="label-tech truncate text-[0.72rem] text-foreground/75">{title}</span>
        )}
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
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
                className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                onClick={handleDownloadTable}
                aria-label={downloaded ? "Downloaded table" : "Download xlsx"}
              >
                {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{downloaded ? "Downloaded table" : "Download xlsx"}</TooltipContent>
          </Tooltip>
          </div>
        </TooltipProvider>
      </div>
      <div className="px-2 pb-2">
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain rounded-[1.1rem] bg-[hsl(var(--surface-lowest))]/88 px-2 py-2 [-webkit-overflow-scrolling:touch]">
          <Table className="min-w-[640px] border-separate border-spacing-y-2 text-sm">
            {children}
          </Table>
        </div>
      </div>
    </div>
  );
});

const normalizeMarkdownContent = (value: string) => {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .trimEnd();
};

const CARTESIAN_TYPES = new Set(["bar", "horizontal_bar", "stacked_bar", "line", "area", "stacked_area"]);
const PIE_TYPES = new Set(["pie", "donut"]);

const isChartSpec = (value: unknown): value is ChartSpec => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const chart = value as Partial<ChartSpec>;

  if (CARTESIAN_TYPES.has(chart.type as string)) {
    return Boolean(
      chart.title &&
      chart.description &&
      (chart as { xKey?: unknown }).xKey &&
      Array.isArray((chart as { series?: unknown }).series) &&
      Array.isArray(chart.data),
    );
  }

  if (PIE_TYPES.has(chart.type as string)) {
    return Boolean(
      chart.title &&
      chart.description &&
      (chart as { labelKey?: unknown }).labelKey &&
      (chart as { valueKey?: unknown }).valueKey &&
      Array.isArray(chart.data),
    );
  }

  if (chart.type === "scatter") {
    return Boolean(
      chart.title &&
      chart.description &&
      (chart as { xKey?: unknown }).xKey &&
      (chart as { yKey?: unknown }).yKey &&
      Array.isArray((chart as { series?: unknown }).series) &&
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
  userRole?: string | null;
  executed_sql?: string | null;
  bq_result?: string | null;
  thinkingDuration?: number;
  onFeedbackChange?: (messageId: string, feedback: "like" | "dislike" | null, feedbackNote?: string | null) => Promise<void>;
}

interface AssistantActionBarProps {
  id: string;
  sessionId?: string;
  userId?: string;
  normalizedContent: string;
  feedback?: "like" | "dislike" | null;
  feedbackNote?: string | null;
  userRole?: string | null;
  executed_sql?: string | null;
  bq_result?: string | null;
  onFeedbackChange?: (messageId: string, feedback: "like" | "dislike" | null, feedbackNote?: string | null) => Promise<void>;
}

const AssistantActionBar = memo(({
  id,
  sessionId,
  userId,
  normalizedContent,
  feedback,
  feedbackNote,
  userRole,
  executed_sql,
  bq_result,
  onFeedbackChange,
}: AssistantActionBarProps) => {
  const isBIUser = userRole === "BI";
  const [copied, setCopied] = useState(false);
  const [debugCopied, setDebugCopied] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [bqCopied, setBqCopied] = useState(false);
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

  const handleCopySql = async () => {
    if (!executed_sql) return;
    await copyToClipboard(executed_sql, "SQL copied", setSqlCopied);
  };

  const handleCopyBqResult = async () => {
    if (!bq_result) return;
    await copyToClipboard(bq_result, "BigQuery result copied", setBqCopied);
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
    <>
      <TooltipProvider delayDuration={150}>
        <div className="mt-3 flex flex-wrap items-center gap-0.5 px-1 text-muted-foreground">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 rounded-full"
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
                className={cn("h-8 w-8 rounded-full", feedback === "like" && "text-emerald-500")}
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
                className={cn("h-8 w-8 rounded-full", feedback === "dislike" && "text-red-500")}
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

          {isBIUser && executed_sql && bq_result && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCopySql}
                    aria-label={sqlCopied ? "Copied code" : "Copy code"}
                  >
                    {sqlCopied ? <Check className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{sqlCopied ? "Copied code" : "Copy code"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={handleCopyBqResult}
                    aria-label={bqCopied ? "Copied results" : "Copy results"}
                  >
                    {bqCopied ? <Check className="h-4 w-4" /> : <Database className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{bqCopied ? "Copied results" : "Copy results"}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </TooltipProvider>

      <Dialog open={dislikeOpen} onOpenChange={setDislikeOpen}>
        <DialogContent className="glass-panel border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="headline-agent text-2xl">Why was this response not helpful?</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share what went wrong so the team can improve future responses.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a short note"
            className="min-h-28"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDislikeOpen(false)} disabled={isSubmittingFeedback}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDislikeSubmit} disabled={isSubmittingFeedback}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

const ChatMessageBubble = memo(({
  id,
  role,
  content,
  sessionId,
  userId,
  feedback,
  feedbackNote,
  userAvatarUrl,
  userInitials = "U",
  userRole,
  executed_sql,
  bq_result,
  thinkingDuration,
  onFeedbackChange,
}: ChatMessageBubbleProps) => {
  const isUser = role === "user";
  const normalizedContent = useMemo(() => normalizeMarkdownContent(content), [content]);
  // Track the last heading rendered so tables can display it as their title
  const lastHeadingRef = useRef<string>("");

  return (
    <div className="fluent-enter w-full min-w-0">
      {!isUser && thinkingDuration != null && thinkingDuration > 0 && (
        <p className="mb-0.5 pl-[3.5rem] text-[0.65rem] tracking-wide text-muted-foreground/35">
          Thought for {thinkingDuration} {thinkingDuration === 1 ? "sec" : "secs"}
        </p>
      )}
      <div className={cn("flex w-full min-w-0 gap-2 px-2 py-3 sm:gap-3 sm:px-4 sm:py-4", isUser ? "justify-end" : "justify-start")}>
        {!isUser && (
          <img src={tentenIcon} alt="10MS Data Agent" className="mt-0.5 h-8 w-8 shrink-0 rounded-xl object-contain" />
        )}
        <div
          className={cn(
            "min-w-0 text-sm transition-all duration-300 ease-out",
            isUser ? "ml-auto max-w-[82vw] sm:max-w-[78%]" : "max-w-[calc(100vw-5.5rem)] flex-1 sm:max-w-[82%]"
          )}
        >
          <div
            className={cn(
              "min-w-0 break-words rounded-[1.5rem] px-4 py-3 shadow-sm",
              isUser
                ? "cta-gradient text-primary-foreground"
                : "surface-card text-foreground"
            )}
          >
        {isUser ? (
          <div className="whitespace-pre-wrap break-words">
            {content.split(/(!\[.*?\]\(.*?\))/).map((part, i) => {
              const imgMatch = /^!\[.*?\]\((.*?)\)$/.exec(part);
              if (imgMatch) {
                return <img key={i} src={imgMatch[1]} alt="attachment" className="mt-2 max-h-48 max-w-full rounded-xl object-contain" />;
              }
              return part ? <span key={i}>{part}</span> : null;
            })}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none w-full min-w-0 overflow-hidden break-words prose-headings:mb-2 prose-headings:mt-4 sm:prose-headings:mb-3 sm:prose-headings:mt-5 prose-p:my-4 sm:prose-p:my-5 prose-ul:my-2 sm:prose-ul:my-3 prose-ol:my-2 sm:prose-ol:my-3 prose-li:my-0.5 sm:prose-li:my-1 prose-blockquote:my-3 sm:prose-blockquote:my-4 prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:pl-3 sm:prose-blockquote:pl-4 prose-blockquote:text-muted-foreground prose-hr:my-4 sm:prose-hr:my-5 prose-hr:border-border prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline [&_code]:rounded-[0.35rem] [&_code]:bg-background/70 [&_code]:px-1 sm:[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.8em] sm:[&_code]:text-[0.85em] [&_pre]:my-3 sm:[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg sm:[&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-background/80 [&_pre]:p-0 [&_pre]:[-webkit-overflow-scrolling:touch] [&>*:first-child]:mt-0 [&>*:first-child]:pt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h1: ({ children }) => { lastHeadingRef.current = extractText(children as ReactNode); return <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{children}</h1>; },
                h2: ({ children }) => { lastHeadingRef.current = extractText(children as ReactNode); return <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{children}</h2>; },
                h3: ({ children }) => { lastHeadingRef.current = extractText(children as ReactNode); return <h3 className="text-base sm:text-lg font-semibold tracking-tight">{children}</h3>; },
                h4: ({ children }) => { lastHeadingRef.current = extractText(children as ReactNode); return <h4 className="text-sm sm:text-base font-semibold tracking-tight">{children}</h4>; },
                p: ({ children }) => <p className="whitespace-pre-wrap leading-7 my-4 sm:my-5 first:mt-0">{children}</p>,
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
                          <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [-webkit-overflow-scrolling:touch]">
                            <Suspense fallback={<div className="my-4 flex w-full flex-col items-center gap-4 rounded-lg border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground"><img src={tentenGlasses} alt="Loading chart" className="h-12 w-12 object-contain opacity-90" /><span>Loading chart...</span></div>}>
                              <MarkdownChartLazy spec={parsed} />
                            </Suspense>
                          </div>
                        );
                      }
                    } catch (error) {
                      // Chart block detected but JSON is incomplete or invalid - show loading instead of code
                      console.error("Failed to parse chart block:", error);
                      return (
                        <div className="my-4 flex w-full flex-col items-center gap-4 rounded-lg border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                          <img src={tentenGlasses} alt="Chart issue" className="h-12 w-12 object-contain opacity-90" />
                          <span>Loading chart...</span>
                        </div>
                      );
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
                pre: ({ children }) => <pre className="max-w-full overflow-x-auto">{children}</pre>,
                table: ({ children }) => {
                  const title = lastHeadingRef.current;
                  lastHeadingRef.current = "";
                  return (
                    <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch]">
                      <MarkdownTable title={title || undefined}>{children}</MarkdownTable>
                    </div>
                  );
                },
                thead: ({ children }) => <TableHeader className="[&_tr]:border-0">{children}</TableHeader>,
                tbody: ({ children }) => <TableBody className="[&_tr:last-child]:border-0">{children}</TableBody>,
                tr: ({ children }) => (
                  <TableRow className="border-0 bg-[hsl(var(--surface-container-low))]/70 hover:bg-[hsl(var(--surface-container-high))]/80">
                    {children}
                  </TableRow>
                ),
                th: ({ children }) => (
                  <TableHead className="h-auto border-0 px-4 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[hsl(var(--on-surface-variant))]">
                    {children}
                  </TableHead>
                ),
                td: ({ children }) => (
                  <TableCell className="border-0 px-4 py-3 text-[0.82rem] text-foreground/88 first:rounded-l-2xl last:rounded-r-2xl">
                    {children}
                  </TableCell>
                ),
              }}
            >
              {normalizedContent}
            </ReactMarkdown>
          </div>
        )}

        {!isUser && (
          <AssistantActionBar
            id={id}
            sessionId={sessionId}
            userId={userId}
            normalizedContent={normalizedContent}
            feedback={feedback}
            feedbackNote={feedbackNote}
            userRole={userRole}
            executed_sql={executed_sql}
            bq_result={bq_result}
            onFeedbackChange={onFeedbackChange}
          />
        )}
          </div>
        </div>
        {isUser && (
          <Avatar className="h-8 w-8 shrink-0 border border-white/10 sm:h-9 sm:w-9">
            <AvatarImage src={userAvatarUrl || undefined} />
            <AvatarFallback className="bg-secondary text-[10px] text-secondary-foreground sm:text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id
    && prevProps.role === nextProps.role
    && prevProps.content === nextProps.content
    && prevProps.sessionId === nextProps.sessionId
    && prevProps.userId === nextProps.userId
    && prevProps.feedback === nextProps.feedback
    && prevProps.feedbackNote === nextProps.feedbackNote
    && prevProps.userAvatarUrl === nextProps.userAvatarUrl
    && prevProps.userInitials === nextProps.userInitials
    && prevProps.userRole === nextProps.userRole
    && prevProps.executed_sql === nextProps.executed_sql
    && prevProps.bq_result === nextProps.bq_result
    && prevProps.thinkingDuration === nextProps.thinkingDuration;
});

export default ChatMessageBubble;
