
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

export const useUserFiltering = () => {
  const filterData = (data: UserProfile[], searchTerm: string, statusFilter: string): UserProfile[] => {
    return data.filter((user) => {
      const matchesSearch = searchTerm === "" || 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organizations?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "approved" && user.is_approved && user.approval_decision_made) ||
        (statusFilter === "rejected" && !user.is_approved && user.approval_decision_made) ||
        (statusFilter === "pending" && !user.approval_decision_made);
      
      return matchesSearch && matchesStatus;
    });
  };

  return { filterData };
};
