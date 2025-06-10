
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";

type SortDirection = "asc" | "desc" | null;
type SortField = "organization" | "contact" | "type" | "status" | null;

interface OrganizationPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

const mockOrganizationPosts: OrganizationPost[] = [
  {
    id: "1",
    organization: "Tech Solutions Inc",
    type: "Materials",
    item: "John Smith",
    details: "Technology",
    status: "Approved"
  },
  {
    id: "2",
    organization: "Green Earth Foundation",
    type: "Tools",
    item: "Sarah Johnson",
    details: "Environmental",
    status: "Pending"
  },
  {
    id: "3",
    organization: "Community Health Center",
    type: "Materials",
    item: "Dr. Michael Brown",
    details: "Healthcare",
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

export const Organizations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for organization posts
  const [organizationSort, setOrganizationSort] = useState<SortField>(null);
  const [organizationDirection, setOrganizationDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationPost | null>(null);
  const [organizationModalOpen, setOrganizationModalOpen] = useState(false);

  const handleOrganizationSort = (field: SortField) => {
    if (organizationSort === field) {
      if (organizationDirection === "asc") {
        setOrganizationDirection("desc");
      } else if (organizationDirection === "desc") {
        setOrganizationSort(null);
        setOrganizationDirection(null);
      } else {
        setOrganizationDirection("asc");
      }
    } else {
      setOrganizationSort(field);
      setOrganizationDirection("asc");
    }
  };

  const sortData = <T extends OrganizationPost>(
    data: T[], 
    sortField: SortField, 
    direction: SortDirection
  ): T[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "contact") {
        aValue = a.item;
        bValue = b.item;
      } else if (sortField === "type") {
        aValue = a.details;
        bValue = b.details;
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

  const filterData = <T extends OrganizationPost>(data: T[]): T[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredOrganizationPosts = filterData(mockOrganizationPosts);
  const sortedOrganizationPosts = sortData(filteredOrganizationPosts, organizationSort, organizationDirection);

  const handleOrganizationRowClick = (organization: OrganizationPost) => {
    setSelectedOrganization(organization);
    setOrganizationModalOpen(true);
  };

  const handleOrganizationApprove = (id: string) => {
    console.log("Approved organization:", id);
    setOrganizationModalOpen(false);
  };

  const handleOrganizationReject = (id: string) => {
    console.log("Rejected organization:", id);
    setOrganizationModalOpen(false);
  };

  const handleOrganizationRequestChanges = (id: string) => {
    console.log("Requested changes for organization:", id);
    setOrganizationModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
        <p className="text-muted-foreground">
          Manage partner organizations and relationships
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for organizations..."
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

      {/* Organization Posts Section - Full Width */}
      <div className="space-y-4">
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="organization"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-2/5"
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="contact"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/4"
                  >
                    Contact
                  </SortableTableHead>
                  <SortableTableHead
                    field="type"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/6"
                  >
                    Type
                  </SortableTableHead>
                  <SortableTableHead
                    field="status"
                    currentSort={organizationSort}
                    currentDirection={organizationDirection}
                    onSort={handleOrganizationSort}
                    className="w-1/6"
                  >
                    Status
                  </SortableTableHead>
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {sortedOrganizationPosts.map((post) => (
                    <TableRow 
                      key={post.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleOrganizationRowClick(post)}
                    >
                      <TableCell className="font-medium w-2/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.organization}</TableCell>
                      <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.item}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.details}</TableCell>
                      <TableCell className="w-1/6">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <StatusIcon status={post.status} />
                          <span>{post.status}</span>
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
      <DonationModal
        donation={selectedOrganization}
        open={organizationModalOpen}
        onOpenChange={setOrganizationModalOpen}
        onApprove={handleOrganizationApprove}
        onReject={handleOrganizationReject}
        onRequestChanges={handleOrganizationRequestChanges}
        isOrganization={true}
      />
    </div>
  );
};
