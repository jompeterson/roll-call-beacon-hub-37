import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/shared/ImageUpload";
import type { Event } from "@/hooks/useEvents";

interface EventEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onEventUpdated?: () => void;
}

export const EventEditModal = ({ 
  open, 
  onOpenChange, 
  event,
  onEventUpdated 
}: EventEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
    location: event.location || "",
    max_participants: event.max_participants?.toString() || ""
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
      let imageUrls = event.images || [];
      if (images.length > 0) {
        const uploadPromises = images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${event.creator_user_id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('event-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const newImageUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const updateData = {
        title: formData.title,
        description: formData.description || null,
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
        location: formData.location || null,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        images: imageUrls,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event updated successfully!",
      });

      onOpenChange(false);
      onEventUpdated?.();

    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to update event. Please try again.",
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
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">Event Date & Time *</Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => handleInputChange("event_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="Enter event location"
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
              placeholder="Describe the event..."
              rows={4}
            />
          </div>

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            label="Event Images"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.event_date}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Event"}
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