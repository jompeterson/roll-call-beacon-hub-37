import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { useNotificationRules } from "@/hooks/useNotificationRules";
import { NOTIFICATION_TYPES } from "@/lib/notificationTypes";
import { useOrganizationsRealtime } from "@/hooks/useOrganizationsRealtime";
import { useUserProfilesRealtime } from "@/hooks/useUserProfilesRealtime";
import { Skeleton } from "@/components/ui/skeleton";

import { organizationTypes } from "@/components/organizations/types";

const ORG_TYPES = organizationTypes;
const ROLES = [
  { value: "administrator", label: "Administrator" },
  { value: "shop_teacher", label: "CTE Teacher" },
  { value: "staff", label: "Staff" },
  { value: "student", label: "Student" },
  { value: "volunteer", label: "Volunteer" },
];

export const NotificationRulesManager = () => {
  const { rules, loading, createRule, updateRule, deleteRule } = useNotificationRules();
  const { organizations } = useOrganizationsRealtime();
  const { userProfiles } = useUserProfilesRealtime();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    notification_type: "",
    target_type: "all" as "all" | "role" | "org_type" | "organization" | "user",
    target_value: "",
    enabled: true,
    is_mandatory: false,
  });

  const typeMap = useMemo(() => {
    const m: Record<string, string> = {};
    NOTIFICATION_TYPES.forEach((t) => (m[t.key] = t.label));
    return m;
  }, []);

  const orgMap = useMemo(() => {
    const m: Record<string, string> = {};
    organizations.forEach((o) => (m[o.id] = o.name));
    return m;
  }, [organizations]);

  const userMap = useMemo(() => {
    const m: Record<string, string> = {};
    userProfiles.forEach((u) => (m[u.id] = `${u.first_name} ${u.last_name}`));
    return m;
  }, [userProfiles]);

  const formatTarget = (rule: { target_type: string; target_value: string | null }) => {
    if (rule.target_type === "all") return "Everyone";
    if (rule.target_type === "role") return `Role: ${rule.target_value}`;
    if (rule.target_type === "org_type") return `Org Type: ${rule.target_value}`;
    if (rule.target_type === "organization")
      return `Org: ${orgMap[rule.target_value || ""] || rule.target_value}`;
    if (rule.target_type === "user")
      return `User: ${userMap[rule.target_value || ""] || rule.target_value}`;
    return rule.target_value || "";
  };

  const resetForm = () => {
    setForm({
      notification_type: "",
      target_type: "all",
      target_value: "",
      enabled: true,
      is_mandatory: false,
    });
  };

  const handleCreate = async () => {
    if (!form.notification_type) return;
    if (form.target_type !== "all" && !form.target_value) return;

    const ok = await createRule({
      notification_type: form.notification_type,
      target_type: form.target_type,
      target_value: form.target_type === "all" ? null : form.target_value,
      enabled: form.enabled,
      is_mandatory: form.is_mandatory,
    });
    if (ok) {
      setDialogOpen(false);
      resetForm();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Notification Rules</CardTitle>
          <CardDescription>
            Manage who receives which notifications. Mandatory rules override individual user preferences.
          </CardDescription>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          style={{ backgroundColor: "#3d7471" }}
          className="text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No notification rules yet. By default, all users receive all notifications and may opt out individually.
          </p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-4 p-3 border rounded-md bg-card"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {typeMap[rule.notification_type] || rule.notification_type}
                    </span>
                    <Badge variant={rule.enabled ? "default" : "secondary"}>
                      {rule.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                    {rule.is_mandatory && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Mandatory
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{formatTarget(rule)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={(v) => updateRule(rule.id, { enabled: v })}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Notification Rule</DialogTitle>
            <DialogDescription>
              Control which users receive a specific notification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select
                value={form.notification_type}
                onValueChange={(v) => setForm((f) => ({ ...f, notification_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a notification type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Select
                value={form.target_type}
                onValueChange={(v: any) =>
                  setForm((f) => ({ ...f, target_type: v, target_value: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="role">By Role</SelectItem>
                  <SelectItem value="org_type">By Organization Type</SelectItem>
                  <SelectItem value="organization">Specific Organization</SelectItem>
                  <SelectItem value="user">Specific User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.target_type === "role" && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.target_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, target_value: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.target_type === "org_type" && (
              <div className="space-y-2">
                <Label>Organization Type</Label>
                <Select
                  value={form.target_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, target_value: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select org type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.target_type === "organization" && (
              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={form.target_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, target_value: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.target_type === "user" && (
              <div className="space-y-2">
                <Label>User</Label>
                <Select
                  value={form.target_value}
                  onValueChange={(v) => setForm((f) => ({ ...f, target_value: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProfiles.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label htmlFor="enabled-switch" className="font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground">If off, this notification is suppressed for the target.</p>
              </div>
              <Switch
                id="enabled-switch"
                checked={form.enabled}
                onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label htmlFor="mandatory-switch" className="font-medium">Mandatory</Label>
                <p className="text-xs text-muted-foreground">Overrides individual user preferences.</p>
              </div>
              <Switch
                id="mandatory-switch"
                checked={form.is_mandatory}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_mandatory: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={!form.notification_type || (form.target_type !== "all" && !form.target_value)}
              style={{ backgroundColor: "#3d7471" }}
              className="text-white hover:opacity-90"
            >
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
