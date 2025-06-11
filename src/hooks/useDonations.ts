
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDonations = () => {
  return useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      console.log("Fetching donations...");
      
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching donations:", error);
        throw error;
      }

      console.log("Fetched donations:", data);
      return data;
    },
  });
};
