
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Phone, MapPin, User, Mail, CheckCircle, XCircle, Clock, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useAuth } from "@/hooks/useAuth";
import { OrganizationImageUpload } from "@/components/organizations/OrganizationImageUpload";
import { organizationTypes, OrganizationType } from "@/components/organizations/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Organization {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string;
  address: string;
  contact_user_id: string | null;
  is_approved: boolean;
  approval_decision_made: boolean;
  image_url?: string | null;
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
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isAdministrator?: boolean;
}

export const OrganizationModal = ({
  organization,
  open,
  onOpenChange,
  onUpdateContact,
  onApprove,
  onReject,
  isAdministrator = false,
}: OrganizationModalProps) => {
  const { userProfiles } = useUserProfiles();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    type: "" as OrganizationType | "",
    description: "",
    phone: "",
    address: "",
  });

  // Reset edit state whenever the modal opens or the organization changes
  useEffect(() => {
    if (organization) {
      setEditForm({
        name: organization.name,
        type: organization.type as OrganizationType,
        description: organization.description ?? "",
        phone: organization.phone,
        address: organization.address,
      });
    }
    setIsEditing(false);
  }, [organization?.id, open]);

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

  const handleSaveEdits = async () => {
    if (!organization) return;
    if (!editForm.name.trim() || !editForm.type || !editForm.phone.trim() || !editForm.address.trim()) {
      toast({
        title: "Missing information",
        description: "Name, type, phone, and address are required.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: editForm.name.trim(),
          type: editForm.type as OrganizationType,
          description: editForm.description.trim() || null,
          phone: editForm.phone.trim(),
          address: editForm.address.trim(),
        })
        .eq("id", organization.id);

      if (error) throw error;

      toast({
        title: "Organization updated",
        description: "Changes have been saved successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update organization.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return <Clock className="h-4 w-4 text-yellow-600" />;
    }
    if (isApproved) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return "Pending";
    }
    return isApproved ? "Approved" : "Rejected";
  };

  const getStatusVariant = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return "secondary";
    }
    return isApproved ? "default" : "destructive";
  };

  const currentContactName = organization.contact_user 
    ? `${organization.contact_user.first_name} ${organization.contact_user.last_name}`
    : "No contact assigned";

  const showApprovalButtons = !organization.approval_decision_made && isAdministrator;

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
          {/* Status - Only show for authenticated users */}
          {isAuthenticated && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(organization.is_approved, organization.approval_decision_made)}
                  <Badge variant={getStatusVariant(organization.is_approved, organization.approval_decision_made)}>
                    {getStatusText(organization.is_approved, organization.approval_decision_made)}
                  </Badge>
                </div>
                {isAdministrator && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                {isAdministrator && isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Organization Image */}
          {isAdministrator && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Organization Image</h3>
              <OrganizationImageUpload
                organizationId={organization.id}
                organizationName={organization.name}
                imageUrl={organization.image_url}
              />
            </div>
          )}

          <Separator />

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Organization Information</h3>
            {isEditing && isAdministrator ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Name</Label>
                  <Input
                    id="org-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-type">Type</Label>
                  <Select
                    value={editForm.type || undefined}
                    onValueChange={(value: OrganizationType) =>
                      setEditForm({ ...editForm, type: value })
                    }
                    disabled={isSaving}
                  >
                    <SelectTrigger id="org-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="min-h-[80px]"
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input
                    id="org-phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Input
                    id="org-address"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdits} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
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
            )}
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

            {/* Update Contact - Only show for administrators */}
            {isAdministrator && (
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
            )}
          </div>
        </div>

        {showApprovalButtons && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => onApprove(organization.id)}
              className="flex-1"
            >
              Approve Organization
            </Button>
            <Button
              variant="destructive"
              onClick={() => onReject(organization.id)}
              className="flex-1"
            >
              Reject Organization
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
