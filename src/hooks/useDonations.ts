
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Donation = Tables<"donations">;

export const useDonations = () => {
  return useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      console.log("Fetching donations from Supabase...");
      
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching donations:", error);
        throw error;
      }

      console.log("Fetched donations:", data);
      return data as Donation[];
    },
  });
};
