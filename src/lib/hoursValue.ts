import { supabase } from "@/integrations/supabase/client";

// Independent Sector 2024 national value of volunteer time (kept for reference/display)
export const HOURLY_RATE_USD = 33.49;

/**
 * Totals for donated hours within a date range, based on the values entered
 * when a volunteer opportunity is ended:
 *  - hours: sum of `total_hours` on ended volunteer opportunities
 *  - value: sum of `discounted_services_value` (services donated) on ended opportunities
 */
export const calculateDonatedHours = async (
  startISO: string,
  endISO: string
): Promise<{ hours: number; value: number }> => {
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, total_hours, discounted_services_value")
    .eq("is_approved", true)
    .eq("is_ended", true)
    .gte("created_at", startISO)
    .lte("created_at", endISO);

  const totalHours = (volunteers || []).reduce(
    (sum, v) => sum + (Number(v.total_hours) || 0),
    0
  );
  const totalValue = (volunteers || []).reduce(
    (sum, v) => sum + (Number(v.discounted_services_value) || 0),
    0
  );

  return {
    hours: Math.round(totalHours),
    value: Math.round(totalValue),
  };
};
