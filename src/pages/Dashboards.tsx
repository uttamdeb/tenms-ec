import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  LayoutDashboard,
  Loader2,
  Maximize2,
  Minimize2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileDropdown from "@/components/profile/ProfileDropdown";
import { useProfile } from "@/hooks/useProfile";
import { useDashboards } from "@/hooks/useDashboards";
import { cn } from "@/lib/utils";
import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardElement,
  type DashboardMode,
  type DashboardSize,
  getChatPath,
  normalizeDashboardMode,
  toJson,
} from "@/lib/dashboardTypes";
import type { ChartSpec } from "@/components/chat/MarkdownChartLazy";
import tentenIcon from "@/assets/tenten-icon.png";
import tentenGlasses from "@/assets/tenten-glasses.png";
import { runWithViewTransition } from "@/lib/viewTransitions";

const MarkdownChartLazy = lazy(() =>
  import("@/components/chat/MarkdownChartLazy").then((m) => ({ default: m.MarkdownChart }))
);

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getRecord = (value: unknown): JsonRecord => isRecord(value) ? value : {};

const getLayoutSize = (element: DashboardElement): DashboardSize => {
  const layout = getRecord(element.layout);
  const size = layout.size;
  if (size === "small" || size === "medium" || size === "large") return size;
  const width = typeof layout.w === "number" ? layout.w : 6;
  if (width >= 10) return "large";
  if (width <= 4) return "small";
  return "medium";
};

const gridSpanClass: Record<DashboardSize, string> = {
  small: "md:col-span-4",
  medium: "md:col-span-6",
  large: "md:col-span-12",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const parseTableMarkdown = (markdown: string) => {
  const parseRow = (line: string) => {
    const cells = line.split("|");
    const innerCells = cells.length > 2 ? cells.slice(1, -1) : cells;
    return innerCells.map((cell) => cell.trim());
  };
  const lines = markdown.split("\n").filter(Boolean);
  const header = lines[0] ? parseRow(lines[0]) : [];
  const rows = lines.slice(2).map(parseRow);
  return { header, rows };
};

const getDateRange = (filters: unknown) => {
  const dateRange = getRecord(getRecord(filters).dateRange);
  return {
    startDate: typeof dateRange.startDate === "string" ? dateRange.startDate : "",
    endDate: typeof dateRange.endDate === "string" ? dateRange.endDate : "",
  };
};

const DashboardTable = ({ markdown }: { markdown: string }) => {
  const { header, rows } = useMemo(() => parseTableMarkdown(markdown), [markdown]);

  if (header.length === 0) {
    return <p className="text-sm text-muted-foreground">This table has no previewable rows.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-[1rem] border border-[hsl(var(--outline-ghost)/0.18)] bg-[hsl(var(--surface-lowest))]/60">
      <table className="min-w-[640px] w-full text-sm">
        <thead>
          <tr>
            {header.map((cell, cellIndex) => (
              <th key={`${cell}-${cellIndex}`} className="px-3 py-2 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 10).map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-[hsl(var(--surface-container-low))]/50 even:bg-[hsl(var(--surface-lowest))]/35">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="whitespace-nowrap px-3 py-2 text-foreground/85">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 10 && (
        <p className="px-3 py-2 text-xs text-muted-foreground">+{rows.length - 10} more rows</p>
      )}
    </div>
  );
};

const DashboardTile = ({
  element,
  onResize,
  onRemove,
}: {
  element: DashboardElement;
  onResize: (size: DashboardSize) => void;
  onRemove: () => void;
}) => {
  const content = getRecord(element.content);
  const visualSpec = getRecord(element.visual_spec);
  const size = getLayoutSize(element);
  const chartSpec = (content.chartSpec ?? visualSpec) as ChartSpec | undefined;
  const tableMarkdown = typeof content.tableMarkdown === "string" ? content.tableMarkdown : "";
  const text = typeof content.text === "string" ? content.text : "";

  return (
    <article className={cn("surface-card col-span-1 flex min-h-[18rem] flex-col rounded-[1.35rem] p-4 shadow-sm", gridSpanClass[size])}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="label-tech text-[0.62rem] text-primary">{element.element_type}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-foreground">{element.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">Added {formatDateTime(element.created_at)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {(["small", "medium", "large"] as DashboardSize[]).map((item) => (
            <Button
              key={item}
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-full", size === item && "bg-primary/10 text-primary")}
              onClick={() => onResize(item)}
              title={`Resize ${item}`}
            >
              {item === "large" ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
            onClick={onRemove}
            title="Remove tile"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {element.element_type === "chart" && chartSpec && (
          <div className="h-full min-w-0 overflow-x-auto">
            <Suspense fallback={<div className="flex h-48 items-center justify-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>}>
              <MarkdownChartLazy spec={chartSpec} />
            </Suspense>
          </div>
        )}
        {element.element_type === "table" && tableMarkdown && <DashboardTable markdown={tableMarkdown} />}
        {element.element_type === "text" && (
          <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/85">{text}</p>
        )}
        {!chartSpec && !tableMarkdown && !text && (
          <div className="flex h-44 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
            <img src={tentenGlasses} alt="Empty dashboard tile" className="h-10 w-10 object-contain opacity-90" />
            <span>This tile does not have preview data yet.</span>
          </div>
        )}
      </div>
    </article>
  );
};

const Dashboards = () => {
  const navigate = useNavigate();
  const { mode: modeParam } = useParams();
  const mode = normalizeDashboardMode(modeParam) as DashboardMode;
  const [authLoading, setAuthLoading] = useState(true);
  const [creatingName, setCreatingName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const isBIUser = profile?.role === "BI";
  const {
    dashboards,
    activeDashboard,
    activeElements,
    loading,
    busy,
    setActiveDashboardId,
    createDashboard,
    renameDashboard,
    updateDashboardFilters,
    archiveDashboard,
    resizeElement,
    removeElement,
    refreshDashboard,
  } = useDashboards(mode, Boolean(isBIUser));

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) runWithViewTransition(() => navigate("/auth"));
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) runWithViewTransition(() => navigate("/auth"));
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!profileLoading && profile && !isBIUser) {
      runWithViewTransition(() => navigate(getChatPath(mode), { replace: true }));
    }
  }, [isBIUser, mode, navigate, profile, profileLoading]);

  useEffect(() => {
    if (!activeDashboard) return;
    setRenameValue(activeDashboard.name);
    const range = getDateRange(activeDashboard.filters);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [activeDashboard]);

  const handleCreate = async () => {
    try {
      const dashboard = await createDashboard(creatingName || `${mode === "10ms" ? "10MS" : "EC"} Dashboard`);
      setCreatingName("");
      toast.success(`${dashboard.name} created`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create dashboard");
    }
  };

  const handleRename = async () => {
    if (!activeDashboard || !renameValue.trim()) return;
    try {
      await renameDashboard(activeDashboard.id, renameValue);
      toast.success("Dashboard renamed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to rename dashboard");
    }
  };

  const handleSaveFilters = async () => {
    if (!activeDashboard) return;
    try {
      await updateDashboardFilters(activeDashboard.id, toJson({
        ...getRecord(activeDashboard.filters),
        dateRange: {
          preset: "custom",
          startDate,
          endDate,
        },
      }));
      toast.success("Dashboard filters saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save filters");
    }
  };

  const handleRefresh = async () => {
    if (!activeDashboard) return;
    try {
      const filters = toJson({
        ...getRecord(activeDashboard.filters ?? DEFAULT_DASHBOARD_FILTERS),
        dateRange: {
          preset: startDate || endDate ? "custom" : "last_7_days",
          startDate,
          endDate,
        },
      });
      await updateDashboardFilters(activeDashboard.id, filters);
      await refreshDashboard(activeDashboard.id, filters);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to refresh dashboard");
    }
  };

  const handleArchive = async () => {
    if (!activeDashboard) return;
    if (!window.confirm(`Remove dashboard "${activeDashboard.name}"?`)) return;
    try {
      await archiveDashboard(activeDashboard.id);
      toast.success("Dashboard removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove dashboard");
    }
  };

  if (authLoading || profileLoading || (isBIUser && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isBIUser) {
    return null;
  }

  return (
    <div className="surface-shell flex min-h-screen flex-col text-foreground">
      <header className="relative z-10 flex shrink-0 flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img src={tentenIcon} alt="10MS Data Agent" className="h-9 w-9 rounded-xl object-contain" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="headline-agent truncate text-[1.45rem] leading-none sm:text-[1.75rem]">Dashboards</h1>
              <span className="label-tech rounded-full bg-primary/10 px-2 py-1 text-[0.58rem] text-primary">
                {mode === "10ms" ? "10MS" : "EC"}
              </span>
            </div>
            <p className="label-tech mt-1 truncate">BI WORKSPACE | MANUAL REFRESH ONLY</p>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button variant="ghost" size="sm" onClick={() => runWithViewTransition(() => navigate(getChatPath(mode)))}>
            <ArrowLeft className="h-4 w-4" />
            <span className="ml-1">Chat</span>
          </Button>
          <ThemeToggle />
          {profile && (
            <ProfileDropdown profile={profile} onUpdateProfile={updateProfile} onUploadAvatar={uploadAvatar} />
          )}
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col gap-3 overflow-hidden px-2 pb-2 sm:px-4 sm:pb-4 lg:flex-row">
        <aside className="surface-panel flex shrink-0 flex-col gap-4 rounded-[1.5rem] p-4 lg:w-80">
          <div className="space-y-2">
            <p className="label-tech">Your dashboards</p>
            <div className="flex gap-2">
              <Input
                value={creatingName}
                maxLength={80}
                onChange={(event) => setCreatingName(event.target.value)}
                placeholder="New dashboard"
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleCreate();
                }}
              />
              <Button type="button" size="icon" onClick={handleCreate} title="Create dashboard">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 space-y-2 overflow-y-auto">
            {dashboards.map((dashboard) => (
              <button
                key={dashboard.id}
                type="button"
                onClick={() => setActiveDashboardId(dashboard.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors",
                  activeDashboard?.id === dashboard.id
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border/60 bg-background/35 text-foreground hover:bg-white/5",
                )}
              >
                <span className="min-w-0 truncate text-sm font-medium">{dashboard.name}</span>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
              </button>
            ))}

            {dashboards.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                Pin a chart or table from chat, or create a dashboard here.
              </div>
            )}
          </div>
        </aside>

        <section className="surface-panel min-w-0 flex-1 overflow-hidden rounded-[1.5rem]">
          {!activeDashboard ? (
            <div className="flex h-full min-h-[28rem] items-center justify-center px-6 text-center">
              <div className="max-w-sm space-y-3">
                <img src={tentenGlasses} alt="No dashboard" className="mx-auto h-14 w-14 object-contain opacity-90" />
                <h2 className="headline-agent text-2xl">No dashboard yet</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  BI users can save charts, tables, and answers from chat into dashboards. Each workspace can have up to 10 dashboards.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col overflow-hidden">
              <div className="shrink-0 space-y-3 bg-[hsl(var(--surface-lowest))]/24 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0 space-y-2">
                    <p className="label-tech">Dashboard setup</p>
                    <div className="flex max-w-xl gap-2">
                      <Input
                        value={renameValue}
                        maxLength={80}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleRename();
                        }}
                      />
                      <Button type="button" variant="secondary" size="icon" onClick={handleRename} title="Save name">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={handleArchive} title="Remove dashboard">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-1">
                        <span className="label-tech text-[0.58rem]">Start date</span>
                        <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                      </label>
                      <label className="space-y-1">
                        <span className="label-tech text-[0.58rem]">End date</span>
                        <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
                      </label>
                    </div>
                    <Button type="button" variant="secondary" onClick={handleSaveFilters}>
                      <CalendarDays className="h-4 w-4" />
                      <span className="ml-1">Save Filter</span>
                    </Button>
                    <Button type="button" onClick={handleRefresh} disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      <span className="ml-1">Re-fetch</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {activeElements.length === 0 ? (
                  <div className="flex min-h-[24rem] items-center justify-center rounded-[1.25rem] border border-dashed border-border/70 px-6 text-center">
                    <div className="max-w-sm space-y-3">
                      <LayoutDashboard className="mx-auto h-10 w-10 text-primary" />
                      <h3 className="headline-agent text-xl">Add dashboard tiles from chat</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Use the plus button on a chart, table, gallery item, or answer to save it here.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    {activeElements.map((element) => (
                      <DashboardTile
                        key={element.id}
                        element={element}
                        onResize={(size) => {
                          resizeElement(element, size).catch((error) => {
                            toast.error(error instanceof Error ? error.message : "Failed to resize tile");
                          });
                        }}
                        onRemove={() => {
                          removeElement(element.id).catch((error) => {
                            toast.error(error instanceof Error ? error.message : "Failed to remove tile");
                          });
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboards;
