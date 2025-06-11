
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUserProfilesRealtime } from "@/hooks/useUserProfilesRealtime";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface Organization {
  name: string;
  role: string;
  joinedDate: string;
  logo: string;
}

interface CurrentOrganizationProps {
  organization: Organization;
  userOrganizationId?: string | null;
}

export const CurrentOrganization = ({ organization, userOrganizationId }: CurrentOrganizationProps) => {
  const { userProfiles, loading } = useUserProfilesRealtime();
  const { userRoles } = useUserRoles();
  const { isAdministrator } = useAuth();
  const { toast } = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Filter members who belong to the current organization
  const organizationMembers = userProfiles.filter(
    user => user.organization_id === userOrganizationId
  );

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role_id: newRoleId })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated successfully.",
        });
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Organization</CardTitle>
        <CardDescription>
          Your current organization affiliation and members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={organization.logo} alt="Organization Logo" />
            <AvatarFallback>
              {organization.name.split(' ').map(word => word.charAt(0)).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{organization.name}</h3>
            <p className="text-sm text-muted-foreground">{organization.role}</p>
            <p className="text-xs text-muted-foreground">Joined: {organization.joinedDate}</p>
          </div>
        </div>

        {userOrganizationId && (
          <div className="space-y-4">
            <h4 className="text-md font-semibold">Organization Members</h4>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading members...</p>
            ) : organizationMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other members in this organization.</p>
            ) : (
              <div className="space-y-3">
                {organizationMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdministrator ? (
                        <Select
                          value={member.role_id}
                          onValueChange={(value) => handleRoleChange(member.id, value)}
                          disabled={updatingUserId === member.id}
                        >
                          <SelectTrigger className="w-40">
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
                        <Badge variant="outline">
                          {member.user_roles?.display_name || "Member"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
