
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Clock, Mail, Phone, MapPin, Building, Calendar, User } from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address: string;
  phone: string;
  created_at: string;
  organization_id: string | null;
  role_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  user_roles: {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
  } | null;
  organizations: {
    id: string;
    name: string;
    type: string;
    description: string | null;
  } | null;
}

interface UserModalProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isAdministrator?: boolean;
}

export const UserModal = ({
  user,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isAdministrator = false,
}: UserModalProps) => {
  if (!user) return null;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const showApprovalButtons = !user.approval_decision_made && isAdministrator;
  const showRevokeButton = user.approval_decision_made && user.is_approved && isAdministrator;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {user.first_name} {user.last_name}
          </DialogTitle>
          <DialogDescription>
            User profile details and information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-2">
            {getStatusIcon(user.is_approved, user.approval_decision_made)}
            <Badge variant={getStatusVariant(user.is_approved, user.approval_decision_made)}>
              {getStatusText(user.is_approved, user.approval_decision_made)}
            </Badge>
          </div>

          <Separator />

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phone}</span>
              </div>
              <div className="flex items-start gap-2 md:col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{user.address}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Role Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Role</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {user.user_roles?.display_name || "Unknown Role"}
              </Badge>
            </div>
            {user.user_roles?.description && (
              <p className="text-sm text-muted-foreground">
                {user.user_roles.description}
              </p>
            )}
          </div>

          <Separator />

          {/* Organization Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Organization</h3>
            {user.organizations ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{user.organizations.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type: {user.organizations.type}
                </p>
                {user.organizations.description && (
                  <p className="text-sm text-muted-foreground">
                    {user.organizations.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No organization assigned</p>
            )}
          </div>

          <Separator />

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Account Information</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Joined: {formatDate(user.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {showApprovalButtons && (
            <>
              <Button
                onClick={() => onApprove(user.id)}
                className="flex-1"
              >
                Approve User
              </Button>
              <Button
                variant="destructive"
                onClick={() => onReject(user.id)}
                className="flex-1"
              >
                Reject User
              </Button>
            </>
          )}
          {showRevokeButton && (
            <Button
              variant="destructive"
              onClick={() => onReject(user.id)}
              className="flex-1"
            >
              Revoke Access
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
