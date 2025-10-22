import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { Volunteer } from "@/hooks/useVolunteers";

interface VolunteerEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteer: Volunteer;
  onVolunteerUpdated?: () => void;
}

export const VolunteerEditModal = ({ 
  open, 
  onOpenChange, 
  volunteer,
  onVolunteerUpdated 
}: VolunteerEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: volunteer.title,
    description: volunteer.description || "",
    start_date: volunteer.start_date ? new Date(volunteer.start_date).toISOString().slice(0, 16) : "",
    end_date: volunteer.end_date ? new Date(volunteer.end_date).toISOString().slice(0, 16) : "",
    location: volunteer.location || "",
    max_participants: volunteer.max_participants?.toString() || ""
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
      let imageUrls = volunteer.images || [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${volunteer.creator_user_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('volunteer-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('volunteer-images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const updateData = {
        title: formData.title,
        description: formData.description || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        location: formData.location || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        images: imageUrls,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("volunteers")
        .update(updateData)
        .eq("id", volunteer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Volunteer opportunity updated successfully!",
      });

      onOpenChange(false);
      onVolunteerUpdated?.();

    } catch (error) {
      console.error("Error updating volunteer opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to update volunteer opportunity. Please try again.",
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
          <DialogTitle>Edit Volunteer Opportunity</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Opportunity Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter opportunity title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => handleInputChange("max_participants", e.target.value)}
                placeholder="No limit"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe the volunteer opportunity..."
              rows={4}
            />
          </div>

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Opportunity Images"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.start_date}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Opportunity"}
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