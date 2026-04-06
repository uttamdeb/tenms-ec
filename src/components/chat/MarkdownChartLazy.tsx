import { memo, useMemo, useRef, useCallback, useState, useId } from "react";
import { toPng } from "html-to-image";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  type LegendProps,
} from "recharts";

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type CartesianChartSpec = {
  type: "bar" | "horizontal_bar" | "stacked_bar" | "line" | "area" | "stacked_area";
  title: string;
  description: string;
  xKey: string;
  series: ChartSeries[];
  data: Record<string, string | number>[];
  options?: {
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    yAxisLabel?: string;
  };
};

export type PieChartSpec = {
  type: "pie" | "donut";
  title: string;
  description: string;
  labelKey: string;
  valueKey: string;
  data: Array<Record<string, string | number>>;
  options?: {
    showLegend?: boolean;
    showTooltip?: boolean;
    showLabels?: boolean;
    valueLabel?: string;
  };
};

export type ScatterChartSpec = {
  type: "scatter";
  title: string;
  description: string;
  xKey: string;
  yKey: string;
  series: ChartSeries[];
  data: Record<string, string | number>[];
  options?: {
    showGrid?: boolean;
    showLegend?: boolean;
    showTooltip?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
};

export type ChartSpec = CartesianChartSpec | PieChartSpec | ScatterChartSpec;

const CHART_GLASS_CLASS = "my-3 sm:my-4 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,hsl(var(--surface-container-high))/0.82,hsla(0,0%,0%,0.92))] p-3 shadow-[0_30px_80px_rgba(255,255,255,0.05)] ring-1 ring-white/10 backdrop-blur-xl sm:p-4";
const CHART_HEADER_CLASS = "w-full space-y-2";
const getCartesianChartWidth = (points: number) => Math.max(points * 132, 560);
const getScatterChartWidth = (points: number) => Math.max(points * 72, 520);
const EC_CHART_PALETTE = ["#FBBF24", "#EFC930", "#D9A406", "#F59E0B", "#FCD34D", "#B45309", "#FDE68A", "#CA8A04"];

const formatCompactNumber = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 100_000 ? 0 : 1)}K`;
  return value.toLocaleString();
};

const compactPieLabel = (value: string) =>
  value
    .replace(/^Offline Centre\s+/i, "")
    .replace(/^Online\s+/i, "")
    .trim();

const getSeriesColor = (color: string | undefined, index: number) => color || EC_CHART_PALETTE[index % EC_CHART_PALETTE.length];

const PIE_SWATCH_CLASSES = [
  "bg-[#10b981]",
  "bg-[#3b82f6]",
  "bg-[#d946ef]",
  "bg-[#f97316]",
  "bg-[#64748b]",
  "bg-[#14b8a6]",
  "bg-[#8b5cf6]",
  "bg-[#f43f5e]",
  "bg-[#eab308]",
  "bg-[#06b6d4]",
];

const PieLegend = memo(({ items }: { items: Array<{ label: string; fullLabel: string; value: number; percent: number }> }) => {
  return (
    <div className="grid gap-2.5 rounded-[1.25rem] bg-[hsl(var(--surface-container-high))]/55 p-3 shadow-[0_24px_60px_rgba(255,255,255,0.04)] ring-1 ring-white/10 backdrop-blur-md">
      {items.map((item, index) => (
        <div key={item.fullLabel} className="flex items-start gap-3 rounded-[1rem] px-2 py-2 transition-colors hover:bg-white/10 hover:backdrop-blur-sm">
          <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${PIE_SWATCH_CLASSES[index % PIE_SWATCH_CLASSES.length]}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-5 text-foreground">{item.label}</p>
              <span className="label-tech shrink-0 text-[0.68rem] text-foreground/70">{item.percent.toFixed(1)}%</span>
            </div>
            <p className="mt-1 text-xs text-[hsl(var(--on-surface-variant))]">{formatCompactNumber(item.value)}</p>
          </div>
        </div>
      ))}
    </div>
  );
});

const buildChartConfig = (series: ChartSeries[]): ChartConfig => {
  return series.reduce<ChartConfig>((config, item) => {
    config[item.key] = {
      label: item.label,
      color: item.color,
    };
    return config;
  }, {});
};

const isPieLike = (spec: ChartSpec): spec is PieChartSpec => spec.type === "pie" || spec.type === "donut";
const isScatter = (spec: ChartSpec): spec is ScatterChartSpec => spec.type === "scatter";
const isHorizontalBar = (spec: ChartSpec): spec is CartesianChartSpec => spec.type === "horizontal_bar";
const isStackedBar = (spec: ChartSpec): spec is CartesianChartSpec => spec.type === "stacked_bar";
const isAreaLike = (spec: ChartSpec): spec is CartesianChartSpec => spec.type === "area" || spec.type === "stacked_area" || spec.type === "line";
const isStackedArea = (spec: ChartSpec): spec is CartesianChartSpec => spec.type === "stacked_area";

const ChartHeader = memo(({ title, description }: { title: string; description: string }) => (
  <div className={CHART_HEADER_CLASS}>
    <h4 className="text-sm sm:text-base font-semibold text-foreground">{title}</h4>
    <p className="whitespace-normal break-words text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
));

export const MarkdownChart = memo(({ spec }: { spec: ChartSpec }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const uid = useId().replace(/:/g, "");

  const renderPieLabel = useCallback(
    ({
      percent,
      value,
    }: {
      percent?: number;
      value?: string | number;
    }) => {
      if (!(spec.options as PieChartSpec['options'])?.showLabels) return null;

      if (typeof value !== "number" || !percent || percent < 0.12) {
        return null;
      }

      return `${Math.round(percent * 100)}%`;
    },
    [spec]
  );

  const getBgColor = useCallback(() => {
    // Read the actual --background CSS variable from the document so we respect the current theme
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
    // CSS variable is in HSL format like "0 0% 9%" — convert to hsl()
    return raw ? `hsl(${raw})` : (document.documentElement.classList.contains("dark") ? "#0e0e0e" : "#ffffff");
  }, []);

  const handleCopy = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const btn = chartRef.current.querySelector(".chart-action-btns") as HTMLElement | null;
      if (btn) btn.style.display = "none";
      const dataUrl = await toPng(chartRef.current, { backgroundColor: getBgColor(), pixelRatio: 2 });
      if (btn) btn.style.display = "";
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      toast.success("Chart copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy chart:", err);
      toast.error("Failed to copy chart");
    }
  }, [getBgColor]);

  const handleDownload = useCallback(async () => {
    if (!chartRef.current) return;
    try {
      const btns = chartRef.current.querySelector(".chart-action-btns") as HTMLElement | null;
      if (btns) btns.style.display = "none";
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: getBgColor(),
        pixelRatio: 2,
      });
      if (btns) btns.style.display = "";
      const link = document.createElement("a");
      link.download = `${spec.title.replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download chart:", err);
    }
  }, [spec.title, getBgColor]);

  // Hooks must be unconditional; compute both configs and use the one we need.
  const pieConfig = useMemo<ChartConfig | null>(() => {
    if (!isPieLike(spec)) return null;

    return {
      [spec.valueKey]: {
        label: spec.options?.valueLabel || spec.valueKey,
        color: "#f59e0b",
      },
    };
  }, [spec]);

  const chartConfig = useMemo<ChartConfig | null>(() => {
    if (isPieLike(spec)) return null;
    return buildChartConfig(spec.series);
  }, [spec]);

  const pieLegendItems = useMemo(() => {
    if (!isPieLike(spec)) return [];

    const total = spec.data.reduce((sum, item) => {
      const raw = item[spec.valueKey];
      return sum + (typeof raw === "number" ? raw : Number(raw) || 0);
    }, 0);

    return spec.data.map((item, index) => {
      const rawValue = item[spec.valueKey];
      const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue) || 0;
      const rawLabel = String(item[spec.labelKey] ?? `Item ${index + 1}`);
      const label = compactPieLabel(rawLabel);
      const percent = total > 0 ? (numericValue / total) * 100 : 0;
      const color = getSeriesColor(typeof item.color === "string" ? item.color : undefined, index);

      return {
        label,
        fullLabel: rawLabel,
        value: numericValue,
        percent,
        color,
      };
    });
  }, [spec]);

  if (isPieLike(spec)) {
    return (
      <div
        ref={chartRef}
        className="my-3 sm:my-4 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,hsl(var(--surface-container-high))/0.82,hsla(0,0%,0%,0.92))] p-3 shadow-[0_30px_80px_rgba(255,255,255,0.05)] ring-1 ring-white/10 backdrop-blur-xl sm:p-4"
      >
        <div className="flex items-start justify-between gap-2">
          <ChartHeader title={spec.title} description={spec.description} />
          <div className="chart-action-btns flex shrink-0 gap-1">
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title={copied ? "Copied" : "Copy chart"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Download chart as PNG"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] lg:items-center">
          <div className="min-w-0 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <ChartContainer config={pieConfig ?? {}} className="aspect-auto h-[320px] w-full min-w-[320px] sm:h-[360px]">
              <PieChart>
                {spec.options?.showTooltip && (
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        className="border-white/10 bg-[hsl(var(--surface-container-high))]/80 shadow-[0_24px_60px_rgba(255,255,255,0.05)] backdrop-blur-xl"
                        formatter={(itemValue, itemName) => (
                          <div className="flex min-w-[11rem] items-center justify-between gap-3">
                            <span className="text-[hsl(var(--on-surface-variant))]">{String(itemName)}</span>
                            <span className="font-mono font-semibold text-foreground">{Number(itemValue).toLocaleString()}</span>
                          </div>
                        )}
                      />
                    }
                  />
                )}
                <Pie
                  data={spec.data}
                  dataKey={spec.valueKey}
                  nameKey={spec.labelKey}
                  cx="50%"
                  cy="50%"
                  innerRadius={spec.type === "donut" ? 58 : 44}
                  outerRadius={112}
                  paddingAngle={2}
                  stroke="transparent"
                  labelLine={false}
                  label={renderPieLabel}
                >
                  {spec.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getSeriesColor(typeof entry.color === "string" ? entry.color : undefined, index)}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {spec.options?.showLegend && pieLegendItems.length > 0 && <PieLegend items={pieLegendItems} />}
        </div>
      </div>
    );
  }

  if (isScatter(spec)) {
    return (
      <div ref={chartRef} className={CHART_GLASS_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <ChartHeader title={spec.title} description={spec.description} />
          <div className="chart-action-btns flex shrink-0 gap-1">
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title={copied ? "Copied" : "Copy chart"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              title="Download chart as PNG"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <ChartContainer config={chartConfig ?? {}} className="aspect-auto h-[320px] w-full min-w-[360px]">
            <ScatterChart width={getScatterChartWidth(spec.data.length)} height={320} margin={{ top: 16, right: 16, bottom: 8, left: 4 }}>
              {spec.options?.showGrid && <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />}
              <XAxis dataKey={spec.xKey} type="number" tickLine={false} axisLine={false} height={36} tickMargin={8} />
              <YAxis dataKey={spec.yKey} type="number" tickLine={false} axisLine={false} width={44} />
              <ZAxis range={[60, 60]} />
              {spec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[hsl(var(--surface-container-high))]/80 shadow-[0_24px_60px_rgba(255,255,255,0.05)] backdrop-blur-xl" />} />}
              {spec.options?.showLegend && <Legend content={<ChartLegendContent className="pt-4 text-[0.72rem] uppercase tracking-[0.08em] text-[hsl(var(--on-surface-variant))]" />} />}
              {spec.series.map((item, index) => (
                <Scatter key={item.key} name={item.label} data={spec.data} fill={getSeriesColor(item.color, index)} />
              ))}
            </ScatterChart>
          </ChartContainer>
        </div>
      </div>
    );
  }

  const cartSpec = spec as CartesianChartSpec;

  return (
    <div ref={chartRef} className={CHART_GLASS_CLASS}>
      <div className="flex items-start justify-between gap-2">
        <ChartHeader title={cartSpec.title} description={cartSpec.description} />
        <div className="chart-action-btns flex shrink-0 gap-1">
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            title={copied ? "Copied" : "Copy chart"}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            title="Download chart as PNG"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <ChartContainer config={chartConfig ?? {}} className="aspect-auto h-[320px] w-full min-w-[360px]">
          {isHorizontalBar(cartSpec) ? (
            <BarChart data={cartSpec.data} layout="vertical" width={getCartesianChartWidth(cartSpec.data.length)} height={Math.max(cartSpec.data.length * 56, 320)} margin={{ top: 12, right: 16, left: 24, bottom: 4 }}>
              {cartSpec.options?.showGrid && <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />}
              <XAxis type="number" tickLine={false} axisLine={false} />
              <YAxis dataKey={cartSpec.xKey} type="category" tickLine={false} axisLine={false} width={180} />
              {cartSpec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[hsl(var(--surface-container-high))]/80 shadow-[0_24px_60px_rgba(255,255,255,0.05)] backdrop-blur-xl" />} />}
              {cartSpec.options?.showLegend && <ChartLegend content={<ChartLegendContent className="pt-4 text-[0.72rem] uppercase tracking-[0.08em] text-[hsl(var(--on-surface-variant))]" />} />}
              {cartSpec.series.map((item, index) => (
                <Bar key={item.key} dataKey={item.key} fill={getSeriesColor(item.color, index)} radius={[0, 6, 6, 0]} />
              ))}
            </BarChart>
          ) : cartSpec.type === "bar" || isStackedBar(cartSpec) ? (
            <BarChart data={cartSpec.data} width={getCartesianChartWidth(cartSpec.data.length)} height={320} margin={{ top: 12, right: 16, left: 4, bottom: 4 }}>
              {cartSpec.options?.showGrid && <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />}
              <XAxis
                dataKey={cartSpec.xKey}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
                tickMargin={8}
                minTickGap={10}
              />
              <YAxis tickLine={false} axisLine={false} width={44} />
              {cartSpec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[hsl(var(--surface-container-high))]/80 shadow-[0_24px_60px_rgba(255,255,255,0.05)] backdrop-blur-xl" />} />}
              {cartSpec.options?.showLegend && <ChartLegend content={<ChartLegendContent className="pt-4 text-[0.72rem] uppercase tracking-[0.08em] text-[hsl(var(--on-surface-variant))]" />} />}
              {cartSpec.series.map((item, index) => (
                <Bar key={item.key} dataKey={item.key} fill={getSeriesColor(item.color, index)} radius={[6, 6, 0, 0]} stackId={isStackedBar(cartSpec) ? "stack" : undefined} />
              ))}
            </BarChart>
          ) : (
            <AreaChart data={cartSpec.data} width={getCartesianChartWidth(cartSpec.data.length)} height={320} margin={{ top: 16, right: 16, bottom: 4, left: 4 }}>
              <defs>
                {cartSpec.series.map((item, index) => {
                  const color = getSeriesColor(item.color, index);
                  return (
                    <linearGradient key={item.key} id={`area-grad-${uid}-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="90%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  );
                })}
              </defs>
              {cartSpec.options?.showGrid && <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />}
              <XAxis
                dataKey={cartSpec.xKey}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                minTickGap={10}
                height={60}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={44} />
              {cartSpec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[hsl(var(--surface-container-high))]/80 shadow-[0_24px_60px_rgba(255,255,255,0.05)] backdrop-blur-xl" />} />}
              {cartSpec.options?.showLegend && <ChartLegend content={<ChartLegendContent className="pt-4 text-[0.72rem] uppercase tracking-[0.08em] text-[hsl(var(--on-surface-variant))]" />} />}
              {cartSpec.series.map((item, index) => {
                const color = getSeriesColor(item.color, index);
                return (
                  <Area
                    key={item.key}
                    type="monotone"
                    dataKey={item.key}
                    stroke={color}
                    strokeWidth={isAreaLike(cartSpec) && cartSpec.type === "line" ? 2.5 : 2.2}
                    fill={cartSpec.type === "line" ? "transparent" : `url(#area-grad-${uid}-${item.key})`}
                    stackId={isStackedArea(cartSpec) ? "stack" : undefined}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                  />
                );
              })}
            </AreaChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
});
