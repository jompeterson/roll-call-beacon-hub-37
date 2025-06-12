
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrganizationFormData, OrganizationType, organizationTypes } from "./types";

interface OrganizationFormFieldsProps {
  formData: OrganizationFormData;
  onInputChange: (field: string, value: string) => void;
  isSubmitting: boolean;
  nameExists: boolean;
  errors: { [key: string]: string };
}

export const OrganizationFormFields = ({ 
  formData, 
  onInputChange, 
  isSubmitting, 
  nameExists, 
  errors 
}: OrganizationFormFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          placeholder="Enter organization name"
          required
          disabled={isSubmitting}
          className={nameExists ? "border-destructive" : ""}
        />
        {nameExists && (
          <p className="text-sm text-destructive">An organization with this name already exists</p>
        )}
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Organization Type</Label>
        <Select 
          value={formData.type} 
          onValueChange={(value: OrganizationType) => onInputChange("type", value)}
          disabled={isSubmitting}
        >
          <SelectTrigger>
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Describe your organization's mission and activities"
          className="min-h-[100px]"
          required
          disabled={isSubmitting}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onInputChange("phone", e.target.value)}
          placeholder="Enter phone number"
          required
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          placeholder="Enter organization address"
          required
          disabled={isSubmitting}
        />
        {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
      </div>
    </>
  );
};
