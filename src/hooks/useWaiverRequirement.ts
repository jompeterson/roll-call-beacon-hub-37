import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { customAuth } from "@/lib/customAuth";

/**
 * Requires a signed volunteer waiver before running an action.
 * Usage: const { waiverOpen, setWaiverOpen, requireWaiver, onWaiverSigned } = useWaiverRequirement();
 */
export const useWaiverRequirement = () => {
  const [waiverOpen, setWaiverOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireWaiver = useCallback(async (action: () => void) => {
    const current = customAuth.getUser();
    if (!current) {
      action();
      return;
    }
    const { data } = await supabase
      .from("user_profiles")
      .select("waiver_agreed")
      .eq("id", current.id)
      .maybeSingle();

    if (data && !data.waiver_agreed) {
      setPendingAction(() => action);
      setWaiverOpen(true);
      return;
    }
    action();
  }, []);

  const onWaiverSigned = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  return { waiverOpen, setWaiverOpen, requireWaiver, onWaiverSigned };
};
