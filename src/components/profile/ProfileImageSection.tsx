
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileImageSectionProps {
  contactInfo: {
    firstName: string;
    lastName: string;
  };
  userId?: string;
  profileImageUrl?: string | null;
  onImageUpdated?: (url: string) => void;
}

export const ProfileImageSection = ({ contactInfo, userId, profileImageUrl, onImageUpdated }: ProfileImageSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      // Save URL to user_profiles
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image_url: publicUrl } as any)
        .eq('id', userId);

      if (updateError) throw updateError;

      onImageUpdated?.(publicUrl);
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Image</CardTitle>
        <CardDescription>
          Update your profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profileImageUrl || "/placeholder.svg"} alt="Profile" />
          <AvatarFallback>
            {contactInfo.firstName.charAt(0)}{contactInfo.lastName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="profile-upload"
            disabled={uploading}
          />
          <Label htmlFor="profile-upload" asChild>
            <Button variant="outline" className="cursor-pointer" disabled={uploading}>
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Camera className="h-4 w-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Change Photo"}
            </Button>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
