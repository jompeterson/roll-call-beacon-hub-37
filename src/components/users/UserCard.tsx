
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusIcon } from "./StatusIcon";
import { Mail, Phone, MapPin, Building, Calendar } from "lucide-react";

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

interface UserCardProps {
  user: UserProfile;
  onCardClick: (user: UserProfile) => void;
}

export const UserCard = ({ user, onCardClick }: UserCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onCardClick(user)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {user.first_name} {user.last_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon isApproved={user.is_approved} decisionMade={user.approval_decision_made} />
              <Badge 
                variant={getStatusVariant(user.is_approved, user.approval_decision_made)}
                className="text-xs"
              >
                {getStatusText(user.is_approved, user.approval_decision_made)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">
              {user.organizations?.name || "No Organization"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>Joined: {formatDate(user.created_at)}</span>
          </div>
        </div>

        {/* Role */}
        <div className="pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            {user.user_roles?.display_name || "Unknown Role"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
