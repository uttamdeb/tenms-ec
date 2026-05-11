import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const DEFAULT_REFRESH_WEBHOOK_URL = "https://n8n-prod.10minuteschool.com/webhook/dashboard-refresh-agent";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type JsonRecord = Record<string, unknown>;

type DashboardElementRow = {
  id: string;
  dashboard_id: string;
  user_id: string;
  mode: string;
  element_type: "chart" | "table" | "text" | "kpi" | string;
  title: string;
  source_sql_run_id: string | null;
  source_query_run_id: string | null;
  visual_spec: unknown;
  query_config: unknown;
  content: unknown;
};

type AgentQueryRunRow = {
  id: string;
  raw_sql: string;
  result_schema: unknown;
  result_rows: unknown;
  result_text: string | null;
};

type AgentSqlRunRow = {
  id: string;
  executed_sql: string;
};

type BqField = {
  name: string;
  type?: string;
};

type BqResult = {
  schema?: {
    fields?: BqField[];
  };
  rows?: Array<{ f?: Array<{ v?: unknown }> } | JsonRecord>;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getRecord = (value: unknown): JsonRecord => isRecord(value) ? value : {};

const buildServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, serviceRoleKey);
};

const buildUserClient = (authHeader: string) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
};

const buildMirrorClient = () => {
  const mirrorUrl = Deno.env.get("MIRROR_SUPABASE_URL");
  const mirrorKey = Deno.env.get("MIRROR_SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("MIRROR_SUPABASE_KEY");

  if (!mirrorUrl || !mirrorKey) {
    return null;
  }

  return createClient(mirrorUrl, mirrorKey);
};

const mirrorInsert = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[],
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).insert(payload);
  if (error) {
    console.warn(`[mirror] insert ${table} failed:`, error.message);
  }
};

const mirrorUpdate = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown>,
  id: string,
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).update(payload).eq("id", id);
  if (error) {
    console.warn(`[mirror] update ${table} failed:`, error.message);
  }
};

const mirrorUpsert = async (
  mirror: ReturnType<typeof buildMirrorClient>,
  table: string,
  payload: Record<string, unknown>,
  onConflict: string,
) => {
  if (!mirror) return;

  const { error } = await mirror.from(table).upsert(payload, { onConflict });
  if (error) {
    console.warn(`[mirror] upsert ${table} failed:`, error.message);
  }
};

const sanitizeDate = (value: unknown) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";

const getDateRange = (filters: unknown) => {
  const dateRange = getRecord(getRecord(filters).dateRange);
  return {
    startDate: sanitizeDate(dateRange.startDate),
    endDate: sanitizeDate(dateRange.endDate),
  };
};

const formatDateForLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00Z`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};

const formatRangeLabel = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return "";
  if (startDate === endDate) return formatDateForLabel(startDate);
  return `${formatDateForLabel(startDate)} to ${formatDateForLabel(endDate)}`;
};

const trimSql = (sql: string) => sql.trim().replace(/;+\s*$/g, "");

const pickFirstSqlStatement = (sql: string) => {
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const selectStatement = statements.find((statement) => /^(with|select)\b/i.test(statement));
  return trimSql(selectStatement ?? statements[0] ?? sql);
};

const rewriteSqlForDateRange = (sql: string, startDate: string, endDate: string) => {
  const baseSql = trimSql(sql);
  if (!startDate || !endDate) {
    return { sql: baseSql, rewritten: false, warning: "No custom date range was provided." };
  }

  const between = `BETWEEN DATE '${startDate}' AND DATE '${endDate}'`;
  let rewrittenSql = baseSql;
  let rewritten = false;

  const replace = (pattern: RegExp, build: (match: string, ...groups: string[]) => string) => {
    rewrittenSql = rewrittenSql.replace(pattern, (match: string, ...args: unknown[]) => {
      rewritten = true;
      const groups = args.slice(0, -2).map((value) => String(value));
      return build(match, ...groups);
    });
  };

  replace(
    /DATE\s*\(([^()]+)\)\s*=\s*CURRENT_DATE\s*\(\s*\)\s*(?:-\s*\d+)?/gi,
    (_match, dateExpression) => `DATE(${dateExpression}) ${between}`,
  );

  replace(
    /DATE\s*\(([^()]+)\)\s*=\s*DATE_SUB\s*\(\s*CURRENT_DATE\s*\(\s*\)\s*,\s*INTERVAL\s+\d+\s+DAY\s*\)/gi,
    (_match, dateExpression) => `DATE(${dateExpression}) ${between}`,
  );

  replace(
    /DATE\s*\(([^()]+)\)\s+BETWEEN\s+DATE_SUB\s*\(\s*CURRENT_DATE\s*\(\s*\)\s*,\s*INTERVAL\s+\d+\s+DAY\s*\)\s+AND\s+CURRENT_DATE\s*\(\s*\)/gi,
    (_match, dateExpression) => `DATE(${dateExpression}) ${between}`,
  );

  replace(
    /DATE\s*\(([^()]+)\)\s+BETWEEN\s+DATE\s*['"]\d{4}-\d{2}-\d{2}['"]\s+AND\s+DATE\s*['"]\d{4}-\d{2}-\d{2}['"]/gi,
    (_match, dateExpression) => `DATE(${dateExpression}) ${between}`,
  );

  replace(
    /DATE\s*\(([^()]+)\)\s*=\s*DATE\s*['"]\d{4}-\d{2}-\d{2}['"]/gi,
    (_match, dateExpression) => `DATE(${dateExpression}) ${between}`,
  );

  return {
    sql: rewrittenSql,
    rewritten,
    warning: rewritten ? null : "No supported date filter pattern was found in the saved SQL.",
  };
};

const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const singularKey = (value: string) => value.replace(/s(?=[a-z0-9]|$)/g, "");

const keyMatches = (candidate: string, target: string) => {
  const c = normalizeKey(candidate);
  const t = normalizeKey(target);
  const cs = singularKey(c);
  const ts = singularKey(t);
  return c === t || cs === ts || c.includes(t) || t.includes(c) || cs.includes(ts) || ts.includes(cs);
};

const parseBqValue = (value: unknown, fieldType: string | undefined) => {
  if (value === null || value === undefined) return "";
  const type = String(fieldType ?? "").toUpperCase();
  if (["INTEGER", "INT64", "FLOAT", "FLOAT64", "NUMERIC", "BIGNUMERIC"].includes(type)) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : value;
  }
  if (type === "BOOLEAN" || type === "BOOL") {
    return value === true || value === "true";
  }
  return value;
};

const parseBigQueryResult = (value: unknown): BqResult => {
  if (isRecord(value)) {
    const result = getRecord(value.result);
    const structuredContent = result.structuredContent ?? value.structuredContent;
    if (isRecord(structuredContent)) return structuredContent as BqResult;

    const content = Array.isArray(result.content)
      ? result.content
      : Array.isArray(value.content)
        ? value.content
        : [];
    const firstText = content
      .map((item) => getRecord(item).text)
      .find((item) => typeof item === "string");
    if (typeof firstText === "string") {
      try {
        const parsed = JSON.parse(firstText);
        if (isRecord(parsed)) return parsed as BqResult;
      } catch {
        // Fall through to the direct value.
      }
    }
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (isRecord(parsed)) return parsed as BqResult;
    } catch {
      return {};
    }
  }

  return isRecord(value) ? value as BqResult : {};
};

const normalizeRows = (bqResult: BqResult) => {
  const fields = Array.isArray(bqResult.schema?.fields) ? bqResult.schema.fields : [];
  const rows = Array.isArray(bqResult.rows) ? bqResult.rows : [];

  if (fields.length === 0) {
    return rows.filter(isRecord);
  }

  return rows.map((row) => {
    if (isRecord(row) && !Array.isArray(row.f)) return row;

    const cells = isRecord(row) && Array.isArray(row.f) ? row.f : [];
    return fields.reduce<JsonRecord>((record, field, index) => {
      const cell = getRecord(cells[index]);
      record[field.name] = parseBqValue(cell.v, field.type);
      return record;
    }, {});
  });
};

const getFields = (bqResult: BqResult, rows: JsonRecord[]) => {
  const schemaFields = Array.isArray(bqResult.schema?.fields) ? bqResult.schema.fields : [];
  if (schemaFields.length > 0) return schemaFields;

  const firstRow = rows[0] ?? {};
  return Object.keys(firstRow).map((name) => ({ name, type: typeof firstRow[name] === "number" ? "FLOAT" : "STRING" }));
};

const titleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const escapeTableCell = (value: unknown) =>
  String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

const buildTableMarkdown = (fields: BqField[], rows: JsonRecord[]) => {
  if (fields.length === 0) return "";

  const header = fields.map((field) => titleCase(field.name));
  const separator = fields.map(() => "---");
  const body = rows.map((row) => fields.map((field) => escapeTableCell(row[field.name])));

  return [header, separator, ...body]
    .map((cells) => `| ${cells.join(" | ")} |`)
    .join("\n");
};

const findFieldName = (fields: BqField[], requestedKey: string, rows: JsonRecord[]) => {
  const names = fields.length > 0 ? fields.map((field) => field.name) : Object.keys(rows[0] ?? {});
  return names.find((name) => keyMatches(name, requestedKey))
    ?? names.find((name) => keyMatches(requestedKey, name))
    ?? null;
};

const findFirstTextField = (fields: BqField[], rows: JsonRecord[]) => {
  const names = fields.length > 0 ? fields.map((field) => field.name) : Object.keys(rows[0] ?? {});
  return names.find((name) => typeof rows[0]?.[name] === "string")
    ?? names[0]
    ?? null;
};

const findFirstNumberField = (fields: BqField[], rows: JsonRecord[]) => {
  const names = fields.length > 0 ? fields.map((field) => field.name) : Object.keys(rows[0] ?? {});
  return names.find((name) => typeof rows[0]?.[name] === "number")
    ?? names.find((name) => rows.some((row) => Number.isFinite(Number(row[name]))))
    ?? null;
};

const updateChartSpecData = (chartSpec: unknown, fields: BqField[], rows: JsonRecord[], rangeLabel: string) => {
  if (!isRecord(chartSpec)) return chartSpec;

  const nextSpec = JSON.parse(JSON.stringify(chartSpec)) as JsonRecord;
  const type = String(nextSpec.type ?? "");

  if (type === "pie" || type === "donut") {
    const labelKey = typeof nextSpec.labelKey === "string" ? nextSpec.labelKey : "";
    const valueKey = typeof nextSpec.valueKey === "string" ? nextSpec.valueKey : "";
    const sourceLabelKey = findFieldName(fields, labelKey, rows) ?? findFirstTextField(fields, rows);
    const sourceValueKey = findFieldName(fields, valueKey, rows) ?? findFirstNumberField(fields, rows);

    if (sourceLabelKey && sourceValueKey) {
      nextSpec.data = rows.map((row) => ({
        [labelKey || sourceLabelKey]: row[sourceLabelKey],
        [valueKey || sourceValueKey]: Number(row[sourceValueKey]) || 0,
      }));
    }
  } else if (type === "scatter") {
    const xKey = typeof nextSpec.xKey === "string" ? nextSpec.xKey : "";
    const yKey = typeof nextSpec.yKey === "string" ? nextSpec.yKey : "";
    const sourceXKey = findFieldName(fields, xKey, rows) ?? findFirstNumberField(fields, rows);
    const sourceYKey = findFieldName(fields, yKey, rows) ?? findFirstNumberField(fields, rows);
    const series = Array.isArray(nextSpec.series) ? nextSpec.series : [];

    if (sourceXKey && sourceYKey) {
      nextSpec.data = rows.map((row) => {
        const datum: JsonRecord = {
          [xKey || sourceXKey]: Number(row[sourceXKey]) || 0,
          [yKey || sourceYKey]: Number(row[sourceYKey]) || 0,
        };
        for (const item of series) {
          const key = String(getRecord(item).key ?? "");
          if (key) datum[key] = row[key] ?? row[sourceYKey] ?? 0;
        }
        return datum;
      });
    }
  } else {
    const xKey = typeof nextSpec.xKey === "string" ? nextSpec.xKey : "";
    const sourceXKey = findFieldName(fields, xKey, rows) ?? findFirstTextField(fields, rows);
    const series = Array.isArray(nextSpec.series) ? nextSpec.series : [];

    if (sourceXKey && series.length > 0) {
      nextSpec.data = rows.map((row) => {
        const datum: JsonRecord = {
          [xKey || sourceXKey]: row[sourceXKey],
        };

        for (const item of series) {
          const seriesRecord = getRecord(item);
          const key = String(seriesRecord.key ?? "");
          const label = String(seriesRecord.label ?? key);
          const sourceSeriesKey = findFieldName(fields, key, rows) ?? findFieldName(fields, label, rows);
          if (key && sourceSeriesKey) {
            datum[key] = Number(row[sourceSeriesKey]) || 0;
          }
        }

        return datum;
      });
    }
  }

  if (rangeLabel) {
    nextSpec.description = `Updated for ${rangeLabel}.`;
  }

  return nextSpec;
};

const hashFilters = async (filters: unknown) => {
  const encoded = new TextEncoder().encode(JSON.stringify(filters ?? {}));
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const loadRowsById = async <T extends { id: string }>(
  supabase: ReturnType<typeof buildServiceClient>,
  table: string,
  select: string,
  ids: string[],
) => {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map<string, T>();

  const { data, error } = await supabase
    .from(table)
    .select(select)
    .in("id", uniqueIds);

  if (error) throw error;
  return new Map((data ?? []).map((row: T) => [row.id, row]));
};

const getSavedSql = (
  element: DashboardElementRow,
  queryRunsById: Map<string, AgentQueryRunRow>,
  sqlRunsById: Map<string, AgentSqlRunRow>,
) => {
  const queryConfig = getRecord(element.query_config);
  const queryRun = element.source_query_run_id ? queryRunsById.get(element.source_query_run_id) : null;
  const sqlRun = element.source_sql_run_id ? sqlRunsById.get(element.source_sql_run_id) : null;

  const configuredSql = typeof queryConfig.rawSql === "string"
    ? queryConfig.rawSql
    : typeof queryConfig.executedSql === "string"
      ? queryConfig.executedSql
      : "";

  return queryRun?.raw_sql || configuredSql || sqlRun?.executed_sql || "";
};

const refreshElement = async (
  element: DashboardElementRow,
  filters: unknown,
  queryRunsById: Map<string, AgentQueryRunRow>,
  sqlRunsById: Map<string, AgentSqlRunRow>,
) => {
  const sourceSql = getSavedSql(element, queryRunsById, sqlRunsById);
  if (!sourceSql.trim()) {
    throw new Error("No saved SQL was found for this tile.");
  }

  const firstStatementSql = pickFirstSqlStatement(sourceSql);
  const { startDate, endDate } = getDateRange(filters);
  const rewrite = rewriteSqlForDateRange(firstStatementSql, startDate, endDate);
  const webhookUrl = Deno.env.get("DASHBOARD_REFRESH_WEBHOOK_URL") || DEFAULT_REFRESH_WEBHOOK_URL;
  const callbackSecret = Deno.env.get("AGENT_CALLBACK_SECRET");

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(callbackSecret ? { "x-agent-callback-secret": callbackSecret } : {}),
    },
    body: JSON.stringify({
      elementId: element.id,
      dashboardId: element.dashboard_id,
      mode: element.mode,
      sql: rewrite.sql,
      filters,
    }),
  });

  const responseText = await response.text();
  let responseBody: unknown = null;
  if (responseText) {
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = { text: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(`n8n refresh failed (${response.status}): ${responseText.slice(0, 240)}`);
  }

  const bqPayload = getRecord(responseBody).result ?? getRecord(responseBody).bigQuery ?? responseBody;
  const bqResult = parseBigQueryResult(bqPayload);
  const rows = normalizeRows(bqResult);
  const fields = getFields(bqResult, rows);
  const rangeLabel = formatRangeLabel(startDate, endDate);
  const currentContent = getRecord(element.content);
  const currentVisualSpec = getRecord(element.visual_spec);

  let nextContent: JsonRecord = { ...currentContent };
  let nextVisualSpec: unknown = element.visual_spec;

  if (element.element_type === "chart") {
    const currentChartSpec = currentContent.chartSpec ?? currentVisualSpec;
    const nextChartSpec = updateChartSpecData(currentChartSpec, fields, rows, rangeLabel);
    nextContent = {
      ...nextContent,
      chartSpec: nextChartSpec,
      lastResultRows: rows,
      lastFilters: filters,
      refreshedAt: new Date().toISOString(),
    };
    nextVisualSpec = nextChartSpec;
  } else if (element.element_type === "table") {
    nextContent = {
      ...nextContent,
      tableMarkdown: buildTableMarkdown(fields, rows),
      lastResultRows: rows,
      lastFilters: filters,
      refreshedAt: new Date().toISOString(),
    };
  } else {
    nextContent = {
      ...nextContent,
      lastResultRows: rows,
      lastFilters: filters,
      refreshedAt: new Date().toISOString(),
    };
  }

  const queryConfig = getRecord(element.query_config);
  const nextQueryConfig = {
    ...queryConfig,
    refreshable: true,
    lastExecutedSql: rewrite.sql,
    lastSourceSql: firstStatementSql,
    lastDateRewriteApplied: rewrite.rewritten,
    lastDateRewriteWarning: rewrite.warning,
    lastRefreshAt: new Date().toISOString(),
    lastRefreshStatus: "completed",
  };

  return {
    content: nextContent,
    visualSpec: nextVisualSpec,
    queryConfig: nextQueryConfig,
    rows,
    fields,
    executedSql: rewrite.sql,
    rewriteWarning: rewrite.warning,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userSupabase = buildUserClient(authHeader);
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { dashboardId, mode, filters } = await req.json();
    if (!dashboardId || typeof dashboardId !== "string") {
      return jsonResponse({ error: "Missing required field: dashboardId" }, 400);
    }

    const supabase = buildServiceClient();
    const mirror = buildMirrorClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "BI") {
      return jsonResponse({ error: "Dashboards are only available to BI users" }, 403);
    }

    const { data: dashboard, error: dashboardError } = await supabase
      .from("dashboards")
      .select("id, user_id, mode, filters, archived_at")
      .eq("id", dashboardId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dashboardError || !dashboard || dashboard.archived_at) {
      return jsonResponse({ error: "Dashboard not found" }, 404);
    }

    if (mode && mode !== dashboard.mode) {
      return jsonResponse({ error: "Dashboard mode mismatch" }, 400);
    }

    const appliedFilters = filters ?? dashboard.filters ?? {};

    const { data: elements, error: elementsError } = await supabase
      .from("dashboard_elements")
      .select("id, dashboard_id, user_id, mode, element_type, title, source_sql_run_id, source_query_run_id, visual_spec, query_config, content")
      .eq("dashboard_id", dashboard.id)
      .eq("user_id", user.id)
      .order("position", { ascending: true })
      .returns<DashboardElementRow[]>();

    if (elementsError) {
      console.error("Failed to load dashboard elements:", elementsError);
      return jsonResponse({ error: "Failed to load dashboard elements" }, 500);
    }

    const refreshableElements = (elements ?? []).filter((element) => {
      const queryConfig = getRecord(element.query_config);
      return queryConfig.refreshable === true;
    });

    const now = new Date().toISOString();
    const { data: job, error: jobError } = await supabase
      .from("dashboard_refresh_jobs")
      .insert({
        dashboard_id: dashboard.id,
        user_id: user.id,
        mode: dashboard.mode,
        status: "running",
        filters: appliedFilters,
        element_ids: refreshableElements.map((element) => element.id),
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (jobError || !job) {
      console.error("Failed to create dashboard refresh job:", jobError);
      return jsonResponse({ error: "Failed to create dashboard refresh job" }, 500);
    }

    await mirrorInsert(mirror, "dashboard_refresh_jobs", job as Record<string, unknown>);

    if (refreshableElements.length === 0) {
      const completedAt = new Date().toISOString();
      const completionPayload = {
        status: "completed",
        completed_at: completedAt,
        updated_at: completedAt,
        error: "No refreshable dashboard elements were found.",
      };

      await supabase.from("dashboard_refresh_jobs").update(completionPayload).eq("id", job.id);
      await mirrorUpdate(mirror, "dashboard_refresh_jobs", completionPayload, job.id);

      return jsonResponse({
        ok: true,
        jobId: job.id,
        refreshed: 0,
        failed: 0,
        message: "No refreshable dashboard tiles found.",
      });
    }

    const queryRunsById = await loadRowsById<AgentQueryRunRow>(
      supabase,
      "agent_query_runs",
      "id, raw_sql, result_schema, result_rows, result_text",
      refreshableElements.map((element) => element.source_query_run_id ?? ""),
    );
    const sqlRunsById = await loadRowsById<AgentSqlRunRow>(
      supabase,
      "agent_sql_runs",
      "id, executed_sql",
      refreshableElements.map((element) => element.source_sql_run_id ?? ""),
    );

    const filterHash = await hashFilters(appliedFilters);
    const refreshedElementIds: string[] = [];
    const failures: Array<{ elementId: string; title: string; error: string }> = [];
    const warnings: Array<{ elementId: string; title: string; warning: string }> = [];

    for (const element of refreshableElements) {
      try {
        const result = await refreshElement(element, appliedFilters, queryRunsById, sqlRunsById);
        const updatedAt = new Date().toISOString();
        const updatePayload = {
          content: result.content,
          visual_spec: result.visualSpec,
          query_config: result.queryConfig,
          updated_at: updatedAt,
        };

        const { error: updateError } = await supabase
          .from("dashboard_elements")
          .update(updatePayload)
          .eq("id", element.id);

        if (updateError) throw updateError;

        await mirrorUpdate(mirror, "dashboard_elements", updatePayload as Record<string, unknown>, element.id);

        const cachePayload = {
          element_id: element.id,
          user_id: user.id,
          filter_hash: filterHash,
          filters: appliedFilters,
          data: {
            content: result.content,
            visualSpec: result.visualSpec,
            rows: result.rows,
            fields: result.fields,
          },
          executed_sql: result.executedSql,
          status: "fresh",
          refreshed_at: updatedAt,
        };

        const { error: cacheError } = await supabase
          .from("dashboard_element_cache")
          .upsert(cachePayload, { onConflict: "element_id,filter_hash" });

        if (cacheError) throw cacheError;

        await mirrorUpsert(mirror, "dashboard_element_cache", cachePayload as Record<string, unknown>, "element_id,filter_hash");

        refreshedElementIds.push(element.id);
        if (result.rewriteWarning) {
          warnings.push({ elementId: element.id, title: element.title, warning: result.rewriteWarning });
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown refresh error";
        console.error("Dashboard element refresh failed:", { elementId: element.id, message });
        failures.push({ elementId: element.id, title: element.title, error: message });
      }
    }

    const completedAt = new Date().toISOString();
    const completionPayload = {
      status: failures.length === refreshableElements.length ? "failed" : "completed",
      completed_at: completedAt,
      updated_at: completedAt,
      error: failures.length > 0 ? JSON.stringify(failures) : null,
    };

    const { error: completeError } = await supabase
      .from("dashboard_refresh_jobs")
      .update(completionPayload)
      .eq("id", job.id);

    if (completeError) {
      console.error("Failed to complete dashboard refresh job:", completeError);
      return jsonResponse({ error: "Failed to complete dashboard refresh job" }, 500);
    }

    await mirrorUpdate(mirror, "dashboard_refresh_jobs", completionPayload, job.id);

    return jsonResponse({
      ok: failures.length === 0,
      jobId: job.id,
      refreshed: refreshedElementIds.length,
      failed: failures.length,
      warnings,
      failures,
      message: failures.length === 0
        ? `Refreshed ${refreshedElementIds.length} dashboard ${refreshedElementIds.length === 1 ? "tile" : "tiles"}.`
        : `Refreshed ${refreshedElementIds.length} tiles; ${failures.length} failed.`,
    }, failures.length === refreshableElements.length ? 500 : 200);
  } catch (error) {
    console.error("Dashboard refresh error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
