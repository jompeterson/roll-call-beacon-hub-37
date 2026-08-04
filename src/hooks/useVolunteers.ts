
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Volunteer {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date?: string | null;
  location: string | null;
  volunteer_link?: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
  images?: string[];
  organization_name?: string | null;
  interested_organizations?: string[];
  is_ended?: boolean;
  ended_at?: string | null;
  accomplishments?: string | null;
  completion_images?: string[];
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

      const rows = (data || []) as Volunteer[];
      const volunteerIds = rows.map((v) => v.id);

      // Users who have shown interest, per volunteer opportunity
      let signupsByVolunteer: Record<string, string[]> = {};
      if (volunteerIds.length > 0) {
        const { data: signups } = await supabase
          .from("volunteer_signups")
          .select("volunteer_id, user_id")
          .in("volunteer_id", volunteerIds);

        (signups || []).forEach((s: any) => {
          if (!s.user_id) return;
          signupsByVolunteer[s.volunteer_id] = [
            ...(signupsByVolunteer[s.volunteer_id] || []),
            s.user_id,
          ];
        });
      }

      const interestedIds = Object.values(signupsByVolunteer).flat();
      const userIds = [
        ...new Set([
          ...rows.map((v) => v.creator_user_id).filter(Boolean),
          ...interestedIds,
        ]),
      ];

      let orgByUser: Record<string, string | null> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, organizations!user_profiles_organization_id_fkey (name)")
          .in("id", userIds);

        (profiles || []).forEach((p: any) => {
          orgByUser[p.id] = p.organizations?.name ?? null;
        });
      }

      return rows.map((v) => {
        const posterOrg = orgByUser[v.creator_user_id] ?? null;
        const interested = [
          ...new Set(
            (signupsByVolunteer[v.id] || [])
              .map((uid) => orgByUser[uid])
              .filter((name): name is string => !!name && name !== posterOrg)
          ),
        ];
        return {
          ...v,
          organization_name: posterOrg,
          interested_organizations: interested,
        };
      }) as Volunteer[];
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

  const deleteVolunteerMutation = useMutation({
    mutationFn: async (volunteerId: string) => {
      const { error } = await supabase
        .from("volunteers")
        .delete()
        .eq("id", volunteerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast({
        title: "Success",
        description: "Volunteer opportunity deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting volunteer:", error);
      toast({
        title: "Error",
        description: "Failed to delete volunteer opportunity. Please try again.",
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

  const deleteVolunteer = (volunteerId: string) => {
    deleteVolunteerMutation.mutate(volunteerId);
  };

  return {
    volunteers,
    loading,
    error,
    approveVolunteer,
    rejectVolunteer,
    deleteVolunteer,
  };
};
