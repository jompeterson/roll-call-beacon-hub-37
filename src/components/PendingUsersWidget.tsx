import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "lucide-react";
import { useUserProfilesRealtime } from "@/hooks/useUserProfilesRealtime";
import { UserModal } from "@/components/UserModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  waiver_agreed?: boolean | null;
  waiver_agreed_at?: string | null;
  waiver_signature_name?: string | null;
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

export const PendingUsersWidget = () => {
  const { userProfiles, loading, refetch } = useUserProfilesRealtime();
  const { isAdministrator } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingUsers = userProfiles.filter((user) => !user.approval_decision_made);

  const handleUserClick = (user: UserProfile) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (!isAdministrator) return;
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_approved: true, approval_decision_made: true })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "User Approved", description: "User has been successfully approved." });
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Error approving user:", error);
      toast({ title: "Error", description: "Failed to approve user.", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    if (!isAdministrator) return;
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_approved: false, approval_decision_made: true })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "User Rejected", description: "User access has been rejected.", variant: "destructive" });
      setModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast({ title: "Error", description: "Failed to reject user.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {pendingUsers.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No pending users</div>
          ) : (
            <ScrollArea className="h-44 px-6">
              <div className="space-y-2 py-2">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="font-medium text-sm">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    {user.organizations?.name && (
                      <div className="text-xs text-muted-foreground">{user.organizations.name}</div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <UserModal
        user={selectedUser}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        isAdministrator={isAdministrator}
      />
    </>
  );
};
