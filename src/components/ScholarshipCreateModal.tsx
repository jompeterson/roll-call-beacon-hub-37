
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useScholarshipForm } from "@/hooks/useScholarshipForm";
import { ScholarshipFormFields } from "@/components/scholarship/ScholarshipFormFields";

interface ScholarshipCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScholarshipCreated: () => void;
}

export const ScholarshipCreateModal = ({
  open,
  onOpenChange,
  onScholarshipCreated,
}: ScholarshipCreateModalProps) => {
  const {
    formData,
    isSubmitting,
    currentOrganization,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = useScholarshipForm({
    onScholarshipCreated,
    onClose: () => onOpenChange(false),
  });

  const handleModalChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  if (!currentOrganization) {
    return (
      <Dialog open={open} onOpenChange={handleModalChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cannot Create Scholarship</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You must be associated with an organization to create scholarships. 
              Please contact an administrator to be added to an organization.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleModalChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleModalChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Scholarship</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Creating scholarship for: <span className="font-medium">{currentOrganization.name}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <ScholarshipFormFields
            formData={formData}
            onInputChange={handleInputChange}
          />

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleModalChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Scholarship"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
