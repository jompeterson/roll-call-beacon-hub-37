
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomWidget {
  id: string;
  title: string;
  description?: string;
  section: 'pending_approvals' | 'monthly_metrics' | 'yearly_metrics';
  metrics: any[];
  display_config: any;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useCustomWidgets = (section?: string) => {
  return useQuery({
    queryKey: ["custom-widgets", section],
    queryFn: async () => {
      let query = supabase
        .from('custom_widgets')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (section) {
        query = query.eq('section', section);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching custom widgets:', error);
        throw error;
      }

      return (data || []) as CustomWidget[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
