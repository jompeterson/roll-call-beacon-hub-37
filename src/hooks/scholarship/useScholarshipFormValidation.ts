
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import { ScholarshipFormData } from "@/components/scholarship/ScholarshipFormData";

export const useScholarshipFormValidation = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useProfileData();

  const validateForm = (formData: ScholarshipFormData): boolean => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a scholarship",
        variant: "destructive",
      });
      return false;
    }

    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "You must be associated with an organization to create a scholarship",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.title || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    validateForm,
    user,
    currentOrganization,
  };
};
