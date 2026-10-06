import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/shared/ImageUpload";

interface RequestPhotoUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  existingImages?: string[];
  onExistingImagesChange?: (images: string[]) => void;
  disabled: boolean;
}

export const RequestPhotoUpload = ({ images, onImagesChange, existingImages = [], onExistingImagesChange, disabled }: RequestPhotoUploadProps) => (
  <fieldset disabled={disabled} className="space-y-2 min-w-0">
    {existingImages.length > 0 && (
      <div className="grid grid-cols-3 gap-2">
        {existingImages.map((url, index) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border">
            <img src={url} alt={`Request photo ${index + 1}`} className="w-full h-full object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" aria-label={`Remove request photo ${index + 1}`} onClick={() => onExistingImagesChange?.(existingImages.filter((_, i) => i !== index))}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    )}
    <ImageUpload label="Request Photos" images={images} onImagesChange={onImagesChange} maxImages={3} existingImagesCount={existingImages.length} />
  </fieldset>
);