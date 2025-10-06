
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, XCircle, Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestSortableTableHead } from "./RequestSortableTableHead";
import type { Request } from "@/hooks/useRequests";

type SortDirection = "asc" | "desc" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
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
const getRequestStatus = (request: Request): "Approved" | "Pending" | "Rejected" | "Archived" => {
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
  showStatus?: boolean;
}

export const RequestTable = ({
  requests,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  showStatus = true
}: RequestTableProps) => {
  const organizationWidth = showStatus ? "w-2/5" : "w-1/2";
  const typeWidth = showStatus ? "w-1/6" : "w-1/4";
  const titleWidth = showStatus ? "w-1/6" : "w-1/4";
  const descriptionWidth = showStatus ? "w-1/4" : "w-1/4";
  const colSpan = showStatus ? 6 : 5;

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
                className={organizationWidth}
              >
                Organization
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="request_type"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={typeWidth}
              >
                Type
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="title"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={titleWidth}
              >
                Item
              </RequestSortableTableHead>
              <RequestSortableTableHead
                field="description"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={descriptionWidth}
              >
                Details
              </RequestSortableTableHead>
              {showStatus && (
                <RequestSortableTableHead
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                  className="w-1/6"
                >
                  Status
                </RequestSortableTableHead>
              )}
              <RequestSortableTableHead
                field={null}
                currentSort={null}
                currentDirection={null}
                onSort={() => {}}
                className="w-16"
              >
                <span className="sr-only">Actions</span>
              </RequestSortableTableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="flex-1">
          <Table>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
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
                      <TableCell className={`font-medium ${organizationWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>
                        {request.organization_name || "No Organization"}
                      </TableCell>
                      <TableCell className={`${typeWidth} whitespace-nowrap`}>{request.request_type}</TableCell>
                      <TableCell className={`${titleWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>{request.title}</TableCell>
                      <TableCell className={`${descriptionWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>
                        {request.description || "No description"}
                      </TableCell>
                      {showStatus && (
                        <TableCell className="w-1/6">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <StatusIcon status={status} />
                            <span>{status}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="w-16">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/requests/${request.id}`, '_blank');
                          }}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
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
