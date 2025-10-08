
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMonthlyMetrics = () => {
  return useQuery({
    queryKey: ["monthly-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get new organizations this month
      const { data: newOrganizations, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (orgError) {
        console.error("Error fetching organizations:", orgError);
        throw orgError;
      }

      // Get new scholarships this month
      const { data: newScholarships, error: scholarshipError } = await supabase
        .from("scholarships")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (scholarshipError) {
        console.error("Error fetching scholarships:", scholarshipError);
        throw scholarshipError;
      }

      // Get new donations this month and sum the amounts
      const { data: newDonations, error: donationError } = await supabase
        .from("donations")
        .select("amount_raised")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (donationError) {
        console.error("Error fetching donations:", donationError);
        throw donationError;
      }

      // Get new events this month
      const { data: newEvents, error: eventError } = await supabase
        .from("events")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (eventError) {
        console.error("Error fetching events:", eventError);
        throw eventError;
      }

      // Get new users this month
      const { data: newUsers, error: userError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (userError) {
        console.error("Error fetching users:", userError);
        throw userError;
      }

      // Get new volunteers this month
      const { data: newVolunteers, error: volunteerError } = await supabase
        .from("volunteers")
        .select("id")
        .eq("is_approved", true)
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (volunteerError) {
        console.error("Error fetching volunteers:", volunteerError);
        throw volunteerError;
      }

      // Calculate total donations amount
      const totalDonations = newDonations?.reduce((sum, donation) => {
        return sum + (Number(donation.amount_raised) || 0);
      }, 0) || 0;

      return {
        newOrganizations: newOrganizations?.length || 0,
        newScholarships: newScholarships?.length || 0,
        totalDonations,
        newEvents: newEvents?.length || 0,
        newUsers: newUsers?.length || 0,
        newVolunteers: newVolunteers?.length || 0,
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
