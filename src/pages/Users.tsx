
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";

type SortDirection = "asc" | "desc" | null;
type SortField = "firstName" | "lastName" | "organization" | "email" | "dateJoined" | "lastLogin" | "status" | null;

interface UserPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

const mockUserPosts: UserPost[] = [
  {
    id: "1",
    organization: "Tech Solutions Inc",
    type: "Materials",
    item: "John Smith",
    details: "john.smith@techsolutions.com",
    status: "Approved"
  },
  {
    id: "2",
    organization: "Green Earth Foundation",
    type: "Tools",
    item: "Sarah Johnson",
    details: "sarah.johnson@greenearth.org",
    status: "Pending"
  },
  {
    id: "3",
    organization: "Community Health Center",
    type: "Materials",
    item: "Dr. Michael Brown",
    details: "michael.brown@healthcenter.org",
    status: "Rejected"
  }
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for user posts
  const [userSort, setUserSort] = useState<SortField>(null);
  const [userDirection, setUserDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedUser, setSelectedUser] = useState<UserPost | null>(null);
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

  const sortData = <T extends UserPost>(
    data: T[], 
    sortField: SortField, 
    direction: SortDirection
  ): T[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "firstName") {
        aValue = a.item.split(' ')[0] || "";
        bValue = b.item.split(' ')[0] || "";
      } else if (sortField === "lastName") {
        aValue = a.item.split(' ')[1] || "";
        bValue = b.item.split(' ')[1] || "";
      } else if (sortField === "email") {
        aValue = a.details;
        bValue = b.details;
      } else if (sortField === "dateJoined" || sortField === "lastLogin") {
        aValue = "2024-06-08"; // Mock date
        bValue = "2024-06-08"; // Mock date
      } else {
        aValue = a[sortField as keyof T] as string;
        bValue = b[sortField as keyof T] as string;
      }
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterData = <T extends UserPost>(data: T[]): T[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredUserPosts = filterData(mockUserPosts);
  const sortedUserPosts = sortData(filteredUserPosts, userSort, userDirection);

  const handleUserRowClick = (user: UserPost) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleUserApprove = (id: string) => {
    console.log("Approved user:", id);
    setUserModalOpen(false);
  };

  const handleUserReject = (id: string) => {
    console.log("Rejected user:", id);
    setUserModalOpen(false);
  };

  const handleUserRequestChanges = (id: string) => {
    console.log("Requested changes for user:", id);
    setUserModalOpen(false);
  };

  // Mock function to get last name from full name
  const getLastName = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  // Mock function to get date joined
  const getDateJoined = () => "2024-05-15";

  // Mock function to get last login
  const getLastLogin = () => "2024-06-08";

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
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Posts Section - Full Width */}
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
                    field="lastLogin"
                    currentSort={userSort}
                    currentDirection={userDirection}
                    onSort={handleUserSort}
                    className="w-1/8"
                  >
                    Last Login
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {sortedUserPosts.map((post) => (
                    <TableRow 
                      key={post.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleUserRowClick(post)}
                    >
                      <TableCell className="font-medium w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.item.split(' ')[0]}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{getLastName(post.item)}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.organization}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.details}</TableCell>
                      <TableCell className="w-1/8 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{getDateJoined()}</TableCell>
                      <TableCell className="w-1/8 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{getLastLogin()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modal */}
      <DonationModal
        donation={selectedUser}
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        onApprove={handleUserApprove}
        onReject={handleUserReject}
        onRequestChanges={handleUserRequestChanges}
        isUser={true}
      />
    </div>
  );
};
