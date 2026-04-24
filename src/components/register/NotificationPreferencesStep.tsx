import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell } from "lucide-react";
import { RegistrationData } from "@/pages/Register";
import { NOTIFICATION_TYPES } from "@/lib/notificationTypes";

interface NotificationPreferencesStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
  isSubmitting?: boolean;
}

export const NotificationPreferencesStep = ({
  data,
  onNext,
  onBack,
  onUpdate,
  isSubmitting,
}: NotificationPreferencesStepProps) => {
  // Hide admin-only items from regular signup
  const visibleTypes = useMemo(
    () => NOTIFICATION_TYPES.filter((t) => t.category !== "Admin"),
    []
  );

  const grouped = useMemo(() => {
    const map: Record<string, typeof NOTIFICATION_TYPES> = {};
    visibleTypes.forEach((t) => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return map;
  }, [visibleTypes]);

  const prefs = data.notificationPreferences ?? {};

  const isEnabled = (key: string) => prefs[key] ?? true;

  const togglePref = (key: string, enabled: boolean) => {
    onUpdate({
      notificationPreferences: {
        ...(data.notificationPreferences ?? {}),
        [key]: enabled,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Notification Preferences</h2>
        <p className="text-muted-foreground mt-2">
          Choose which notifications you'd like to receive. You can change these anytime in your profile.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                        <Label
                          htmlFor={`signup-pref-${item.key}`}
                          className="font-medium cursor-pointer"
                        >
                          {item.label}
                        </Label>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Switch
                        id={`signup-pref-${item.key}`}
                        checked={isEnabled(item.key)}
                        onCheckedChange={(checked) => togglePref(item.key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="flex-1 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-12">
                {isSubmitting ? "Submitting..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
