
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

export const useUserSorting = () => {
  const sortData = (
    data: UserProfile[], 
    sortField: SortField, 
    direction: SortDirection
  ): UserProfile[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "firstName") {
        aValue = a.first_name || "";
        bValue = b.first_name || "";
      } else if (sortField === "lastName") {
        aValue = a.last_name || "";
        bValue = b.last_name || "";
      } else if (sortField === "email") {
        aValue = a.email;
        bValue = b.email;
      } else if (sortField === "organization") {
        aValue = a.organizations?.name || "";
        bValue = b.organizations?.name || "";
      } else if (sortField === "dateJoined") {
        aValue = a.created_at;
        bValue = b.created_at;
      } else if (sortField === "status") {
        const getStatusText = (isApproved: boolean, decisionMade: boolean) => {
          if (!decisionMade) return "Pending";
          return isApproved ? "Approved" : "Rejected";
        };
        aValue = getStatusText(a.is_approved, a.approval_decision_made);
        bValue = getStatusText(b.is_approved, b.approval_decision_made);
      } else {
        aValue = "";
        bValue = "";
      }
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  return { sortData };
};
