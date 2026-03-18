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

const buildChartConfig = (series: ChartSeries[]): ChartConfig => {
  return series.reduce<ChartConfig>((config, item) => {
    config[item.key] = {
      label: item.label,
      color: item.color,
    };
    return config;
  }, {});
};

export const MarkdownChart = ({ spec }: { spec: ChartSpec }) => {
  if (spec.type === "pie") {
    const pieConfig: ChartConfig = {
      [spec.valueKey]: {
        label: spec.options?.valueLabel || spec.valueKey,
        color: "#f59e0b",
      },
    };

    return (
      <div className="my-4 flex w-full flex-col items-center gap-4 rounded-lg border border-border bg-muted/20 p-6">
        <div className="w-full space-y-2">
          <h4 className="text-base font-semibold text-foreground">{spec.title}</h4>
          <p className="whitespace-normal break-words text-sm text-muted-foreground leading-relaxed">{spec.description}</p>
        </div>
        <ChartContainer config={pieConfig} className="h-[300px] w-full">
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
              outerRadius={110}
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

  const chartConfig = buildChartConfig(spec.series);

  return (
    <div className="my-4 flex w-full flex-col items-center gap-4 rounded-lg border border-border bg-muted/20 p-6">
      <div className="w-full space-y-2">
        <h4 className="text-base font-semibold text-foreground">{spec.title}</h4>
        <p className="whitespace-normal break-words text-sm text-muted-foreground leading-relaxed">{spec.description}</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        {spec.type === "bar" ? (
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
          <LineChart data={spec.data}>
            {spec.options?.showGrid && <CartesianGrid vertical={false} />}
            <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} minTickGap={24} />
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
        )}
      </ChartContainer>
    </div>
  );
};
