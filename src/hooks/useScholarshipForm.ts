
import { useScholarshipFormValidation } from "./scholarship/useScholarshipFormValidation";
import { useScholarshipFormState } from "./scholarship/useScholarshipFormState";
import { useScholarshipSubmission } from "./scholarship/useScholarshipSubmission";

interface SelectedOrganization {
  id: string;
  name: string;
}

interface UseScholarshipFormProps {
  onScholarshipCreated: () => void;
  onClose: () => void;
  overrideOrganization?: SelectedOrganization | null;
}

export const useScholarshipForm = ({ onScholarshipCreated, onClose, overrideOrganization }: UseScholarshipFormProps) => {
  const { validateForm, user, currentOrganization } = useScholarshipFormValidation();
  const { formData, images, handleInputChange, handleImagesChange, resetForm } = useScholarshipFormState();
  const { isSubmitting, submitScholarship } = useScholarshipSubmission({ onScholarshipCreated, onClose });

  const effectiveOrganization = overrideOrganization || currentOrganization;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    if (!user?.id || !effectiveOrganization) {
      return;
    }

    await submitScholarship(
      formData,
      user.id,
      effectiveOrganization.id,
      effectiveOrganization.name,
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
