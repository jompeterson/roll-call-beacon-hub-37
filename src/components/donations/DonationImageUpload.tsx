import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DonationImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
}

export const DonationImageUpload = ({ images, onImagesChange }: DonationImageUploadProps) => {
  const { toast } = useToast();
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of images
    if (images.length + files.length > 3) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 3 images.",
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JPG, PNG, or WEBP images.",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
    
    // Update images
    onImagesChange([...images, ...files]);
    
    // Clear input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    // Revoke the preview URL to free memory
    URL.revokeObjectURL(previewUrls[index]);
    
    const newImages = images.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    onImagesChange(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="images">
        Images <span className="text-sm text-muted-foreground">(Optional, max 3)</span>
      </Label>
      
      {/* Image previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => removeImage(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {images.length < 3 && (
        <div className="flex items-center gap-2">
          <Input
            id="images"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('images')?.click()}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {images.length === 0 ? 'Upload Images' : `Add More (${images.length}/3)`}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Accepted formats: JPG, PNG, WEBP. Max size: 5MB per image.
      </p>
    </div>
  );
};
