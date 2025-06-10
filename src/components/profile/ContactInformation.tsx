
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ContactInformationProps {
  contactInfo: ContactInfo;
  onContactInfoChange: (info: ContactInfo) => void;
}

export const ContactInformation = ({ contactInfo, onContactInfoChange }: ContactInformationProps) => {
  const { toast } = useToast();

  const handleContactSave = () => {
    toast({
      title: "Contact information saved",
      description: "Your contact information has been successfully updated.",
    });
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    const updatedInfo = {
      ...contactInfo,
      [field]: value
    };
    onContactInfoChange(updatedInfo);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Update your personal contact details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={contactInfo.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={contactInfo.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={contactInfo.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={contactInfo.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />
        </div>
        <Button onClick={handleContactSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          Save Contact Information
        </Button>
      </CardContent>
    </Card>
  );
};
