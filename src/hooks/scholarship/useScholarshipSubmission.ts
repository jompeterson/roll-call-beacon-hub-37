
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ScholarshipFormData } from "@/components/scholarship/ScholarshipFormData";

interface UseScholarshipSubmissionProps {
  onScholarshipCreated: () => void;
  onClose: () => void;
}

export const useScholarshipSubmission = ({ 
  onScholarshipCreated, 
  onClose 
}: UseScholarshipSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitScholarship = async (
    formData: ScholarshipFormData,
    userId: string,
    organizationId: string,
    organizationName: string,
    resetForm: () => void
  ) => {
    setIsSubmitting(true);

    try {
      const scholarshipData = {
        title: formData.title,
        description: formData.description || null,
        amount: parseFloat(formData.amount),
        application_deadline: formData.application_deadline 
          ? new Date(formData.application_deadline).toISOString() 
          : null,
        eligibility_criteria: formData.eligibility_criteria || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        scholarship_link: formData.scholarship_link || null,
        creator_user_id: userId,
        organization_id: organizationId,
        organization_name: organizationName,
        is_approved: false,
        approval_decision_made: false
      };

      const { error } = await supabase
        .from("scholarships")
        .insert([scholarshipData]);

      if (error) {
        throw error;
      }

      // Invalidate all relevant queries to trigger real-time updates
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['pending-scholarships'] });

      toast({
        title: "Success",
        description: "Scholarship created successfully and submitted for approval!",
      });

      resetForm();
      onClose();
      onScholarshipCreated();

    } catch (error) {
      console.error("Error creating scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to create scholarship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitScholarship,
  };
};
