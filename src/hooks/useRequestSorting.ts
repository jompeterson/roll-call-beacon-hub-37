
import type { Request } from "@/hooks/useRequests";

type SortDirection = "asc" | "desc" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

// Helper function to get status from request approval state
const getRequestStatus = (request: Request): "Completed" | "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (request.is_completed) {
    return "Completed";
  }
  if (!request.approval_decision_made) {
    return "Pending";
  }
  return request.is_approved ? "Approved" : "Rejected";
};

export const sortRequests = (
  data: Request[], 
  sortField: RequestSortField, 
  direction: SortDirection
): Request[] => {
  if (!sortField || !direction) return data;
  
  return [...data].sort((a, b) => {
    let aValue: string;
    let bValue: string;
    
    switch (sortField) {
      case "organization_name":
        aValue = a.organization_name || "";
        bValue = b.organization_name || "";
        break;
      case "request_type":
        aValue = a.request_type;
        bValue = b.request_type;
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
        aValue = getRequestStatus(a);
        bValue = getRequestStatus(b);
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
