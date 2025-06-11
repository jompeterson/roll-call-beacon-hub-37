
import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableTableHead } from "./SortableTableHead";
import { UserTableRow } from "./UserTableRow";

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

interface UserTableProps {
  users: UserProfile[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onRowClick: (user: UserProfile) => void;
}

export const UserTable = ({
  users,
  sortField,
  sortDirection,
  onSort,
  onRowClick
}: UserTableProps) => {
  return (
    <div className="border rounded-lg h-96">
      <div className="h-full flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                field="firstName"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                First Name
              </SortableTableHead>
              <SortableTableHead
                field="lastName"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Last Name
              </SortableTableHead>
              <SortableTableHead
                field="organization"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Organization
              </SortableTableHead>
              <SortableTableHead
                field="email"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/6"
              >
                Email
              </SortableTableHead>
              <SortableTableHead
                field="dateJoined"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/8"
              >
                Date Joined
              </SortableTableHead>
              <SortableTableHead
                field="status"
                currentSort={sortField}
                currentDirection={sortDirection}
                onSort={onSort}
                className="w-1/8"
              >
                Status
              </SortableTableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className="flex-1">
          <Table>
            <TableBody>
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onRowClick={onRowClick}
                />
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};
