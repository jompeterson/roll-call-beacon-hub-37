import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationOption {
  id: string;
  name: string;
}

export const useOrganizationOptions = () => {
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["organization-options"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data || []) as OrganizationOption[];
    },
  });

  return { organizations, isLoading };
};
