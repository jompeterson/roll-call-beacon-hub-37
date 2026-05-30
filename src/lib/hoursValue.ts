import { supabase } from "@/integrations/supabase/client";

// Independent Sector 2024 national value of volunteer time
export const HOURLY_RATE_USD = 33.49;

/**
 * Calculates total donated hours within a date range:
 *  - In-Kind Donations: sum of `hours_available` on approved donations that have been accepted
 *  - Volunteer Opportunities: (end_date - start_date in hours) × number of signups, for approved opportunities
 */
export const calculateDonatedHours = async (
  startISO: string,
  endISO: string
): Promise<{ hours: number; value: number }> => {
  // In-kind hours from accepted donations
  const { data: donations } = await supabase
    .from("donations")
    .select("id, hours_available")
    .eq("is_approved", true)
    .gt("hours_available", 0)
    .gte("created_at", startISO)
    .lte("created_at", endISO);

  const donationIds = (donations || []).map((d) => d.id);
  const { data: acceptances } = donationIds.length
    ? await supabase
        .from("donation_acceptances")
        .select("donation_id")
        .in("donation_id", donationIds)
    : { data: [] as { donation_id: string }[] };
  const acceptedSet = new Set((acceptances || []).map((a) => a.donation_id));

  const inKindHours = (donations || []).reduce((sum, d) => {
    return acceptedSet.has(d.id) ? sum + (Number(d.hours_available) || 0) : sum;
  }, 0);

  // Volunteer hours: duration × signups for approved opportunities
  const { data: volunteers } = await supabase
    .from("volunteers")
    .select("id, start_date, end_date")
    .eq("is_approved", true)
    .gte("created_at", startISO)
    .lte("created_at", endISO);

  const volunteerIds = (volunteers || []).map((v) => v.id);
  const { data: signups } = volunteerIds.length
    ? await supabase
        .from("volunteer_signups")
        .select("volunteer_id")
        .in("volunteer_id", volunteerIds)
    : { data: [] as { volunteer_id: string }[] };

  const signupCounts = new Map<string, number>();
  (signups || []).forEach((s) => {
    signupCounts.set(s.volunteer_id, (signupCounts.get(s.volunteer_id) || 0) + 1);
  });

  const volunteerHours = (volunteers || []).reduce((sum, v) => {
    if (!v.start_date || !v.end_date) return sum;
    const durationMs =
      new Date(v.end_date).getTime() - new Date(v.start_date).getTime();
    const hours = durationMs > 0 ? durationMs / (1000 * 60 * 60) : 0;
    const count = signupCounts.get(v.id) || 0;
    return sum + hours * count;
  }, 0);

  const totalHours = inKindHours + volunteerHours;
  return {
    hours: Math.round(totalHours),
    value: Math.round(totalHours * HOURLY_RATE_USD),
  };
};
