import type { ChartSpec } from "@/components/chat/MarkdownChartLazy";
import type { Json } from "@/integrations/supabase/types";

export type DashboardQueryRun = {
  id: string;
  message_id: string;
  agent_sql_run_id: string | null;
  query_index: number;
  raw_sql: string;
  result_schema: Json;
  result_rows: Json;
  result_text: string | null;
};

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const singularKey = (value: string) => value.replace(/s(?=[a-z0-9]|$)/g, "");

const keyMatches = (candidate: unknown, target: unknown) => {
  const c = normalizeKey(candidate);
  const t = normalizeKey(target);
  if (!c || !t) return false;
  const cs = singularKey(c);
  const ts = singularKey(t);
  return c === t || cs === ts || c.includes(t) || t.includes(c) || cs.includes(ts) || ts.includes(cs);
};

const schemaFieldsFromResultText = (resultText: string | null) => {
  if (!resultText) return [];

  try {
    const parsed = JSON.parse(resultText);
    if (!isRecord(parsed)) return [];
    const schema = parsed.schema;
    if (!isRecord(schema) || !Array.isArray(schema.fields)) return [];
    return schema.fields
      .map((field) => isRecord(field) && typeof field.name === "string" ? field.name : null)
      .filter((field): field is string => Boolean(field));
  } catch {
    return [];
  }
};

export const getQueryRunFieldNames = (run: DashboardQueryRun) => {
  const schema = run.result_schema;
  if (Array.isArray(schema) && schema.length > 0) {
    return schema
      .map((field) => {
        if (typeof field === "string") return field;
        if (isRecord(field) && typeof field.name === "string") return field.name;
        return null;
      })
      .filter((field): field is string => Boolean(field));
  }

  return schemaFieldsFromResultText(run.result_text);
};

const scoreRun = (run: DashboardQueryRun, desiredKeys: string[]) => {
  const fields = getQueryRunFieldNames(run);
  const normalizedSql = normalizeKey(run.raw_sql);

  return desiredKeys.reduce((score, key) => {
    if (!key) return score;
    const fieldMatch = fields.some((field) => keyMatches(field, key));
    if (fieldMatch) return score + 3;
    if (normalizedSql.includes(normalizeKey(key))) return score + 1;
    return score;
  }, 0);
};

const bestRunForKeys = (runs: DashboardQueryRun[] | undefined, desiredKeys: string[]) => {
  if (!runs || runs.length === 0) return null;
  if (runs.length === 1) return runs[0];

  const scoredRuns = runs
    .map((run) => ({ run, score: scoreRun(run, desiredKeys) }))
    .sort((a, b) => b.score - a.score || a.run.query_index - b.run.query_index);

  return scoredRuns[0]?.score > 0 ? scoredRuns[0].run : runs[0];
};

export const chooseQueryRunForChart = (runs: DashboardQueryRun[] | undefined, spec: ChartSpec) => {
  const specRecord = spec as unknown as JsonRecord;
  const desiredKeys: string[] = [];

  if (typeof specRecord.xKey === "string") desiredKeys.push(specRecord.xKey);
  if (typeof specRecord.yKey === "string") desiredKeys.push(specRecord.yKey);
  if (typeof specRecord.labelKey === "string") desiredKeys.push(specRecord.labelKey);
  if (typeof specRecord.valueKey === "string") desiredKeys.push(specRecord.valueKey);

  if (Array.isArray(specRecord.series)) {
    for (const item of specRecord.series) {
      if (!isRecord(item)) continue;
      if (typeof item.key === "string") desiredKeys.push(item.key);
      if (typeof item.label === "string") desiredKeys.push(item.label);
    }
  }

  return bestRunForKeys(runs, desiredKeys);
};

export const chooseQueryRunForTable = (runs: DashboardQueryRun[] | undefined, headers: string[]) =>
  bestRunForKeys(runs, headers);
