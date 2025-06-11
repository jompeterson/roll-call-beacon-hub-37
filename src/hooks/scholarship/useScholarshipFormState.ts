
import { useState, useEffect } from "react";
import { useProfileData } from "@/hooks/useProfileData";
import { ScholarshipFormData, createInitialFormData } from "@/components/scholarship/ScholarshipFormData";

export const useScholarshipFormState = () => {
  const { userProfile } = useProfileData();
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

  return {
    formData,
    handleInputChange,
    resetForm,
  };
};
