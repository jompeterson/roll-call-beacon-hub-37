
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateDonatedHours } from "@/lib/hoursValue";

export const useYearlyMetrics = () => {
  return useQuery({
    queryKey: ["yearly-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

      // Get organizations this year
      const { data: organizations, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (orgError) {
        console.error("Error fetching organizations:", orgError);
        throw orgError;
      }

      // Get donations this year and sum the amounts
      const { data: donations, error: donationError } = await supabase
        .from("donations")
        .select("id, amount_needed")
        .eq("is_approved", true)
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (donationError) {
        console.error("Error fetching donations:", donationError);
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

      // Get events this year
      const { data: events, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (eventError) {
        console.error("Error fetching events:", eventError);
        throw eventError;
      }

      // Calculate accepted vs pending donations amount
      const totalDonations = donations?.reduce((sum, d) => {
        return acceptedSet.has(d.id) ? sum + (Number(d.amount_needed) || 0) : sum;
      }, 0) || 0;
      const pendingDonations = donations?.reduce((sum, d) => {
        return !acceptedSet.has(d.id) ? sum + (Number(d.amount_needed) || 0) : sum;
      }, 0) || 0;

      // Calculate estimated hours donated (assuming 1 hour per $10 donated as an example)
      const estimatedHours = Math.round(totalDonations / 10);

      // Get total comments as a proxy for "posts"
      const { data: comments, error: commentError } = await supabase
        .from("comments")
        .select("id")
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (commentError) {
        console.error("Error fetching comments:", commentError);
        throw commentError;
      }

      // Get volunteers this year
      const { data: volunteers, error: volunteerError } = await supabase
        .from("volunteers")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (volunteerError) {
        console.error("Error fetching volunteers:", volunteerError);
        throw volunteerError;
      }

      return {
        organizations: organizations?.length || 0,
        totalDonations,
        pendingDonations,
        events: events?.length || 0,
        hoursDonated: estimatedHours,
        posts: comments?.length || 0,
        financialTotals: totalDonations, // Same as donations for now
        volunteers: volunteers?.length || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
