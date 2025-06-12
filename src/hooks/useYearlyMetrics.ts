
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .select("amount_raised")
        .eq("is_approved", true)
        .gte("created_at", startOfYear.toISOString())
        .lte("created_at", endOfYear.toISOString());

      if (donationError) {
        console.error("Error fetching donations:", donationError);
        throw donationError;
      }

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

      // Calculate total donations amount
      const totalDonations = donations?.reduce((sum, donation) => {
        return sum + (Number(donation.amount_raised) || 0);
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

      return {
        organizations: organizations?.length || 0,
        totalDonations,
        events: events?.length || 0,
        hoursDonated: estimatedHours,
        posts: comments?.length || 0,
        financialTotals: totalDonations, // Same as donations for now
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
