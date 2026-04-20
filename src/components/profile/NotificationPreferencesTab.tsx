import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { NOTIFICATION_TYPES } from "@/lib/notificationTypes";
import { useMemo } from "react";

export const NotificationPreferencesTab = () => {
  const { preferences, loading, setPreference } = useNotificationPreferences();

  const grouped = useMemo(() => {
    const map: Record<string, typeof NOTIFICATION_TYPES> = {};
    NOTIFICATION_TYPES.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive. Some notifications may be required by your administrator.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {category}
            </h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 p-3 rounded-md border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={`pref-${item.key}`} className="font-medium cursor-pointer">
                      {item.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                  <Switch
                    id={`pref-${item.key}`}
                    checked={preferences[item.key] ?? true}
                    onCheckedChange={(checked) => setPreference(item.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
