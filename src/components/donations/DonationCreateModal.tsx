
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDonationForm } from "@/hooks/useDonationForm";
import { useDonationFormSubmission } from "./DonationFormSubmission";
import { DonationFormBasicFields } from "./DonationFormBasicFields";
import { DonationFormOrganizationField } from "./DonationFormOrganizationField";
import { DonationFormContactFields } from "./DonationFormContactFields";

interface DonationCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDonationCreated?: () => void;
}

export const DonationCreateModal = ({ 
  open, 
  onOpenChange, 
  onDonationCreated 
}: DonationCreateModalProps) => {
  const {
    formData,
    organizations,
    isSubmitting,
    setIsSubmitting,
    handleInputChange,
    handleOrganizationChange,
    resetForm
  } = useDonationForm(open);

  const { submitDonation } = useDonationFormSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await submitDonation({
      formData,
      setIsSubmitting,
      onSuccess: () => {
        onOpenChange(false);
        onDonationCreated?.();
      },
      resetForm
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Donation Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DonationFormBasicFields 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DonationFormOrganizationField
              formData={formData}
              organizations={organizations}
              onOrganizationChange={handleOrganizationChange}
            />

            <DonationFormContactFields
              formData={formData}
              onInputChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your donation needs..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.estimated_value || !formData.donation_type}
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Create Donation Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
