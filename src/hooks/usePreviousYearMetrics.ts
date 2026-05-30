
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateDonatedHours } from "@/lib/hoursValue";

export const usePreviousYearMetrics = () => {
  return useQuery({
    queryKey: ["previous-yearly-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfPreviousYear = new Date(now.getFullYear() - 1, 0, 1);
      const endOfPreviousYear = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

      // Get organizations from previous year
      const { data: organizations, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousYear.toISOString())
        .lte("created_at", endOfPreviousYear.toISOString());

      if (orgError) {
        console.error("Error fetching previous year organizations:", orgError);
        throw orgError;
      }

      // Get donations from previous year
      const { data: donations, error: donationError } = await supabase
        .from("donations")
        .select("id, amount_needed")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousYear.toISOString())
        .lte("created_at", endOfPreviousYear.toISOString());

      if (donationError) {
        console.error("Error fetching previous year donations:", donationError);
        throw donationError;
      }

      const donationIds = donations?.map((d) => d.id) || [];
      const { data: acceptances } = donationIds.length
        ? await supabase
            .from("donation_acceptances")
            .select("donation_id")
            .in("donation_id", donationIds)
        : { data: [] as { donation_id: string }[] };
      const acceptedSet = new Set((acceptances || []).map((a) => a.donation_id));

      // Get events from previous year
      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousYear.toISOString())
        .lte("created_at", endOfPreviousYear.toISOString());

      if (eventError) {
        console.error("Error fetching previous year events:", eventError);
        throw eventError;
      }

      // Get comments from previous year
      const { data: comments, error: commentError } = await supabase
        .from("comments")
        .select("id")
        .gte("created_at", startOfPreviousYear.toISOString())
        .lte("created_at", endOfPreviousYear.toISOString());

      if (commentError) {
        console.error("Error fetching previous year comments:", commentError);
        throw commentError;
      }

      // Get volunteers from previous year
      const { data: volunteers, error: volunteerError } = await supabase
        .from("volunteers")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousYear.toISOString())
        .lte("created_at", endOfPreviousYear.toISOString());

      if (volunteerError) {
        console.error("Error fetching previous year volunteers:", volunteerError);
        throw volunteerError;
      }

      // Calculate accepted vs pending donations amount
      const totalDonations = donations?.reduce((sum, d) => {
        return acceptedSet.has(d.id) ? sum + (Number(d.amount_needed) || 0) : sum;
      }, 0) || 0;
      const pendingDonations = donations?.reduce((sum, d) => {
        return !acceptedSet.has(d.id) ? sum + (Number(d.amount_needed) || 0) : sum;
      }, 0) || 0;

      // Calculate real hours donated + dollar value
      const { hours: estimatedHours, value: hoursDonatedValue } =
        await calculateDonatedHours(
          startOfPreviousYear.toISOString(),
          endOfPreviousYear.toISOString()
        );

      return {
        organizations: organizations?.length || 0,
        totalDonations,
        pendingDonations,
        events: events?.length || 0,
        hoursDonated: estimatedHours,
        hoursDonatedValue,
        posts: comments?.length || 0,
        financialTotals: totalDonations,
        volunteers: volunteers?.length || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
