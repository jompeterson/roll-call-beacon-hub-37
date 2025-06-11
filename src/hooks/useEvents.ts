
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching events:", error);
        throw new Error(error.message);
      }

      return data as Event[];
    },
  });

  const approveEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .update({ 
          is_approved: true, 
          approval_decision_made: true 
        })
        .eq("id", eventId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["pending-events"] });
      toast({
        title: "Success",
        description: "Event approved successfully!",
      });
    },
    onError: (error) => {
      console.error("Error approving event:", error);
      toast({
        title: "Error",
        description: "Failed to approve event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("events")
        .update({ 
          is_approved: false, 
          approval_decision_made: true 
        })
        .eq("id", eventId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["pending-events"] });
      toast({
        title: "Success",
        description: "Event rejected successfully.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      console.error("Error rejecting event:", error);
      toast({
        title: "Error",
        description: "Failed to reject event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveEvent = (eventId: string) => {
    approveEventMutation.mutate(eventId);
  };

  const rejectEvent = (eventId: string) => {
    rejectEventMutation.mutate(eventId);
  };

  return {
    events,
    loading,
    error,
    approveEvent,
    rejectEvent,
  };
};
