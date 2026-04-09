import { memo, lazy, Suspense, useState, useEffect, useCallback, useRef } from "react";
import { Loader2, Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type ChartSpec } from "@/components/chat/MarkdownChartLazy";

const MarkdownChartLazy = lazy(() =>
  import("@/components/chat/MarkdownChartLazy").then((m) => ({ default: m.MarkdownChart }))
);

interface GalleryItem {
  messageId: string;
  created_at: string;
  type: "chart" | "table";
  chartSpec?: ChartSpec;
  tableMarkdown?: string;
  tableTitle?: string;
}

const CHART_BLOCK_RE = /```chart\s*\n([\s\S]*?)\n```/g;
const TABLE_RE = /(?:^|\n)(\|.+\|(?:\n\|[-: |]+\|)(?:\n\|.+\|)+)/g;
const PAGE_SIZE = 50;
const RENDER_BATCH_SIZE = 6;

const CARTESIAN_CHART_TYPES = new Set(["bar", "horizontal_bar", "stacked_bar", "line", "area", "stacked_area"]);
const PIE_CHART_TYPES = new Set(["pie", "donut"]);

const isChartSpec = (value: unknown): value is ChartSpec => {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<ChartSpec>;
  if (CARTESIAN_CHART_TYPES.has(c.type as string))
    return Boolean(c.title && (c as any).xKey && Array.isArray((c as any).series) && Array.isArray(c.data));
  if (PIE_CHART_TYPES.has(c.type as string))
    return Boolean(c.title && (c as any).labelKey && (c as any).valueKey && Array.isArray(c.data));
  if (c.type === "scatter")
    return Boolean(c.title && (c as any).xKey && (c as any).yKey && Array.isArray((c as any).series) && Array.isArray(c.data));
  return false;
};

function extractFromContent(messageId: string, created_at: string, content: string): GalleryItem[] {
  const items: GalleryItem[] = [];
  const normalized = content
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\r\n/g, "\n")
    .trimEnd();

  let match: RegExpExecArray | null;
  CHART_BLOCK_RE.lastIndex = 0;
  while ((match = CHART_BLOCK_RE.exec(normalized)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (isChartSpec(parsed)) items.push({ messageId, created_at, type: "chart", chartSpec: parsed });
    } catch { /* skip */ }
  }

  // For tables, find the nearest preceding heading (# / ## / ###)
  const HEADING_RE = /^#{1,4}\s+(.+)$/m;
  TABLE_RE.lastIndex = 0;
  while ((match = TABLE_RE.exec(normalized)) !== null) {
    const before = normalized.slice(0, match.index);
    const headingMatch = before.match(/#{1,4}\s+(.+)$/m);
    const tableTitle = headingMatch ? headingMatch[1].replace(/\*\*/g, "").trim() : undefined;
    items.push({ messageId, created_at, type: "table", tableMarkdown: match[1].trim(), tableTitle });
  }
  void HEADING_RE;

  return items;
}

const TablePreview = memo(({ markdown, title }: { markdown: string; title?: string }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const lines = markdown.split("\n").filter(Boolean);
  const headerCells = lines[0]?.split("|").filter((c) => c.trim()).map((c) => c.trim()) || [];
  const dataRows = lines.slice(2).map((line) => line.split("|").filter((c) => c.trim()).map((c) => c.trim()));
  const previewRows = dataRows.slice(0, 5);
  const allRows = [headerCells, ...dataRows];

  const handleCopy = async () => {
    try {
      const text = allRows.map((row) => row.join("\t")).join("\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Table copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy table");
    }
  };

  const handleDownload = async () => {
    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.aoa_to_sheet(allRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Table");
      XLSX.writeFile(workbook, `ec-data-agent-table-${Date.now()}.xlsx`);
      setDownloaded(true);
      toast.success("Table downloaded");
      window.setTimeout(() => setDownloaded(false), 1500);
    } catch {
      toast.error("Failed to download table");
    }
  };

  return (
    <div className="rounded-[1.1rem] border border-[hsl(var(--outline-ghost)/0.22)] bg-[hsl(var(--surface-high))]/82 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-[hsl(var(--surface-high))]/88 dark:bg-[hsl(var(--surface-high))]/70 dark:hover:bg-[hsl(var(--surface-high))]/76">
      <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] touch-pan-x">
        <div className="min-w-[720px]">
          <div className="flex items-center justify-between gap-2 border-b border-[hsl(var(--outline-ghost)/0.18)] px-3 py-2">
          {title && <span className="min-w-0 truncate text-xs font-semibold text-foreground/80">{title}</span>}
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? "Copied" : "Copy table"}
              aria-label={copied ? "Copied" : "Copy table"}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              title={downloaded ? "Downloaded" : "Download xlsx"}
              aria-label={downloaded ? "Downloaded" : "Download xlsx"}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {downloaded ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            </button>
          </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40">
                {headerCells.map((cell, i) => (
                  <th key={i} className="whitespace-nowrap px-3 py-1.5 text-left font-semibold text-foreground">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, ri) => (
                <tr key={ri} className="border-b border-border/20 last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="whitespace-nowrap px-3 py-1.5 text-muted-foreground">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {dataRows.length > 5 && (
            <div className="px-3 py-1 text-[0.625rem] text-muted-foreground/60">+{dataRows.length - 5} more rows</div>
          )}
        </div>
      </div>
    </div>
  );
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ChatGallery = memo(({ mode }: { mode: "ec" | "10ms" }) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(RENDER_BATCH_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (currentOffset: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, content, created_at, role")
      .eq("user_id", user.id)
      .eq("mode", mode)
      .eq("role", "assistant")
      .order("created_at", { ascending: false })
      .range(currentOffset, currentOffset + PAGE_SIZE - 1);

    if (error || !data) return;

    const newItems: GalleryItem[] = [];
    for (const msg of data) {
      newItems.push(...extractFromContent(msg.id, msg.created_at, msg.content));
    }

    setItems((prev) => currentOffset === 0 ? newItems : [...prev, ...newItems]);
    setHasMore(data.length === PAGE_SIZE);
    setOffset(currentOffset + data.length);
  }, []);

  // Initial load
  useEffect(() => {
    setLoading(true);
    setVisibleCount(RENDER_BATCH_SIZE);
    loadPage(0).finally(() => setLoading(false));
  }, [loadPage, mode]);

  const hasMoreVisibleItems = visibleCount < items.length;

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        if (hasMoreVisibleItems) {
          setVisibleCount((current) => Math.min(current + RENDER_BATCH_SIZE, items.length));
          return;
        }

        if (!loadingMore && hasMore) {
          setLoadingMore(true);
          loadPage(offset).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, hasMoreVisibleItems, items.length, loadingMore, loadPage, offset]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">No charts or tables yet.</p>
          <p className="text-xs text-muted-foreground/60">Charts and tables generated by the AI will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto overscroll-y-contain px-2 py-3 [-webkit-overflow-scrolling:touch]">
      <div className="space-y-4">
        {items.slice(0, visibleCount).map((item, idx) => (
          <div key={`${item.messageId}-${idx}`} className="space-y-1.5">
            <p className="label-tech px-1">{formatDate(item.created_at)}</p>
            {item.type === "chart" && item.chartSpec && (
              <Suspense fallback={<div className="flex h-32 items-center justify-center rounded-xl border border-border/40 text-xs text-muted-foreground">Loading chart...</div>}>
                <MarkdownChartLazy spec={item.chartSpec} />
              </Suspense>
            )}
            {item.type === "table" && item.tableMarkdown && (
              <TablePreview markdown={item.tableMarkdown} title={item.tableTitle} />
            )}
          </div>
        ))}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />
        {(hasMoreVisibleItems || loadingMore) && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatGallery;
