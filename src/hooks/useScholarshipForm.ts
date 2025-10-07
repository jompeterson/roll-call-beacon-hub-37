
import { useScholarshipFormValidation } from "./scholarship/useScholarshipFormValidation";
import { useScholarshipFormState } from "./scholarship/useScholarshipFormState";
import { useScholarshipSubmission } from "./scholarship/useScholarshipSubmission";

interface UseScholarshipFormProps {
  onScholarshipCreated: () => void;
  onClose: () => void;
}

export const useScholarshipForm = ({ onScholarshipCreated, onClose }: UseScholarshipFormProps) => {
  const { validateForm, user, currentOrganization } = useScholarshipFormValidation();
  const { formData, images, handleInputChange, handleImagesChange, resetForm } = useScholarshipFormState();
  const { isSubmitting, submitScholarship } = useScholarshipSubmission({ onScholarshipCreated, onClose });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    if (!user?.id || !currentOrganization) {
      return;
    }

    await submitScholarship(
      formData,
      user.id,
      currentOrganization.id,
      currentOrganization.name,
      images,
      resetForm
    );
  };

  return {
    formData,
    images,
    isSubmitting,
    currentOrganization,
    handleInputChange,
    handleImagesChange,
    handleSubmit,
    resetForm,
  };
};
