import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScholarshipFormFields } from "./ScholarshipFormFields";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface ScholarshipEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scholarship: any;
  onScholarshipUpdated?: () => void;
}

export const ScholarshipEditModal = ({ 
  open, 
  onOpenChange, 
  scholarship,
  onScholarshipUpdated 
}: ScholarshipEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: scholarship.title,
    description: scholarship.description || "",
    amount: scholarship.amount?.toString() || "",
    application_deadline: scholarship.application_deadline ? new Date(scholarship.application_deadline).toISOString().split('T')[0] : "",
    eligibility_criteria: scholarship.eligibility_criteria || "",
    organization_name: scholarship.organization_name || "",
    contact_email: scholarship.contact_email || "",
    contact_phone: scholarship.contact_phone || "",
    scholarship_link: scholarship.scholarship_link || ""
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload new images if any
      let imageUrls = scholarship.images || [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${scholarship.creator_user_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('scholarship-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('scholarship-images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const updateData = {
        title: formData.title,
        description: formData.description || null,
        amount: parseFloat(formData.amount) || 0,
        application_deadline: formData.application_deadline ? new Date(formData.application_deadline).toISOString() : null,
        eligibility_criteria: formData.eligibility_criteria || null,
        organization_name: formData.organization_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        scholarship_link: formData.scholarship_link || null,
        images: imageUrls,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("scholarships")
        .update(updateData)
        .eq("id", scholarship.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scholarship updated successfully!",
      });

      onOpenChange(false);
      onScholarshipUpdated?.();

    } catch (error) {
      console.error("Error updating scholarship:", error);
      toast({
        title: "Error",
        description: "Failed to update scholarship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Scholarship</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ScholarshipFormFields
            formData={formData}
            images={images}
            onInputChange={handleInputChange}
            onImagesChange={setImages}
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.amount}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Scholarship"}
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