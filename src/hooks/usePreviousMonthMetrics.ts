
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const usePreviousMonthMetrics = () => {
  return useQuery({
    queryKey: ["previous-monthly-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Get organizations from previous month
      const { data: previousOrganizations, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (orgError) {
        console.error("Error fetching previous month organizations:", orgError);
        throw orgError;
      }

      // Get scholarships from previous month
      const { data: previousScholarships, error: scholarshipError } = await supabase
        .from("scholarships")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (scholarshipError) {
        console.error("Error fetching previous month scholarships:", scholarshipError);
        throw scholarshipError;
      }

      // Get donations from previous month
      const { data: previousDonations, error: donationError } = await supabase
        .from("donations")
        .select("id, amount_needed")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (donationError) {
        console.error("Error fetching previous month donations:", donationError);
        throw donationError;
      }

      const donationIds = previousDonations?.map((d) => d.id) || [];
      const { data: acceptances } = donationIds.length
        ? await supabase
            .from("donation_acceptances")
            .select("donation_id")
            .in("donation_id", donationIds)
        : { data: [] as { donation_id: string }[] };
      const acceptedSet = new Set((acceptances || []).map((a) => a.donation_id));

      // Get events from previous month
      const { data: previousEvents, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (eventError) {
        console.error("Error fetching previous month events:", eventError);
        throw eventError;
      }

      // Get users from previous month
      const { data: previousUsers, error: userError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (userError) {
        console.error("Error fetching previous month users:", userError);
        throw userError;
      }

      // Get volunteers from previous month
      const { data: previousVolunteers, error: volunteerError } = await supabase
        .from("volunteers")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfPreviousMonth.toISOString())
        .lte("created_at", endOfPreviousMonth.toISOString());

      if (volunteerError) {
        console.error("Error fetching previous month volunteers:", volunteerError);
        throw volunteerError;
      }

      const totalDonations = previousDonations?.reduce((sum, d) => {
        return sum + (Number(d.amount_needed) || 0);
      }, 0) || 0;
      const pendingDonations = previousDonations?.reduce((sum, d) => {
        return !d.is_taken ? sum + (Number(d.amount_needed) || 0) : sum;
      }, 0) || 0;

      return {
        newOrganizations: previousOrganizations?.length || 0,
        newScholarships: previousScholarships?.length || 0,
        totalDonations,
        pendingDonations,
        newEvents: previousEvents?.length || 0,
        newUsers: previousUsers?.length || 0,
        newVolunteers: previousVolunteers?.length || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
