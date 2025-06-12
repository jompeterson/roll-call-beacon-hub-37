
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/hooks/useOrganizations";
import { OrganizationFormData, OrganizationType } from "@/components/organizations/types";

export const useOrganizationFormSubmission = () => {
  const { toast } = useToast();
  const { refetch } = useOrganizations();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrganization = async (formData: OrganizationFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name.trim(),
          type: formData.type as OrganizationType,
          description: formData.description.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          is_approved: false,
          approval_decision_made: false
        });

      if (error) {
        console.error('Error creating organization:', error);
        toast({
          title: "Error",
          description: "Failed to create organization. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Organization Created",
        description: "Your organization has been submitted for approval.",
      });

      await refetch();
      return true;
      
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitOrganization
  };
};
