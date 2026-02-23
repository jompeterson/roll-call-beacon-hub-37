
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface OrganizationImageUploadProps {
  organizationId: string;
  organizationName: string;
  imageUrl?: string | null;
  onImageUpdated?: (url: string) => void;
  disabled?: boolean;
}

export const OrganizationImageUpload = ({
  organizationId,
  organizationName,
  imageUrl,
  onImageUpdated,
  disabled = false,
}: OrganizationImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${organizationId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('organization-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('organization-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ image_url: publicUrl })
        .eq('id', organizationId);

      if (updateError) throw updateError;

      onImageUpdated?.(publicUrl);
      toast({
        title: "Organization image updated",
        description: "The organization image has been successfully updated.",
      });
    } catch (error) {
      console.error('Error uploading organization image:', error);
      toast({
        title: "Error",
        description: "Failed to upload organization image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={imageUrl || undefined} alt={organizationName} />
        <AvatarFallback>
          <Building className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading || disabled}
        />
        <Button
          variant="outline"
          size="sm"
          disabled={uploading || disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {uploading ? "Uploading..." : "Change Photo"}
        </Button>
      </div>
    </div>
  );
};
