
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RegistrationData } from "@/pages/Register";

interface NewOrganizationStepProps {
  data: RegistrationData;
  onNext: () => void;
  onBack: () => void;
  onUpdate: (data: Partial<RegistrationData>) => void;
  isSubmitting?: boolean;
}

const organizationTypes = [
  "Non-Profit",
  "Educational Institution",
  "Community Group",
  "Religious Organization",
  "Sports Club",
  "Professional Association",
  "Other"
];

export const NewOrganizationStep = ({ data, onNext, onBack, onUpdate, isSubmitting = false }: NewOrganizationStepProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const orgData = data.newOrganization;
    
    if (!orgData?.name?.trim()) newErrors.name = "Organization name is required";
    if (!orgData?.type?.trim()) newErrors.type = "Organization type is required";
    if (!orgData?.description?.trim()) newErrors.description = "Description is required";
    if (!orgData?.address?.trim()) newErrors.address = "Address is required";
    if (!orgData?.phone?.trim()) newErrors.phone = "Phone number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const updateOrganizationData = (field: string, value: string) => {
    onUpdate({
      newOrganization: {
        ...data.newOrganization,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground">Organization Details</h2>
        <p className="text-muted-foreground mt-2">
          Tell us about your new organization
        </p>
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                value={data.newOrganization?.name || ""}
                onChange={(e) => updateOrganizationData("name", e.target.value)}
                placeholder="Enter organization name"
                className="h-12"
                required
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgType">Organization Type</Label>
              <Select 
                value={data.newOrganization?.type || ""} 
                onValueChange={(value) => updateOrganizationData("type", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select organization type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgDescription">Description</Label>
              <Textarea
                id="orgDescription"
                value={data.newOrganization?.description || ""}
                onChange={(e) => updateOrganizationData("description", e.target.value)}
                placeholder="Describe your organization's mission and activities"
                className="min-h-[100px]"
                required
                disabled={isSubmitting}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgAddress">Organization Address</Label>
              <Input
                id="orgAddress"
                value={data.newOrganization?.address || ""}
                onChange={(e) => updateOrganizationData("address", e.target.value)}
                placeholder="Enter organization address"
                className="h-12"
                required
                disabled={isSubmitting}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="orgPhone">Organization Phone</Label>
              <Input
                id="orgPhone"
                value={data.newOrganization?.phone || ""}
                onChange={(e) => updateOrganizationData("phone", e.target.value)}
                placeholder="Enter organization phone number"
                className="h-12"
                required
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack} 
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
