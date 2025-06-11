
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Phone, MapPin, User, Mail } from "lucide-react";
import { useState } from "react";
import { useUserProfiles } from "@/hooks/useUserProfiles";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
  contact_user_id: string | null;
  contact_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

interface OrganizationModalProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateContact: (organizationId: string, contactUserId: string | null) => Promise<boolean>;
}

export const OrganizationModal = ({
  organization,
  open,
  onOpenChange,
  onUpdateContact,
}: OrganizationModalProps) => {
  const { userProfiles } = useUserProfiles();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!organization) return null;

  const handleContactUpdate = async () => {
    if (!organization) return;
    
    setIsUpdating(true);
    const contactUserId = selectedContactId === "none" ? null : selectedContactId;
    const success = await onUpdateContact(organization.id, contactUserId);
    if (success) {
      onOpenChange(false);
    }
    setIsUpdating(false);
  };

  const currentContactName = organization.contact_user 
    ? `${organization.contact_user.first_name} ${organization.contact_user.last_name}`
    : "No contact assigned";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {organization.name}
          </DialogTitle>
          <DialogDescription>
            Organization details and contact management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Organization Information</h3>
            <div className="space-y-3">
              <div>
                <Badge variant="outline">{organization.type}</Badge>
              </div>
              {organization.description && (
                <p className="text-sm text-muted-foreground">{organization.description}</p>
              )}
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{organization.phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{organization.address}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Person Management */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Person</h3>
            
            {/* Current Contact */}
            <div className="space-y-2">
              <h4 className="font-medium">Current Contact</h4>
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{currentContactName}</span>
                {organization.contact_user && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {organization.contact_user.email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Update Contact */}
            <div className="space-y-2">
              <h4 className="font-medium">Update Contact Person</h4>
              <div className="flex gap-2">
                <Select 
                  value={selectedContactId || "none"} 
                  onValueChange={(value) => setSelectedContactId(value === "none" ? null : value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a contact person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No contact</SelectItem>
                    {userProfiles.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleContactUpdate}
                  disabled={isUpdating || (selectedContactId === organization.contact_user_id || (selectedContactId === null && organization.contact_user_id === null))}
                >
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
