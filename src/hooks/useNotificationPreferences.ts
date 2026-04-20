import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { customAuth } from "@/lib/customAuth";
import { NOTIFICATION_TYPES } from "@/lib/notificationTypes";

export interface NotificationPreference {
  notification_type: string;
  enabled: boolean;
}

export const useNotificationPreferences = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    const user = customAuth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("notification_type, enabled")
        .eq("user_id", user.id);

      if (error) throw error;

      // Default everything to true unless explicitly disabled
      const prefMap: Record<string, boolean> = {};
      NOTIFICATION_TYPES.forEach((t) => {
        prefMap[t.key] = true;
      });
      (data || []).forEach((row) => {
        prefMap[row.notification_type] = row.enabled;
      });
      setPreferences(prefMap);
    } catch (err) {
      console.error("Error fetching notification preferences:", err);
      toast({
        title: "Error",
        description: "Failed to load notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setPreference = async (notificationType: string, enabled: boolean) => {
    const user = customAuth.getUser();
    if (!user) return;

    // Optimistic update
    setPreferences((prev) => ({ ...prev, [notificationType]: enabled }));

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert(
          {
            user_id: user.id,
            notification_type: notificationType,
            enabled,
          },
          { onConflict: "user_id,notification_type" }
        );

      if (error) throw error;
    } catch (err) {
      console.error("Error updating preference:", err);
      // Revert
      setPreferences((prev) => ({ ...prev, [notificationType]: !enabled }));
      toast({
        title: "Error",
        description: "Failed to update preference.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return { preferences, loading, setPreference };
};
