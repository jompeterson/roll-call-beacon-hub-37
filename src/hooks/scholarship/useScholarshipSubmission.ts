
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScholarshipFormData } from "@/components/scholarship/ScholarshipFormData";

interface UseScholarshipSubmissionProps {
  onScholarshipCreated: () => void;
  onClose: () => void;
}

export const useScholarshipSubmission = ({ onScholarshipCreated, onClose }: UseScholarshipSubmissionProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        organization_id: organizationId,
        organization_name: organizationName,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        eligibility_criteria: formData.eligibility_criteria || null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        scholarship_link: formData.scholarship_link || null,
        creator_user_id: userId,
      };

      const { error } = await supabase
        .from("scholarships")
        .insert([scholarshipData]);

      if (error) {
        console.error("Error creating scholarship:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Scholarship created successfully! It will be reviewed by administrators.",
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
