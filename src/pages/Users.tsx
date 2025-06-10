
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, CheckCircle, Clock } from "lucide-react";
import { UserModal } from "@/components/UserModal";
import { useUserProfiles } from "@/hooks/useUserProfiles";
import { useToast } from "@/hooks/use-toast";

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

const StatusIcon = ({ isApproved }: { isApproved: boolean }) => {
  if (isApproved) {
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  } else {
    return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

const SortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: { 
  children: React.ReactNode;
  field: SortField;
  currentSort: SortField;
  currentDirection: SortDirection;
  onSort: (field: SortField) => void;
  className?: string;
}) => {
  const isActive = currentSort === field;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-[#1e3a52] select-none text-white ${className}`}
      style={{ backgroundColor: "#294865" }}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        <div className="ml-2">
          {isActive && currentDirection === "asc" && <ChevronUp className="h-4 w-4" />}
          {isActive && currentDirection === "desc" && <ChevronDown className="h-4 w-4" />}
          {!isActive && <div className="h-4 w-4" />}
        </div>
      </div>
    </TableHead>
  );
};

export const Users = () => {
  const { toast } = useToast();
  const { userProfiles, loading, refetch } = useUserProfiles();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [userSort, setUserSort] = useState<SortField>(null);
  const [userDirection, setUserDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const handleUserSort = (field: SortField) => {
    if (userSort === field) {
      if (userDirection === "asc") {
        setUserDirection("desc");
      } else if (userDirection === "desc") {
        setUserSort(null);
        setUserDirection(null);
      } else {
        setUserDirection("asc");
      }
    } else {
      setUserSort(field);
      setUserDirection("asc");
    }
  };

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
        aValue = a.is_approved ? "Approved" : "Pending";
        bValue = b.is_approved ? "Approved" : "Pending";
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

  const filterData = (data: UserProfile[]): UserProfile[] => {
    return data.filter((user) => {
      const matchesSearch = searchTerm === "" || 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.organizations?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "approved" && user.is_approved) ||
        (statusFilter === "pending" && !user.is_approved);
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUsers = filterData(userProfiles);
  const sortedUsers = sortData(filteredUsers, userSort, userDirection);

  const handleUserRowClick = (user: UserProfile) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleUserApprove = (id: string) => {
    console.log("Approved user:", id);
    toast({
      title: "User Approved",
      description: "User has been successfully approved.",
    });
    setUserModalOpen(false);
    refetch();
  };

  const handleUserReject = (id: string) => {
    console.log("Rejected user:", id);
    toast({
      title: "User Rejected",
      description: "User access has been rejected.",
      variant: "destructive",
    });
    setUserModalOpen(false);
    refetch();
  };

  const handleUserRequestChanges = (id: string) => {
    console.log("Requested changes for user:", id);
    toast({
      title: "Changes Requested",
      description: "User has been notified to make changes.",
    });
    setUserModalOpen(false);
    refetch();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Loading user accounts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="firstName"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/6"
                  >
                    First Name
                  </SortableTableHead>
                  <SortableTableHead
                    field="lastName"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/6"
                  >
                    Last Name
                  </SortableTableHead>
                  <SortableTableHead
                    field="organization"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/6"
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="email"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/6"
                  >
                    Email
                  </SortableTableHead>
                  <SortableTableHead
                    field="dateJoined"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/8"
                  >
                    Date Joined
                  </SortableTableHead>
                  <SortableTableHead
                    field="status"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
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
                  {sortedUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleUserRowClick(user)}
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
                          <StatusIcon isApproved={user.is_approved} />
                          <span>{user.is_approved ? "Approved" : "Pending"}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modal */}
      <UserModal
        user={selectedUser}
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        onApprove={handleUserApprove}
        onReject={handleUserReject}
        onRequestChanges={handleUserRequestChanges}
      />
    </div>
  );
};
