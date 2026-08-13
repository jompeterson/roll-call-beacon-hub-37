import { supabase } from "@/integrations/supabase/client";

// Dollar value applied per volunteer hour worked
export const HOURLY_RATE_USD = 30;

/**
 * Totals for donated hours within a date range, based on ended volunteer opportunities:
 *  - hours: sum of `total_hours`
 *  - value: sum of (total_hours × number of participants × HOURLY_RATE_USD)
 */
export const calculateDonatedHours = async (
  startISO: string,
  endISO: string
): Promise<{ hours: number; value: number }> => {
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, total_hours")
    .eq("is_approved", true)
    .eq("is_ended", true)
    .gte("created_at", startISO)
    .lte("created_at", endISO);

  const list = volunteers || [];
  const ids = list.map((v) => v.id);

  const { data: signups } = ids.length
    ? await supabase.from("volunteer_signups").select("volunteer_id").in("volunteer_id", ids)
    : { data: [] as { volunteer_id: string }[] };

  const participantCounts = new Map<string, number>();
  (signups || []).forEach((s) => {
    participantCounts.set(s.volunteer_id, (participantCounts.get(s.volunteer_id) || 0) + 1);
  });

  const totalHours = list.reduce((sum, v) => sum + (Number(v.total_hours) || 0), 0);
  const totalValue = list.reduce((sum, v) => {
    const hours = Number(v.total_hours) || 0;
    const participants = participantCounts.get(v.id) || 0;
    return sum + hours * participants * HOURLY_RATE_USD;
  }, 0);

  return {
    hours: Math.round(totalHours),
    value: Math.round(totalValue),
  };
};
