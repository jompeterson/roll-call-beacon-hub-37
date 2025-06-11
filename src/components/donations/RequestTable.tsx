
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, XCircle, Archive, Check } from "lucide-react";
import { RequestSortableTableHead } from "./RequestSortableTableHead";
import type { Request } from "@/hooks/useRequests";

type SortDirection = "asc" | "desc" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Completed":
      return <Check className="h-4 w-4 text-blue-600" />;
    case "Approved":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "Pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "Rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "Archived":
      return <Archive className="h-4 w-4 text-gray-600" />;
    default:
      return null;
  }
};

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

interface RequestTableProps {
  requests: Request[];
  sortField: RequestSortField;
  sortDirection: SortDirection;
  onSort: (field: RequestSortField) => void;
  onRowClick: (request: Request) => void;
}

export const RequestTable = ({
  requests,
  sortField,
  sortDirection,
  onSort,
  onRowClick
}: RequestTableProps) => {
  return (
    <div className="border rounded-lg h-96">
      <div className="h-full flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <RequestSortableTableHead
                field="organization_name"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-2/5"
              >
                Organization
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="request_type"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Type
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="title"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Item
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="description"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/4"
              >
                Details
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="status"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Status
              </RequestSortableTableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="flex-1">
          <Table>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No requests available
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => {
                  const status = getRequestStatus(request);
                  return (
                    <TableRow 
                      key={request.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onRowClick(request)}
                    >
                      <TableCell className="font-medium w-2/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                        {request.organization_name || "No Organization"}
                      </TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap">{request.request_type}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{request.title}</TableCell>
                      <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                        {request.description || "No description"}
                      </TableCell>
                      <TableCell className="w-1/6">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <StatusIcon status={status} />
                          <span>{status}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};
