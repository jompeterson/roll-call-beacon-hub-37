
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageSectionProps {
  contactInfo: {
    firstName: string;
    lastName: string;
  };
}

export const ProfileImageSection = ({ contactInfo }: ProfileImageSectionProps) => {
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState("/placeholder.svg");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: "Profile image updated",
        description: "Your profile image has been successfully updated.",
      });
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
          <AvatarImage src={profileImage} alt="Profile" />
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
          />
          <Label htmlFor="profile-upload" asChild>
            <Button variant="outline" className="cursor-pointer">
              <Camera className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
          </Label>
        </div>
      </CardContent>
    </Card>
  );
};
