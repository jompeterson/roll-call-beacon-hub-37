
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { ScholarshipFormData, createInitialFormData } from "@/components/scholarship/ScholarshipFormData";

interface UseScholarshipFormProps {
  onScholarshipCreated: () => void;
  onClose: () => void;
}

export const useScholarshipForm = ({ onScholarshipCreated, onClose }: UseScholarshipFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization, userProfile } = useProfileData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ScholarshipFormData>(createInitialFormData());

  // Pre-fill contact information when user profile is available
  useEffect(() => {
    if (userProfile) {
      setFormData(createInitialFormData(userProfile));
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData(createInitialFormData(userProfile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a scholarship",
        variant: "destructive",
      });
      return;
    }

    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "You must be associated with an organization to create a scholarship",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const scholarshipData = {
        title: formData.title,
        organization_id: currentOrganization.id,
        organization_name: currentOrganization.name,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        eligibility_criteria: formData.eligibility_criteria || null,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        scholarship_link: formData.scholarship_link || null,
        creator_user_id: user.id,
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
    formData,
    isSubmitting,
    currentOrganization,
    handleInputChange,
    handleSubmit,
    resetForm,
  };
};
