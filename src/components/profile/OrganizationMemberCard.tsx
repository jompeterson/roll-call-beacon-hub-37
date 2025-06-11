
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface UserRole {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  user_roles?: {
    display_name: string;
  } | null;
}

interface OrganizationMemberCardProps {
  member: Member;
  isAdministrator: boolean;
  userRoles: UserRole[];
  updatingUserId: string | null;
  onRoleChange: (userId: string, newRoleId: string) => void;
}

export const OrganizationMemberCard = ({
  member,
  isAdministrator,
  userRoles,
  updatingUserId,
  onRoleChange
}: OrganizationMemberCardProps) => {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {member.first_name} {member.last_name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        {isAdministrator ? (
          <Select
            value={member.role_id}
            onValueChange={(value) => onRoleChange(member.id, value)}
            disabled={updatingUserId === member.id}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {userRoles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline" className="w-full justify-center">
            {member.user_roles?.display_name || "Member"}
          </Badge>
        )}
      </div>
    </div>
  );
};
