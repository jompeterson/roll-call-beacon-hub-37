
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useDonationForm } from "@/hooks/useDonationForm";
import { useDonationFormSubmission } from "./DonationFormSubmission";
import { DonationFormBasicFields } from "./DonationFormBasicFields";
import { DonationFormOrganizationField } from "./DonationFormOrganizationField";
import { DonationFormContactFields } from "./DonationFormContactFields";
import { DonationImageUpload } from "./DonationImageUpload";
import { PrivatePostToggle } from "@/components/shared/PrivatePostToggle";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { LocationFields } from "@/components/shared/LocationFields";

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
          <DialogTitle>Create New In-Kind Donation Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DonationFormBasicFields 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <LocationFields
            idPrefix="donation-create-location"
            value={formData.location}
            onChange={(value) => handleInputChange("location", value)}
            required
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
            <p className="text-sm text-muted-foreground">
              Please provide as much detail about your donation as possible.
            </p>
            <RichTextEditor
              id="description"
              value={formData.description}
              onChange={(html) => handleInputChange("description", html)}
              placeholder="Describe your donation..."
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="can_deliver"
                checked={formData.can_deliver}
                onCheckedChange={(checked) => handleInputChange("can_deliver", checked)}
              />
              <Label htmlFor="can_deliver" className="cursor-pointer">
                Can Deliver
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="must_take_all"
                checked={formData.must_take_all}
                onCheckedChange={(checked) => handleInputChange("must_take_all", checked)}
              />
              <Label htmlFor="must_take_all" className="cursor-pointer">
                Must Take All
              </Label>
            </div>

            {formData.can_deliver && (
              <div className="space-y-2 pl-6">
                <Label htmlFor="delivery_miles">Delivery Miles</Label>
                <Input
                  id="delivery_miles"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.delivery_miles}
                  onChange={(e) => handleInputChange("delivery_miles", e.target.value)}
                  placeholder="Enter maximum delivery distance in miles"
                />
              </div>
            )}
          </div>

          <DonationImageUpload
            images={formData.images}
            onImagesChange={(images) => handleInputChange("images", images)}
          />

          <PrivatePostToggle
            isPrivate={formData.is_private}
            onChange={(value) => handleInputChange("is_private", value)}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.estimated_value || !formData.donation_type || !formData.location}
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
