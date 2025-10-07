
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Volunteer {
  id: string;
  title: string;
  description: string | null;
  volunteer_date: string;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

export const useVolunteers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: volunteers = [], isLoading: loading, error } = useQuery({
    queryKey: ["volunteers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching volunteers:", error);
        throw new Error(error.message);
      }

      return data as Volunteer[];
    },
  });

  const approveVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      const { error } = await supabase
        .from("volunteers")
        .update({ 
          is_approved: true, 
          approval_decision_made: true 
        })
        .eq("id", volunteerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer opportunity approved successfully!",
      });
    },
    onError: (error) => {
      console.error("Error approving volunteer:", error);
      toast({
        title: "Error",
        description: "Failed to approve volunteer opportunity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      const { error } = await supabase
        .from("volunteers")
        .update({ 
          is_approved: false, 
          approval_decision_made: true 
        })
        .eq("id", volunteerId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer opportunity rejected successfully.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      console.error("Error rejecting volunteer:", error);
      toast({
        title: "Error",
        description: "Failed to reject volunteer opportunity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveVolunteer = (volunteerId: string) => {
    approveVolunteerMutation.mutate(volunteerId);
  };

  const rejectVolunteer = (volunteerId: string) => {
    rejectVolunteerMutation.mutate(volunteerId);
  };

  return {
    volunteers,
    loading,
    error,
    approveVolunteer,
    rejectVolunteer,
  };
};
