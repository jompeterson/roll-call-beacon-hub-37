
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

type Scholarship = Tables<"scholarships">;

export const useScholarships = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const {
    data: scholarships = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["scholarships", isAuthenticated],
    queryFn: async () => {
      let query = supabase
        .from("scholarships")
        .select(`
          *,
          creator:users!scholarships_creator_user_id_fkey(email),
          organization:organizations(id, name, type)
        `)
        .order("created_at", { ascending: false });

      // If user is not authenticated, only show approved scholarships
      if (!isAuthenticated) {
        query = query
          .eq("approval_decision_made", true)
          .eq("is_approved", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching scholarships:", error);
        throw error;
      }

      return data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchIntervalInBackground: true, // Continue refetching when tab is not active
    staleTime: 0, // Consider data stale immediately
  });

  const approveScholarship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scholarships")
        .update({
          is_approved: true,
          approval_decision_made: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all queries to refresh dashboard data
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Scholarship approved successfully",
      });
    },
    onError: (error) => {
      console.error("Error approving scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to approve scholarship",
        variant: "destructive",
      });
    },
  });

  const rejectScholarship = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scholarships")
        .update({
          is_approved: false,
          approval_decision_made: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all queries to refresh dashboard data
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Scholarship rejected",
      });
    },
    onError: (error) => {
      console.error("Error rejecting scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to reject scholarship",
        variant: "destructive",
      });
    },
  });

  const requestChanges = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scholarships")
        .update({
          is_approved: false,
          approval_decision_made: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all queries to refresh dashboard data
      queryClient.invalidateQueries();
      toast({
        title: "Success",
        description: "Changes requested for scholarship",
      });
    },
    onError: (error) => {
      console.error("Error requesting changes:", error);
      toast({
        title: "Error",
        description: "Failed to request changes",
        variant: "destructive",
      });
    },
  });

  return {
    scholarships,
    isLoading,
    error,
    refetch,
    approveScholarship: approveScholarship.mutate,
    rejectScholarship: rejectScholarship.mutate,
    requestChanges: requestChanges.mutate,
    isApproving: approveScholarship.isPending,
    isRejecting: rejectScholarship.isPending,
    isRequestingChanges: requestChanges.isPending,
  };
};
