import { useState } from "react";
import { UserModal } from "@/components/UserModal";
import { UserFilters } from "@/components/users/UserFilters";
import { UserTable } from "@/components/users/UserTable";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useUserSorting } from "@/hooks/useUserSorting";
import { useUserFiltering } from "@/hooks/useUserFiltering";
import { useProfileData } from "@/hooks/useProfileData";
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
  const { userProfiles, loading, refetch } = useUserProfiles();
  const { userRole } = useProfileData();
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

  const isAdministrator = userRole?.name === 'administrator';

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
    <div className="space-y-6">
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

      <div className="space-y-4">
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
        isAdministrator={isAdministrator}
      />
    </div>
  );
};
