
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { OrganizationFormFields } from "@/components/organizations/OrganizationFormFields";
import { useOrganizationFormValidation } from "@/hooks/useOrganizationFormValidation";
import { useOrganizationFormSubmission } from "@/hooks/useOrganizationFormSubmission";
import { OrganizationCreateModalProps, OrganizationFormData } from "@/components/organizations/types";

export const OrganizationCreateModal = ({ open, onOpenChange, onOrganizationCreated }: OrganizationCreateModalProps) => {
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: "",
    type: "",
    description: "",
    phone: "",
    address: ""
  });

  const { 
    nameExists, 
    errors, 
    checkNameExists, 
    validateForm, 
    clearError, 
    resetValidation 
  } = useOrganizationFormValidation();

  const { isSubmitting, submitOrganization } = useOrganizationFormSubmission();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
    
    if (field === "name") {
      checkNameExists(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(formData)) {
      return;
    }

    const success = await submitOrganization(formData);
    
    if (success) {
      resetForm();
      onOpenChange(false);
      onOrganizationCreated();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      phone: "",
      address: ""
    });
    resetValidation();
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new organization. It will be submitted for approval.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <OrganizationFormFields
            formData={formData}
            onInputChange={handleInputChange}
            isSubmitting={isSubmitting}
            nameExists={nameExists}
            errors={errors}
          />

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSubmitting || nameExists}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
