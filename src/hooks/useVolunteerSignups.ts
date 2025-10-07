
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useVolunteerSignups = (volunteerId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: signups = [], isLoading: loading } = useQuery({
    queryKey: ["volunteer-signups", volunteerId],
    queryFn: async () => {
      if (!volunteerId) return [];
      
      const { data, error } = await supabase
        .from("volunteer_signups")
        .select("*")
        .eq("volunteer_id", volunteerId);

      if (error) {
        console.error("Error fetching volunteer signups:", error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!volunteerId,
  });

  const { data: userSignup = null } = useQuery({
    queryKey: ["user-volunteer-signup", volunteerId, user?.id],
    queryFn: async () => {
      if (!volunteerId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("volunteer_signups")
        .select("*")
        .eq("volunteer_id", volunteerId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user signup:", error);
        return null;
      }

      return data;
    },
    enabled: !!volunteerId && !!user?.id,
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("volunteer_signups")
        .insert({
          volunteer_id: volunteerId,
          user_id: user.id,
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-signups", volunteerId] });
      queryClient.invalidateQueries({ queryKey: ["user-volunteer-signup", volunteerId, user?.id] });
      toast({
        title: "Success",
        description: "You have signed up for this volunteer opportunity!",
      });
    },
    onError: (error) => {
      console.error("Error signing up:", error);
      toast({
        title: "Error",
        description: "Failed to sign up. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelSignupMutation = useMutation({
    mutationFn: async (signupId: string) => {
      const { error } = await supabase
        .from("volunteer_signups")
        .delete()
        .eq("id", signupId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteer-signups", volunteerId] });
      queryClient.invalidateQueries({ queryKey: ["user-volunteer-signup", volunteerId, user?.id] });
      toast({
        title: "Success",
        description: "Your signup has been cancelled.",
      });
    },
    onError: (error) => {
      console.error("Error cancelling signup:", error);
      toast({
        title: "Error",
        description: "Failed to cancel signup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const signUp = () => {
    signupMutation.mutate();
  };

  const cancelSignup = (signupId: string) => {
    cancelSignupMutation.mutate(signupId);
  };

  return {
    signups,
    signupCount: signups.length,
    loading,
    submitting: signupMutation.isPending || cancelSignupMutation.isPending,
    userSignup,
    hasSignedUp: !!userSignup,
    signUp,
    cancelSignup,
  };
};
