import { supabase } from "@/integrations/supabase/client";

// Dollar value applied per volunteer hour worked
export const HOURLY_RATE_USD = 30;

/**
 * Totals for donated hours within a date range, based on ended volunteer opportunities:
 *  - hours: sum of `total_hours` (falls back to the opportunity's start/end duration)
 *  - value: sum of (hours × number of participants × HOURLY_RATE_USD)
 */
export const calculateDonatedHours = async (
  startISO: string,
  endISO: string
): Promise<{ hours: number; value: number }> => {
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, total_hours, start_date, end_date")
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

  // Hours entered when ending the opportunity, otherwise the scheduled duration
  const hoursFor = (v: { total_hours: number | null; start_date: string | null; end_date: string | null }) => {
    const entered = Number(v.total_hours) || 0;
    if (entered > 0) return entered;
    if (v.start_date && v.end_date) {
      const diffMs = new Date(v.end_date).getTime() - new Date(v.start_date).getTime();
      if (diffMs > 0) return diffMs / (1000 * 60 * 60);
    }
    return 0;
  };

  const totalHours = list.reduce((sum, v) => sum + hoursFor(v), 0);
  const totalValue = list.reduce((sum, v) => {
    const participants = participantCounts.get(v.id) || 0;
    return sum + hoursFor(v) * participants * HOURLY_RATE_USD;
  }, 0);


  return {
    hours: Math.round(totalHours),
    value: Math.round(totalValue),
  };
};
