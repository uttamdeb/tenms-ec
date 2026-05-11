import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { mirrorDelete, mirrorInsert, mirrorUpdate } from "@/integrations/supabase/dualWrite";
import type { Json, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  DASHBOARD_LIMIT_PER_MODE,
  DASHBOARD_SIZE_LAYOUTS,
  DEFAULT_DASHBOARD_FILTERS,
  type Dashboard,
  type DashboardElement,
  type DashboardLayout,
  type DashboardMode,
  type DashboardPinPayload,
  getElementTitle,
  toJson,
} from "@/lib/dashboardTypes";

type RefreshDashboardResponse = {
  jobId?: string;
  refreshed?: number;
  message?: string;
};

const normalizeName = (value: string, fallback: string) => {
  const trimmed = value.trim();
  return (trimmed || fallback).slice(0, 80);
};

const getDefaultLayout = (type: DashboardPinPayload["type"]): DashboardLayout => {
  if (type === "text" || type === "kpi") return DASHBOARD_SIZE_LAYOUTS.small;
  if (type === "table") return DASHBOARD_SIZE_LAYOUTS.large;
  return DASHBOARD_SIZE_LAYOUTS.medium;
};

export function useDashboards(mode: DashboardMode, enabled = true) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [elementsByDashboard, setElementsByDashboard] = useState<Record<string, DashboardElement[]>>({});
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [busy, setBusy] = useState(false);

  const activeDashboard = useMemo(
    () => dashboards.find((dashboard) => dashboard.id === activeDashboardId) ?? dashboards[0] ?? null,
    [activeDashboardId, dashboards],
  );

  const activeElements = useMemo(
    () => (activeDashboard ? elementsByDashboard[activeDashboard.id] ?? [] : []),
    [activeDashboard, elementsByDashboard],
  );

  const loadElements = useCallback(async (dashboardId: string) => {
    const { data, error } = await supabase
      .from("dashboard_elements")
      .select("*")
      .eq("dashboard_id", dashboardId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) throw error;

    setElementsByDashboard((current) => ({
      ...current,
      [dashboardId]: data ?? [],
    }));

    return data ?? [];
  }, []);

  const loadDashboards = useCallback(async () => {
    if (!enabled) {
      setDashboards([]);
      setElementsByDashboard({});
      setActiveDashboardId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("dashboards")
        .select("*")
        .eq("mode", mode)
        .is("archived_at", null)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const rows = data ?? [];
      setDashboards(rows);
      const nextActiveId = rows.some((dashboard) => dashboard.id === activeDashboardId)
        ? activeDashboardId
        : rows[0]?.id ?? null;
      setActiveDashboardId(nextActiveId);

      if (nextActiveId) {
        await loadElements(nextActiveId);
      }
    } catch (error) {
      console.error("Failed to load dashboards:", error);
      toast.error("Failed to load dashboards");
    } finally {
      setLoading(false);
    }
  }, [activeDashboardId, enabled, loadElements, mode]);

  useEffect(() => {
    loadDashboards();
  }, [loadDashboards]);

  useEffect(() => {
    if (!enabled || !activeDashboardId || elementsByDashboard[activeDashboardId]) return;

    loadElements(activeDashboardId).catch((error) => {
      console.error("Failed to load dashboard elements:", error);
      toast.error("Failed to load dashboard elements");
    });
  }, [activeDashboardId, elementsByDashboard, enabled, loadElements]);

  const createDashboard = useCallback(async (name: string) => {
    if (dashboards.length >= DASHBOARD_LIMIT_PER_MODE) {
      throw new Error(`You can have up to ${DASHBOARD_LIMIT_PER_MODE} dashboards per workspace.`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You need to sign in again.");

    const payload: TablesInsert<"dashboards"> = {
      user_id: user.id,
      mode,
      name: normalizeName(name, `${mode === "10ms" ? "10MS" : "EC"} Dashboard`),
      filters: toJson(DEFAULT_DASHBOARD_FILTERS),
      layout: {} as Json,
      settings: {} as Json,
    };

    const { data, error } = await supabase
      .from("dashboards")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Failed to create dashboard");

    mirrorInsert("dashboards", data as unknown as Record<string, unknown>);
    setDashboards((current) => [data, ...current]);
    setActiveDashboardId(data.id);
    setElementsByDashboard((current) => ({ ...current, [data.id]: [] }));
    return data;
  }, [dashboards.length, mode]);

  const renameDashboard = useCallback(async (dashboardId: string, name: string) => {
    const updates: TablesUpdate<"dashboards"> = {
      name: normalizeName(name, "Dashboard"),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("dashboards")
      .update(updates)
      .eq("id", dashboardId)
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Failed to rename dashboard");

    mirrorUpdate("dashboards", updates as Record<string, unknown>, "id", dashboardId);
    setDashboards((current) => current.map((dashboard) => dashboard.id === dashboardId ? data : dashboard));
    return data;
  }, []);

  const updateDashboardFilters = useCallback(async (dashboardId: string, filters: Json) => {
    const updates: TablesUpdate<"dashboards"> = {
      filters,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("dashboards")
      .update(updates)
      .eq("id", dashboardId)
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Failed to update dashboard filters");

    mirrorUpdate("dashboards", updates as Record<string, unknown>, "id", dashboardId);
    setDashboards((current) => current.map((dashboard) => dashboard.id === dashboardId ? data : dashboard));
    return data;
  }, []);

  const archiveDashboard = useCallback(async (dashboardId: string) => {
    const archivedAt = new Date().toISOString();
    const updates: TablesUpdate<"dashboards"> = {
      archived_at: archivedAt,
      updated_at: archivedAt,
    };

    const { error } = await supabase
      .from("dashboards")
      .update(updates)
      .eq("id", dashboardId);

    if (error) throw error;

    mirrorUpdate("dashboards", updates as Record<string, unknown>, "id", dashboardId);
    setDashboards((current) => current.filter((dashboard) => dashboard.id !== dashboardId));
    setElementsByDashboard((current) => {
      const next = { ...current };
      delete next[dashboardId];
      return next;
    });
    setActiveDashboardId((current) => current === dashboardId ? null : current);
  }, []);

  const addElement = useCallback(async (dashboardId: string, payload: DashboardPinPayload, titleOverride?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You need to sign in again.");

    const currentElements = elementsByDashboard[dashboardId] ?? (await loadElements(dashboardId));
    const nextPosition = currentElements.length;
    const layout = payload.layout ?? getDefaultLayout(payload.type);

    const insertPayload: TablesInsert<"dashboard_elements"> = {
      dashboard_id: dashboardId,
      user_id: user.id,
      mode,
      element_type: payload.type,
      title: normalizeName(titleOverride ?? getElementTitle(payload), "Dashboard element"),
      source_message_id: payload.sourceMessageId ?? null,
      source_sql_run_id: payload.sourceSqlRunId ?? null,
      source_query_run_id: payload.sourceQueryRunId ?? null,
      visual_spec: toJson(payload.visualSpec ?? {}),
      query_config: toJson({
        refreshable: Boolean(payload.sourceQueryRunId || payload.sourceSqlRunId),
        ...payload.queryConfig,
      }),
      content: toJson(payload.content),
      layout: toJson(layout),
      settings: {} as Json,
      position: nextPosition,
    };

    const { data, error } = await supabase
      .from("dashboard_elements")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Failed to add dashboard element");

    mirrorInsert("dashboard_elements", data as unknown as Record<string, unknown>);
    setElementsByDashboard((current) => ({
      ...current,
      [dashboardId]: [...(current[dashboardId] ?? []), data],
    }));
    return data;
  }, [elementsByDashboard, loadElements, mode]);

  const createDashboardAndAddElement = useCallback(async (name: string, payload: DashboardPinPayload, titleOverride?: string) => {
    const dashboard = await createDashboard(name);
    const element = await addElement(dashboard.id, payload, titleOverride);
    return { dashboard, element };
  }, [addElement, createDashboard]);

  const updateElement = useCallback(async (elementId: string, updates: TablesUpdate<"dashboard_elements">) => {
    const { data, error } = await supabase
      .from("dashboard_elements")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", elementId)
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Failed to update dashboard element");

    mirrorUpdate("dashboard_elements", { ...updates, updated_at: data.updated_at } as Record<string, unknown>, "id", elementId);
    setElementsByDashboard((current) => {
      const next = { ...current };
      for (const dashboardId of Object.keys(next)) {
        next[dashboardId] = next[dashboardId].map((element) => element.id === elementId ? data : element);
      }
      return next;
    });

    return data;
  }, []);

  const resizeElement = useCallback(async (element: DashboardElement, size: keyof typeof DASHBOARD_SIZE_LAYOUTS) => {
    const currentLayout = typeof element.layout === "object" && element.layout && !Array.isArray(element.layout)
      ? element.layout as Record<string, unknown>
      : {};
    const nextLayout = {
      ...currentLayout,
      ...DASHBOARD_SIZE_LAYOUTS[size],
    };

    return updateElement(element.id, { layout: toJson(nextLayout) });
  }, [updateElement]);

  const removeElement = useCallback(async (elementId: string) => {
    const { error } = await supabase
      .from("dashboard_elements")
      .delete()
      .eq("id", elementId);

    if (error) throw error;

    mirrorDelete("dashboard_elements", "id", elementId);
    setElementsByDashboard((current) => {
      const next = { ...current };
      for (const dashboardId of Object.keys(next)) {
        next[dashboardId] = next[dashboardId].filter((element) => element.id !== elementId);
      }
      return next;
    });
  }, []);

  const refreshDashboard = useCallback(async (dashboardId: string, filters?: Json) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke<RefreshDashboardResponse>("refresh-dashboard", {
        body: {
          dashboardId,
          mode,
          filters: filters ?? activeDashboard?.filters ?? DEFAULT_DASHBOARD_FILTERS,
        },
      });

      if (error) throw error;
      await loadElements(dashboardId);
      const refreshed = typeof data?.refreshed === "number" ? data.refreshed : 0;
      toast.success(data?.message ?? `Refreshed ${refreshed} dashboard ${refreshed === 1 ? "tile" : "tiles"}`);
      return data;
    } finally {
      setBusy(false);
    }
  }, [activeDashboard?.filters, loadElements, mode]);

  return {
    dashboards,
    elementsByDashboard,
    activeDashboard,
    activeDashboardId,
    activeElements,
    loading,
    busy,
    setActiveDashboardId,
    loadDashboards,
    loadElements,
    createDashboard,
    renameDashboard,
    updateDashboardFilters,
    archiveDashboard,
    addElement,
    createDashboardAndAddElement,
    resizeElement,
    removeElement,
    refreshDashboard,
  };
}
