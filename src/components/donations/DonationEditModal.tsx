
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DonationFormBasicFields } from "./DonationFormBasicFields";
import { DonationFormOrganizationField } from "./DonationFormOrganizationField";
import { DonationFormContactFields } from "./DonationFormContactFields";
import { DonationImageUpload } from "./DonationImageUpload";
import { SubmitForReviewDialog } from "@/components/shared/SubmitForReviewDialog";
import type { Donation } from "@/hooks/useDonations";

interface DonationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation;
  onDonationUpdated?: () => void;
  hasChangeRequest?: boolean;
}

interface Organization {
  id: string;
  name: string;
}

export const DonationEditModal = ({ 
  open, 
  onOpenChange, 
  donation,
  onDonationUpdated,
  hasChangeRequest = false,
}: DonationEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formData, setFormData] = useState({
    title: donation.title,
    description: donation.description || "",
    material_type: (donation as any).material_type || "",
    estimated_value: donation.amount_needed?.toString() || "",
    donation_type: (donation as any).donation_type || "",
    target_date: donation.target_date ? new Date(donation.target_date).toISOString().split('T')[0] : "",
    weight: donation.weight?.toString() || "",
    organization_name: donation.organization_name || "",
    organization_id: donation.organization_id || "",
    contact_email: donation.contact_email || "",
    contact_phone: donation.contact_phone || "",
    donation_link: donation.donation_link || "",
    can_deliver: donation.can_deliver || false,
    delivery_miles: donation.delivery_miles?.toString() || "",
    service_type: (donation as any).service_type || "",
    hours_available: (donation as any).hours_available?.toString() || "",
    equipment_type: (donation as any).equipment_type || "",
    mileage: (donation as any).mileage?.toString() || "",
    facility_type: (donation as any).facility_type || "",
    capacity: (donation as any).capacity?.toString() || "",
    location: (donation as any).location || "",
    dimensions: (donation as any).dimensions?.toString() || "",
    dimension_unit: (donation as any).dimension_unit || "",
    quantity: (donation as any).quantity?.toString() || "",
    images: [] as File[]
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_approved', true)
        .order('name');

      if (!error && data) {
        setOrganizations(data);
      }
    };

    if (open) {
      fetchOrganizations();
    }
  }, [open]);

  const handleInputChange = (field: string, value: string | boolean | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOrganizationChange = (organizationId: string) => {
    const selectedOrg = organizations.find(org => org.id === organizationId);
    setFormData(prev => ({
      ...prev,
      organization_id: organizationId,
      organization_name: selectedOrg?.name || ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrls = donation.images || [];
      if (formData.images.length > 0) {
        const uploadPromises = formData.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${donation.creator_user_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('donation-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('donation-images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const updateData: Record<string, unknown> = {
        title: formData.title,
        description: formData.description || null,
        amount_needed: parseFloat(formData.estimated_value) || 0,
        donation_type: formData.donation_type || null,
        organization_name: formData.organization_name || null,
        organization_id: formData.organization_id || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        donation_link: formData.donation_link || null,
        can_deliver: formData.can_deliver,
        delivery_miles: formData.delivery_miles ? parseFloat(formData.delivery_miles) : null,
        images: imageUrls,
        updated_at: new Date().toISOString(),
        target_date: formData.target_date ? new Date(formData.target_date).toISOString() : null,
      };

      const isPhysical = ["Tools", "Materials", "Other"].includes(formData.donation_type);
      updateData.weight = isPhysical && formData.weight ? parseFloat(formData.weight) : null;
      updateData.material_type = isPhysical ? (formData.material_type || null) : null;
      updateData.dimensions = isPhysical && formData.dimensions ? parseFloat(formData.dimensions) : null;
      updateData.dimension_unit = isPhysical ? (formData.dimension_unit || null) : null;
      updateData.quantity = isPhysical && formData.quantity ? parseInt(formData.quantity) : null;
      updateData.service_type = formData.donation_type === "Professional Services / Labor" ? (formData.service_type || null) : null;
      updateData.hours_available = formData.donation_type === "Professional Services / Labor" && formData.hours_available ? parseFloat(formData.hours_available) : null;
      updateData.equipment_type = formData.donation_type === "Transportation / Equipment Use" ? (formData.equipment_type || null) : null;
      updateData.mileage = formData.donation_type === "Transportation / Equipment Use" && formData.mileage ? parseFloat(formData.mileage) : null;
      updateData.facility_type = formData.donation_type === "Facility Use" ? (formData.facility_type || null) : null;
      updateData.capacity = formData.donation_type === "Facility Use" && formData.capacity ? parseInt(formData.capacity) : null;
      updateData.location = formData.location || null;

      const { error } = await supabase
        .from("donations")
        .update(updateData)
        .eq("id", donation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Donation post updated successfully!",
      });

      if (hasChangeRequest) {
        setShowReviewDialog(true);
      } else {
        onOpenChange(false);
        onDonationUpdated?.();
      }

    } catch (error) {
      console.error("Error updating donation:", error);
      toast({
        title: "Error",
        description: "Failed to update donation post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit In-Kind Donation Post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <DonationFormBasicFields 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Address, City, State, ZIP"
              required
            />
          </div>

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

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.estimated_value || !formData.donation_type || !formData.location}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Donation Post"}
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
    <SubmitForReviewDialog
      open={showReviewDialog}
      onOpenChange={setShowReviewDialog}
      contentType="donation"
      contentId={donation.id}
      contentTitle={donation.title}
      onComplete={() => {
        onOpenChange(false);
        onDonationUpdated?.();
      }}
    />
  </>
  );
};
