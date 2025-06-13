
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface DonationFormData {
  title: string;
  description: string;
  estimated_value: string;
  target_date: string;
  donation_link: string;
  contact_email: string;
  contact_phone: string;
  organization_name: string;
  organization_id: string;
  weight: string;
}

interface DonationFormSubmissionProps {
  formData: DonationFormData;
  setIsSubmitting: (value: boolean) => void;
  onSuccess: () => void;
  resetForm: () => void;
}

export const useDonationFormSubmission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitDonation = async ({ 
    formData, 
    setIsSubmitting, 
    onSuccess, 
    resetForm 
  }: DonationFormSubmissionProps) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a donation post.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const donationData = {
        title: formData.title,
        description: formData.description || null,
        amount_needed: parseFloat(formData.estimated_value),
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
        donation_link: formData.donation_link || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        organization_name: formData.organization_name || null,
        creator_user_id: user.id,
        organization_id: formData.organization_id || null,
        amount_raised: 0,
        is_approved: false,
        approval_decision_made: false,
        weight: formData.weight ? parseFloat(formData.weight) : 0
      };

      const { error } = await supabase
        .from("donations")
        .insert([donationData]);

      if (error) {
        throw error;
      }

      // Invalidate all relevant queries to trigger real-time updates
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['pending-donations'] });

      toast({
        title: "Success",
        description: "Donation post created successfully!",
      });

      resetForm();
      onSuccess();

    } catch (error) {
      console.error("Error creating donation:", error);
      toast({
        title: "Error",
        description: "Failed to create donation post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitDonation };
};
