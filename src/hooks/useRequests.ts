
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRequests = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      console.log("Fetching requests...");
      
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        throw error;
      }

      console.log("Fetched requests:", data);
      return data;
    },
  });
};
