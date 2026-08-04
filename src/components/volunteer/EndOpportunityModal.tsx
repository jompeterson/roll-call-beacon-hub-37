import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EndOpportunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  volunteerId: string;
  volunteerTitle: string;
  onEnded?: () => void;
}

const MAX_PHOTOS = 10;

export const EndOpportunityModal = ({
  open,
  onOpenChange,
  volunteerId,
  volunteerTitle,
  onEnded,
}: EndOpportunityModalProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<string[]>([""]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addItem = () => setItems((prev) => [...prev, ""]);
  const removeItem = (index: number) =>
    setItems((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== index)));

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length !== files.length) {
      toast({
        title: "Some files skipped",
        description: "Only image files can be added.",
        variant: "destructive",
      });
    }

    setPhotos((prev) => {
      const combined = [...prev, ...images];
      if (combined.length > MAX_PHOTOS) {
        toast({
          title: "Photo limit reached",
          description: `You can add up to ${MAX_PHOTOS} photos.`,
        });
      }
      return combined.slice(0, MAX_PHOTOS);
    });
  };

  const removePhoto = (index: number) =>
    setPhotos((prev) => prev.filter((_, i) => i !== index));

  const uploadPhotos = async () => {
    if (photos.length === 0) return [] as string[];
    const urls = await Promise.all(
      photos.map(async (file) => {
        const ext = file.name.split(".").pop() || "jpg";
        const filePath = `${volunteerId}/completion/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("volunteer-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("volunteer-images").getPublicUrl(filePath);
        return publicUrl;
      })
    );
    return urls;
  };

  const handleSubmit = async () => {
    const accomplishments = items.map((i) => i.trim()).filter(Boolean);
    if (accomplishments.length === 0) {
      toast({
        title: "Accomplishments required",
        description: "Add at least one thing that was accomplished.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const completionImages = await uploadPhotos();
      const sessionToken = localStorage.getItem("session_token");
      const { data, error } = await supabase.functions.invoke("end-volunteer-opportunity", {
        body: { sessionToken, volunteerId, accomplishments, completionImages },
      });

      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      toast({
        title: "Opportunity ended",
        description: `Thank-you emails were sent to ${(data as any)?.sent ?? 0} participant(s).`,
      });
      onOpenChange(false);
      setItems([""]);
      setPhotos([]);
      onEnded?.();
    } catch (err: any) {
      console.error("Failed to end opportunity:", err);
      toast({
        title: "Failed to end opportunity",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>End Opportunity</DialogTitle>
          <DialogDescription>
            List what was accomplished during "{volunteerTitle}" and add photos from the day. Once submitted, the
            opportunity is officially ended and every participant receives a thank-you email with these
            accomplishments and photos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label>Accomplishments</Label>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={item}
                  maxLength={500}
                  placeholder={`Accomplishment ${index + 1}`}
                  onChange={(e) => updateItem(index, e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Remove accomplishment"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} disabled={items.length >= 50}>
            <Plus className="h-4 w-4 mr-2" />
            Add accomplishment
          </Button>
        </div>

        <div className="space-y-3">
          <Label htmlFor="completion-photos">Photos (optional, up to {MAX_PHOTOS})</Label>
          <Input
            id="completion-photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            disabled={submitting || photos.length >= MAX_PHOTOS}
          />
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((file, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Selected photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute right-1 top-1 h-6 w-6"
                    aria-label={`Remove photo ${index + 1}`}
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {photos.length === 0 && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              You can select multiple photos at once.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Ending..." : "End Opportunity & Send Emails"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
