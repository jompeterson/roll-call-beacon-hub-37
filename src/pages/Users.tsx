
import { useState } from "react";
import { UserModal } from "@/components/UserModal";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { useUserProfilesRealtime } from "@/hooks/useUserProfilesRealtime";
import { useUserSorting } from "@/hooks/useUserSorting";
import { useUserFiltering } from "@/hooks/useUserFiltering";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type SortDirection = "asc" | "desc" | null;
type SortField = "firstName" | "lastName" | "organization" | "email" | "dateJoined" | "status" | null;

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

export const Users = () => {
  const { toast } = useToast();
  const { userProfiles, loading, refetch } = useUserProfilesRealtime();
  const { isAdministrator } = useAuth();
  const { sortData } = useUserSorting();
  const { filterData } = useUserFiltering();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [userSort, setUserSort] = useState<SortField>(null);
  const [userDirection, setUserDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const handleUserSort = (field: SortField) => {
    if (userSort === field) {
      if (userDirection === "asc") {
        setUserDirection("desc");
      } else if (userDirection === "desc") {
        setUserSort(null);
        setUserDirection(null);
      } else {
        setUserDirection("asc");
      }
    } else {
      setUserSort(field);
      setUserDirection("asc");
    }
  };

  const filteredUsers = filterData(userProfiles, searchTerm, statusFilter);
  const sortedUsers = sortData(filteredUsers, userSort, userDirection);

  const handleUserRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleUserApprove = async (id: string) => {
    if (!isAdministrator) {
      toast({
        title: "Access Denied",
        description: "Only administrators can approve users.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_approved: true, 
          approval_decision_made: true 
        })
        .eq('id', id);

      if (error) {
        console.error('Error approving user:', error);
        toast({
          title: "Error",
          description: "Failed to approve user.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Approved",
        description: "User has been successfully approved.",
      });
      setUserModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user.",
        variant: "destructive",
      });
    }
  };

  const handleUserReject = async (id: string) => {
    if (!isAdministrator) {
      toast({
        title: "Access Denied",
        description: "Only administrators can reject users.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          is_approved: false, 
          approval_decision_made: true 
        })
        .eq('id', id);

      if (error) {
        console.error('Error rejecting user:', error);
        toast({
          title: "Error",
          description: "Failed to reject user.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "User Rejected",
        description: "User access has been rejected.",
        variant: "destructive",
      });
      setUserModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user.",
        variant: "destructive",
      });
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const handleRoleChange = async (id: string, roleId: string) => {
    if (!isAdministrator) {
      toast({
        title: "Access Denied",
        description: "Only administrators can change user roles.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role_id: roleId })
        .eq('id', id);

      if (error) {
        console.error('Error updating role:', error);
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Role Updated",
        description: "User role has been successfully updated.",
      });
      refetch();
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({ ...selectedUser, role_id: roleId });
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!isAdministrator) {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete users.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Delete user profile first
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (profileError) {
        console.error('Error deleting user profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to delete user.",
          variant: "destructive",
        });
        return;
      }

      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (userError) {
        console.error('Error deleting user:', userError);
      }

      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      setUserModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Loading user accounts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <UserFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <UserTable
          users={sortedUsers}
          sortField={userSort}
          sortDirection={userDirection}
          onSort={handleUserSort}
          onRowClick={handleUserRowClick}
        />
      </div>

      <UserModal
        user={selectedUser}
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        onApprove={handleUserApprove}
        onReject={handleUserReject}
        onDelete={handleUserDelete}
        onRoleChange={handleRoleChange}
        isAdministrator={isAdministrator}
        isDeleting={isDeleting}
        isUpdatingRole={isUpdatingRole}
      />
    </div>
  );
};
