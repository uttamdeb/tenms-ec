import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DASHBOARD_LIMIT_PER_MODE,
  type Dashboard,
  type DashboardMode,
  type DashboardPinPayload,
  getElementTitle,
} from "@/lib/dashboardTypes";

type AddToDashboardDialogProps = {
  open: boolean;
  mode: DashboardMode;
  payload: DashboardPinPayload | null;
  dashboards: Dashboard[];
  onOpenChange: (open: boolean) => void;
  onAdd: (dashboardId: string, payload: DashboardPinPayload, title: string) => Promise<void>;
  onCreateAndAdd: (dashboardName: string, payload: DashboardPinPayload, title: string) => Promise<void>;
};

export function AddToDashboardDialog({
  open,
  mode,
  payload,
  dashboards,
  onOpenChange,
  onAdd,
  onCreateAndAdd,
}: AddToDashboardDialogProps) {
  const [selectedDashboardId, setSelectedDashboardId] = useState<string>("");
  const [newDashboardName, setNewDashboardName] = useState("");
  const [elementTitle, setElementTitle] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canCreateMore = dashboards.length < DASHBOARD_LIMIT_PER_MODE;
  const defaultDashboardName = `${mode === "10ms" ? "10MS" : "EC"} Dashboard ${Math.min(dashboards.length + 1, DASHBOARD_LIMIT_PER_MODE)}`;

  useEffect(() => {
    if (!open || !payload) return;

    setSelectedDashboardId(dashboards[0]?.id ?? "");
    setCreatingNew(dashboards.length === 0);
    setNewDashboardName(defaultDashboardName);
    setElementTitle(getElementTitle(payload));
  }, [dashboards, defaultDashboardName, open, payload]);

  const selectedDashboard = useMemo(
    () => dashboards.find((dashboard) => dashboard.id === selectedDashboardId) ?? null,
    [dashboards, selectedDashboardId],
  );

  const handleSubmit = async () => {
    if (!payload) return;

    const cleanTitle = elementTitle.trim() || getElementTitle(payload);
    setSubmitting(true);
    try {
      if (creatingNew) {
        if (!canCreateMore) {
          toast.error(`You can have up to ${DASHBOARD_LIMIT_PER_MODE} dashboards per workspace.`);
          return;
        }
        await onCreateAndAdd(newDashboardName, payload, cleanTitle);
      } else {
        if (!selectedDashboard) {
          toast.error("Choose a dashboard first");
          return;
        }
        await onAdd(selectedDashboard.id, payload, cleanTitle);
      }

      toast.success("Added to dashboard");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add to dashboard:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add to dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-0 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="headline-agent text-2xl">Add to Dashboard</DialogTitle>
          <DialogDescription>
            Save this {payload?.type ?? "item"} to a BI dashboard in the {mode === "10ms" ? "10MS" : "EC"} workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dashboard-element-title">Tile title</Label>
            <Input
              id="dashboard-element-title"
              value={elementTitle}
              maxLength={120}
              onChange={(event) => setElementTitle(event.target.value)}
              placeholder="Name this dashboard tile"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label>Dashboard</Label>
              <span className="label-tech text-[0.62rem] text-muted-foreground">
                {dashboards.length}/{DASHBOARD_LIMIT_PER_MODE}
              </span>
            </div>
            <div className="grid gap-2">
              {dashboards.map((dashboard) => (
                <button
                  type="button"
                  key={dashboard.id}
                  onClick={() => {
                    setCreatingNew(false);
                    setSelectedDashboardId(dashboard.id);
                  }}
                  className={`flex min-h-11 items-center justify-between rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${
                    !creatingNew && selectedDashboardId === dashboard.id
                      ? "border-primary/70 bg-primary/10 text-primary"
                      : "border-border/70 bg-background/40 text-foreground hover:bg-white/5"
                  }`}
                >
                  <span className="min-w-0 truncate">{dashboard.name}</span>
                  <span className="label-tech shrink-0 text-[0.55rem]">{dashboard.mode.toUpperCase()}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => canCreateMore && setCreatingNew(true)}
                disabled={!canCreateMore}
                className={`flex min-h-11 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-sm transition-colors ${
                  creatingNew
                    ? "border-primary/70 bg-primary/10 text-primary"
                    : "border-dashed border-border/70 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <Plus className="h-4 w-4" />
                <span>{canCreateMore ? "Create new dashboard" : "Dashboard limit reached"}</span>
              </button>
            </div>
          </div>

          {creatingNew && (
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">New dashboard name</Label>
              <Input
                id="dashboard-name"
                value={newDashboardName}
                maxLength={80}
                onChange={(event) => setNewDashboardName(event.target.value)}
                placeholder={defaultDashboardName}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting || !payload}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
