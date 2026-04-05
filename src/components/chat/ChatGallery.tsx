import { memo, lazy, Suspense, useState, useEffect, useCallback, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
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
}

const CHART_BLOCK_RE = /```chart\s*\n([\s\S]*?)\n```/g;
const TABLE_RE = /(?:^|\n)(\|.+\|(?:\n\|[-: |]+\|)(?:\n\|.+\|)+)/g;
const PAGE_SIZE = 50;

const isChartSpec = (value: unknown): value is ChartSpec => {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<ChartSpec>;
  if (c.type === "bar" || c.type === "line")
    return Boolean(c.title && c.xKey && Array.isArray((c as any).series) && Array.isArray(c.data));
  if (c.type === "pie")
    return Boolean(c.title && (c as any).labelKey && (c as any).valueKey && Array.isArray(c.data));
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

  TABLE_RE.lastIndex = 0;
  while ((match = TABLE_RE.exec(normalized)) !== null) {
    items.push({ messageId, created_at, type: "table", tableMarkdown: match[1].trim() });
  }

  return items;
}

const TablePreview = memo(({ markdown }: { markdown: string }) => {
  const lines = markdown.split("\n").filter(Boolean);
  const headerCells = lines[0]?.split("|").filter((c) => c.trim()).map((c) => c.trim()) || [];
  const dataRows = lines.slice(2).map((line) => line.split("|").filter((c) => c.trim()).map((c) => c.trim()));
  const previewRows = dataRows.slice(0, 5);

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border/60">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40">
            {headerCells.map((cell, i) => (
              <th key={i} className="px-2 py-1.5 text-left font-semibold text-foreground">{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/20 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-2 py-1 text-muted-foreground">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {dataRows.length > 5 && (
        <div className="px-2 py-1 text-[0.625rem] text-muted-foreground/60">+{dataRows.length - 5} more rows</div>
      )}
    </div>
  );
});

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ChatGallery = memo(() => {
  const [items, setItems] = useState<GalleryItem[]>([]);
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
    loadPage(0).finally(() => setLoading(false));
  }, [loadPage]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setLoadingMore(true);
          loadPage(offset).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadPage, offset]);

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
    <ScrollArea className="flex-1">
      <div className="space-y-4 px-2 py-3">
        {items.map((item, idx) => (
          <div key={`${item.messageId}-${idx}`} className="space-y-1.5">
            <p className="label-tech px-1">{formatDate(item.created_at)}</p>
            {item.type === "chart" && item.chartSpec && (
              <Suspense fallback={<div className="flex h-32 items-center justify-center rounded-xl border border-border/40 text-xs text-muted-foreground">Loading chart...</div>}>
                <MarkdownChartLazy spec={item.chartSpec} />
              </Suspense>
            )}
            {item.type === "table" && item.tableMarkdown && (
              <TablePreview markdown={item.tableMarkdown} />
            )}
          </div>
        ))}
        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />
        {loadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

export default ChatGallery;
