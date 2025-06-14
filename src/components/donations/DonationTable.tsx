
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Clock, XCircle, Archive } from "lucide-react";
import { DonationSortableTableHead } from "./DonationSortableTableHead";
import type { Donation } from "@/hooks/useDonations";

type SortDirection = "asc" | "desc" | null;
type DonationSortField = "organization_name" | "title" | "description" | "status" | null;

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

// Helper function to get status from donation approval state
const getDonationStatus = (donation: Donation): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!donation.approval_decision_made) {
    return "Pending";
  }
  return donation.is_approved ? "Approved" : "Rejected";
};

interface DonationTableProps {
  donations: Donation[];
  sortField: DonationSortField;
  sortDirection: SortDirection;
  onSort: (field: DonationSortField) => void;
  onRowClick: (donation: Donation) => void;
  showStatus?: boolean;
}

export const DonationTable = ({
  donations,
  sortField,
  sortDirection,
  onSort,
  onRowClick,
  showStatus = true
}: DonationTableProps) => {
  const organizationWidth = showStatus ? "w-2/5" : "w-1/2";
  const titleWidth = showStatus ? "w-1/4" : "w-1/4";
  const descriptionWidth = showStatus ? "w-1/4" : "w-1/4";
  const colSpan = showStatus ? 4 : 3;

  return (
    <div className="border rounded-lg h-96">
      <div className="h-full flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <DonationSortableTableHead
                field="organization_name"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={organizationWidth}
              >
                Organization
              </DonationSortableTableHead>
              <DonationSortableTableHead
                field="title"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={titleWidth}
              >
                Title
              </DonationSortableTableHead>
              <DonationSortableTableHead
                field="description"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className={descriptionWidth}
              >
                Description
              </DonationSortableTableHead>
              {showStatus && (
                <DonationSortableTableHead
                  field="status"
                  currentSort={sortField}
                  currentDirection={sortDirection}
                  onSort={onSort}
                  className="w-1/6"
                >
                  Status
                </DonationSortableTableHead>
              )}
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="flex-1">
          <Table>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
                    No donations available
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((donation) => {
                  const status = getDonationStatus(donation);
                  return (
                    <TableRow 
                      key={donation.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onRowClick(donation)}
                    >
                      <TableCell className={`font-medium ${organizationWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>
                        {donation.organization_name || "No Organization"}
                      </TableCell>
                      <TableCell className={`${titleWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>
                        {donation.title}
                      </TableCell>
                      <TableCell className={`${descriptionWidth} whitespace-nowrap overflow-hidden text-ellipsis max-w-0`}>
                        {donation.description || "No description"}
                      </TableCell>
                      {showStatus && (
                        <TableCell className="w-1/6">
                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <StatusIcon status={status} />
                            <span>{status}</span>
                          </div>
                        </TableCell>
                      )}
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
