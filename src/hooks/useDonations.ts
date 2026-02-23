
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

export type Donation = Tables<"donations">;

export const useDonations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching donations:", error);
        throw error;
      }

      return data as Donation[];
    },
  });

  const deleteDonationMutation = useMutation({
    mutationFn: async (donationId: string) => {
      const { error } = await supabase
        .from("donations")
        .delete()
        .eq("id", donationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({
        title: "Success",
        description: "Donation deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting donation:", error);
      toast({
        title: "Error",
        description: "Failed to delete donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    deleteDonation: deleteDonationMutation.mutate,
    isDeletingDonation: deleteDonationMutation.isPending,
  };
};
