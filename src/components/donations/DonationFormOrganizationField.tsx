
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface Organization {
  id: string;
  name: string;
}

interface DonationFormOrganizationFieldProps {
  formData: {
    organization_name: string;
    organization_id: string;
  };
  organizations: Organization[];
  onOrganizationChange: (organizationId: string) => void;
}

export const DonationFormOrganizationField = ({ 
  formData, 
  organizations, 
  onOrganizationChange 
}: DonationFormOrganizationFieldProps) => {
  const { isAdministrator } = useAuth();

  return (
    <div className="space-y-2">
      <Label htmlFor="organization_name">Organization Name</Label>
      {isAdministrator ? (
        <Select value={formData.organization_id} onValueChange={onOrganizationChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id="organization_name"
          value={formData.organization_name}
          readOnly
          className="bg-muted"
        />
      )}
    </div>
  );
};
