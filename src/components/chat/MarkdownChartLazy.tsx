import { memo, useMemo } from "react";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
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

const CHART_CONTAINER_CLASS = "my-3 sm:my-4 flex w-full max-w-full min-w-0 flex-col items-center gap-3 sm:gap-4 rounded-lg border border-border bg-muted/20 p-3 sm:p-6 overflow-hidden";
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
      <div className={CHART_CONTAINER_CLASS}>
        <ChartHeader title={spec.title} description={spec.description} />
        <ChartContainer config={pieConfig ?? {}} className="h-[250px] sm:h-[300px] w-full">
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
              label={spec.options?.showLabels}
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
    );
  }

  return (
    <div className={CHART_CONTAINER_CLASS}>
      <ChartHeader title={spec.title} description={spec.description} />
      <ChartContainer config={chartConfig ?? {}} className="h-[250px] sm:h-[300px] w-full">
        {(spec.type === "bar" ? (
          <BarChart data={spec.data}>
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
          <LineChart data={spec.data} margin={{ bottom: 80, top: 10, right: 10, left: 0 }}>
            {spec.options?.showGrid && <CartesianGrid vertical={false} />}
            <XAxis 
              dataKey={spec.xKey} 
              tickLine={false} 
              axisLine={false}
              angle={Number(-45)}
              textAnchor="end"
              height={120} />
            <YAxis tickLine={false} axisLine={false} />
            {spec.options?.showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
            {spec.options?.showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {spec.series.map((item) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                stroke={item.color}
                strokeWidth={2.5}
                dot={{ fill: item.color }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        ))}
      </ChartContainer>
    </div>
  );
});
