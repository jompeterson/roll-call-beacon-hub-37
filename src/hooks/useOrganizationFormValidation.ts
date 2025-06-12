
import { useState } from "react";
import { OrganizationFormData } from "@/components/organizations/types";
import { useOrganizations } from "@/hooks/useOrganizations";

export const useOrganizationFormValidation = () => {
  const { organizations } = useOrganizations();
  const [nameExists, setNameExists] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const checkNameExists = (name: string) => {
    if (!name.trim()) {
      setNameExists(false);
      return;
    }
    
    const exists = organizations.some(org => 
      org.name.toLowerCase() === name.toLowerCase()
    );
    setNameExists(exists);
  };

  const validateForm = (formData: OrganizationFormData) => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) newErrors.name = "Organization name is required";
    if (nameExists) newErrors.name = "An organization with this name already exists";
    if (!formData.type.trim()) newErrors.type = "Organization type is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const resetValidation = () => {
    setErrors({});
    setNameExists(false);
  };

  return {
    nameExists,
    errors,
    checkNameExists,
    validateForm,
    clearError,
    resetValidation
  };
};
