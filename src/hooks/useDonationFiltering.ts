
import type { Donation } from "@/hooks/useDonations";
import type { Request } from "@/hooks/useRequests";

// Helper function to get status from donation approval state
const getDonationStatus = (donation: Donation): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!donation.approval_decision_made) {
    return "Pending";
  }
  return donation.is_approved ? "Approved" : "Rejected";
};

// Helper function to get status from request approval state
const getRequestStatus = (request: Request): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!request.approval_decision_made) {
    return "Pending";
  }
  return request.is_approved ? "Approved" : "Rejected";
};

export const filterDonations = (data: Donation[], searchTerm: string, statusFilter: string): Donation[] => {
  return data.filter((donation) => {
    const matchesSearch = searchTerm === "" || 
      Object.values(donation).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const status = getDonationStatus(donation);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};

export const filterRequests = (data: Request[], searchTerm: string, statusFilter: string): Request[] => {
  return data.filter((request) => {
    const matchesSearch = searchTerm === "" || 
      Object.values(request).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    const status = getRequestStatus(request);
    const matchesStatus = statusFilter === "all" || status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};
