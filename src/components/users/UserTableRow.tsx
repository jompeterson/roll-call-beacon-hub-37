
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusIcon } from "./StatusIcon";

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

interface UserTableRowProps {
  user: UserProfile;
  onRowClick: (user: UserProfile) => void;
}

export const UserTableRow = ({ user, onRowClick }: UserTableRowProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusText = (isApproved: boolean, decisionMade: boolean) => {
    if (!decisionMade) {
      return "Pending";
    }
    return isApproved ? "Approved" : "Rejected";
  };

  return (
    <TableRow 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onRowClick(user)}
    >
      <TableCell className="font-medium w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        {user.first_name}
      </TableCell>
      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        {user.last_name}
      </TableCell>
      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        {user.organizations?.name || "No Organization"}
      </TableCell>
      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        {user.email}
      </TableCell>
      <TableCell className="w-1/8 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        {formatDate(user.created_at)}
      </TableCell>
      <TableCell className="w-1/8 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
        <div className="flex items-center gap-2">
          <StatusIcon isApproved={user.is_approved} decisionMade={user.approval_decision_made} />
          <span>{getStatusText(user.is_approved, user.approval_decision_made)}</span>
        </div>
      </TableCell>
    </TableRow>
  );
};
