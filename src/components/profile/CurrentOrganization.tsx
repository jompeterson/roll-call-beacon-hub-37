
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfilesRealtime } from "@/hooks/useUserProfilesRealtime";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { OrganizationMembersSearch } from "./OrganizationMembersSearch";
import { OrganizationMemberCard } from "./OrganizationMemberCard";

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
  const [searchTerm, setSearchTerm] = useState("");

  // Filter members who belong to the current organization
  const organizationMembers = userProfiles.filter(
    user => user.organization_id === userOrganizationId
  );

  // Filter members based on search term
  const filteredMembers = useMemo(() => {
    if (!searchTerm) return organizationMembers;
    
    return organizationMembers.filter(member => 
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizationMembers, searchTerm]);

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
            <div className="flex items-center justify-between">
              <h4 className="text-md font-semibold">Organization Members</h4>
              {organizationMembers.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {filteredMembers.length} of {organizationMembers.length} members
                </span>
              )}
            </div>
            
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading members...</p>
            ) : organizationMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other members in this organization.</p>
            ) : (
              <div className="space-y-4">
                <OrganizationMembersSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
                
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No members found matching your search.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((member) => (
                      <OrganizationMemberCard
                        key={member.id}
                        member={member}
                        isAdministrator={isAdministrator}
                        userRoles={userRoles}
                        updatingUserId={updatingUserId}
                        onRoleChange={handleRoleChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
