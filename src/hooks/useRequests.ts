
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Request = Tables<"requests">;

export const useRequests = () => {
  return useQuery({
    queryKey: ["requests"],
    queryFn: async () => {
      console.log("Fetching requests from Supabase...");
      
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        throw error;
      }

      console.log("Fetched requests:", data);
      return data as Request[];
    },
  });
};
