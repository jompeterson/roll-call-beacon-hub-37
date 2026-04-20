import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { customAuth } from "@/lib/customAuth";

export interface NotificationRule {
  id: string;
  notification_type: string;
  target_type: "all" | "role" | "org_type" | "organization" | "user";
  target_value: string | null;
  enabled: boolean;
  is_mandatory: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationRules = () => {
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_rules")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRules((data || []) as NotificationRule[]);
    } catch (err) {
      console.error("Error fetching notification rules:", err);
      toast({
        title: "Error",
        description: "Failed to load notification rules.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (rule: Omit<NotificationRule, "id" | "created_at" | "updated_at" | "created_by">) => {
    const user = customAuth.getUser();
    if (!user) return false;

    try {
      const { error } = await supabase.from("notification_rules").insert({
        ...rule,
        created_by: user.id,
      });
      if (error) throw error;
      toast({ title: "Rule created", description: "Notification rule was added." });
      await fetchRules();
      return true;
    } catch (err) {
      console.error("Error creating rule:", err);
      toast({
        title: "Error",
        description: "Failed to create notification rule.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateRule = async (id: string, updates: Partial<NotificationRule>) => {
    try {
      const { error } = await supabase
        .from("notification_rules")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      await fetchRules();
      return true;
    } catch (err) {
      console.error("Error updating rule:", err);
      toast({
        title: "Error",
        description: "Failed to update rule.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notification_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Rule deleted" });
      await fetchRules();
      return true;
    } catch (err) {
      console.error("Error deleting rule:", err);
      toast({
        title: "Error",
        description: "Failed to delete rule.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return { rules, loading, createRule, updateRule, deleteRule, refetch: fetchRules };
};
