
import type { Donation } from "@/hooks/useDonations";

type SortDirection = "asc" | "desc" | null;
type DonationSortField = "organization_name" | "title" | "description" | "status" | null;

// Helper function to get status from donation approval state
const getDonationStatus = (donation: Donation): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!donation.approval_decision_made) {
    return "Pending";
  }
  return donation.is_approved ? "Approved" : "Rejected";
};

export const sortDonations = (
  data: Donation[], 
  sortField: DonationSortField, 
  direction: SortDirection
): Donation[] => {
  if (!sortField || !direction) return data;
  
  return [...data].sort((a, b) => {
    let aValue: string;
    let bValue: string;
    
    switch (sortField) {
      case "organization_name":
        aValue = a.organization_name || "";
        bValue = b.organization_name || "";
        break;
      case "title":
        aValue = a.title;
        bValue = b.title;
        break;
      case "description":
        aValue = a.description || "";
        bValue = b.description || "";
        break;
      case "status":
        aValue = getDonationStatus(a);
        bValue = getDonationStatus(b);
        break;
      default:
        return 0;
    }
    
    if (direction === "asc") {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });
};
