import { memo, useMemo, useRef, useCallback, useState } from "react";
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
};

export type CartesianChartSpec = {
  type: "bar" | "line";
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
  type: "pie";
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

export type ChartSpec = CartesianChartSpec | PieChartSpec;

const CHART_CONTAINER_CLASS = "my-3 sm:my-4 flex w-full max-w-full min-w-0 flex-col gap-3 sm:gap-4 overflow-hidden rounded-[1.25rem] border border-border/60 bg-transparent px-2 py-3 sm:px-3 sm:py-4";
const CHART_HEADER_CLASS = "w-full space-y-2";

const buildChartConfig = (series: ChartSeries[]): ChartConfig => {
  return series.reduce<ChartConfig>((config, item) => {
    config[item.key] = {
      label: item.label,
      color: item.color,
    };
    return config;
  }, {});
};

const ChartHeader = memo(({ title, description }: { title: string; description: string }) => (
  <div className={CHART_HEADER_CLASS}>
    <h4 className="text-sm sm:text-base font-semibold text-foreground">{title}</h4>
    <p className="whitespace-normal break-words text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
));

export const MarkdownChart = memo(({ spec }: { spec: ChartSpec }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const renderPieLabel = useCallback(
    ({ name }: { name?: string | number }) => {
      if (!spec.options?.showLabels) return null;
      return typeof name === "string" || typeof name === "number" ? String(name) : null;
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
    if (spec.type !== "pie") return null;

    return {
      [spec.valueKey]: {
        label: spec.options?.valueLabel || spec.valueKey,
        color: "#f59e0b",
      },
    };
  }, [spec]);

  const chartConfig = useMemo<ChartConfig | null>(() => {
    if (spec.type === "pie") return null;
    return buildChartConfig(spec.series);
  }, [spec]);

  if (spec.type === "pie") {
    return (
      <div ref={chartRef} className={CHART_CONTAINER_CLASS}>
        <div className="flex items-start justify-between gap-2">
          <ChartHeader title={spec.title} description={spec.description} />
          <div className="chart-action-btns flex shrink-0 gap-1">
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={copied ? "Copied" : "Copy chart"}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Download chart as PNG"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="w-full min-w-[320px] overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <ChartContainer config={pieConfig ?? {}} className="aspect-auto h-[280px] w-full min-w-[320px] sm:h-[340px]">
            <PieChart>
            {spec.options?.showTooltip && (
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            )}
            {spec.options?.showLegend && <ChartLegend content={<ChartLegendContent />} />}
            <Pie
              data={spec.data}
              dataKey={spec.valueKey}
              nameKey={spec.labelKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={renderPieLabel}
            >
              {spec.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={typeof entry.color === "string" ? entry.color : `hsl(${index * 57} 70% 55%)`}
                />
              ))}
            </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    );
  }

  return (
    <div ref={chartRef} className={CHART_CONTAINER_CLASS}>
      <div className="flex items-start justify-between gap-2">
        <ChartHeader title={spec.title} description={spec.description} />
        <div className="chart-action-btns flex shrink-0 gap-1">
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={copied ? "Copied" : "Copy chart"}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Download chart as PNG"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <ChartContainer config={chartConfig ?? {}} className="aspect-auto h-[300px] w-full min-w-[360px] sm:h-[380px]">
          {(spec.type === "bar" ? (
          <BarChart data={spec.data} width={Math.max(spec.data.length * 88, 360)} height={380} margin={{ top: 12, right: 12, left: 0, bottom: 12 }}>
            {spec.options?.showGrid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tickLine={false} axisLine={false} />
            {spec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
            {spec.options?.showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {spec.series.map((item) => (
              <Bar key={item.key} dataKey={item.key} fill={item.color} radius={[8, 8, 0, 0]} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={spec.data} width={Math.max(spec.data.length * 88, 360)} height={380} margin={{ top: 16, right: 16, bottom: 28, left: 0 }}>
            {spec.options?.showGrid && <CartesianGrid vertical={false} />}
            <XAxis 
              dataKey={spec.xKey} 
              tickLine={false} 
              axisLine={false}
              angle={Number(-45)}
              textAnchor="end"
              minTickGap={24}
              height={72}
              tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} />
            {spec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
            {spec.options?.showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {spec.series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={3.5}
                dot={{ fill: item.color, r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        ))}
        </ChartContainer>
      </div>
    </div>
  );
});
