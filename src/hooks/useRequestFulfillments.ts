import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const useRequestFulfillments = (requestId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user has fulfilled this request
  const { data: hasFulfilled = false } = useQuery({
    queryKey: ["request-fulfillment", requestId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("request_fulfillments")
        .select("id")
        .eq("request_id", requestId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking fulfillment:", error);
        return false;
      }

      return !!data;
    },
    enabled: !!user && !!requestId,
  });

  // Fulfill request mutation
  const fulfillMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to fulfill a request");
      }

      const { error } = await supabase
        .from("request_fulfillments")
        .insert({
          request_id: requestId,
          user_id: user.id,
        });

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request-fulfillment", requestId] });
      toast({
        title: "Success",
        description: "The request creator has been notified of your interest!",
      });
    },
    onError: (error: any) => {
      console.error("Error fulfilling request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fulfill request. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    hasFulfilled,
    fulfillRequest: fulfillMutation.mutate,
    submitting: fulfillMutation.isPending,
  };
};
