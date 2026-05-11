import type { ChartSpec } from "@/components/chat/MarkdownChartLazy";
import type { Json, Tables } from "@/integrations/supabase/types";

export type DashboardMode = "ec" | "10ms";
export type DashboardElementType = "chart" | "table" | "text" | "kpi";
export type DashboardSize = "small" | "medium" | "large";

export type Dashboard = Tables<"dashboards">;
export type DashboardElement = Tables<"dashboard_elements">;

export type DashboardLayout = {
  x?: number;
  y?: number;
  w: number;
  h: number;
  size?: DashboardSize;
};

export type DashboardPinPayload = {
  type: DashboardElementType;
  title: string;
  mode: DashboardMode;
  sourceMessageId?: string | null;
  sourceSqlRunId?: string | null;
  sourceQueryRunId?: string | null;
  visualSpec?: ChartSpec | Record<string, unknown>;
  content: {
    chartSpec?: ChartSpec;
    tableMarkdown?: string;
    text?: string;
    rows?: string[][];
    rawMarkdown?: string;
  };
  queryConfig?: Record<string, unknown>;
  layout?: DashboardLayout;
};

export const DASHBOARD_LIMIT_PER_MODE = 10;

export const DEFAULT_DASHBOARD_FILTERS = {
  dateRange: {
    preset: "last_7_days",
  },
};

export const DASHBOARD_SIZE_LAYOUTS: Record<DashboardSize, DashboardLayout> = {
  small: { x: 0, y: 0, w: 4, h: 3, size: "small" },
  medium: { x: 0, y: 0, w: 6, h: 4, size: "medium" },
  large: { x: 0, y: 0, w: 12, h: 5, size: "large" },
};

export const toJson = (value: unknown): Json => JSON.parse(JSON.stringify(value)) as Json;

export const getDashboardPath = (mode: DashboardMode, dashboardId?: string | null) =>
  dashboardId ? `/dashboards/${mode}/${dashboardId}` : `/dashboards/${mode}`;

export const getChatPath = (mode: DashboardMode) => (mode === "10ms" ? "/10ms-chat" : "/ec-chat");

export const normalizeDashboardMode = (mode: string | undefined): DashboardMode =>
  mode === "10ms" ? "10ms" : "ec";

export const getElementTitle = (payload: DashboardPinPayload) => {
  const title = payload.title?.trim();
  if (title) return title.slice(0, 120);
  if (payload.type === "chart") return "Pinned chart";
  if (payload.type === "table") return "Pinned table";
  return "Pinned response";
};
