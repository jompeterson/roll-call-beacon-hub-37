
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";

type SortDirection = "asc" | "desc" | null;
type SortField = "organization" | "type" | "item" | "details" | "status" | null;

interface ScholarshipPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

const mockScholarshipPosts: ScholarshipPost[] = [
  {
    id: "1",
    organization: "Education Foundation",
    type: "Materials",
    item: "STEM Scholarship",
    details: "$5,000 scholarship for STEM students",
    status: "Approved"
  },
  {
    id: "2",
    organization: "Community College",
    type: "Tools",
    item: "Trade Skills Grant",
    details: "Funding for vocational training programs",
    status: "Pending"
  },
  {
    id: "3",
    organization: "Local University",
    type: "Materials",
    item: "Arts Scholarship",
    details: "Support for fine arts students",
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

export const Scholarships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for scholarship posts
  const [scholarshipSort, setScholarshipSort] = useState<SortField>(null);
  const [scholarshipDirection, setScholarshipDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipPost | null>(null);
  const [scholarshipModalOpen, setScholarshipModalOpen] = useState(false);

  const handleScholarshipSort = (field: SortField) => {
    if (scholarshipSort === field) {
      if (scholarshipDirection === "asc") {
        setScholarshipDirection("desc");
      } else if (scholarshipDirection === "desc") {
        setScholarshipSort(null);
        setScholarshipDirection(null);
      } else {
        setScholarshipDirection("asc");
      }
    } else {
      setScholarshipSort(field);
      setScholarshipDirection("asc");
    }
  };

  const sortData = <T extends ScholarshipPost>(
    data: T[], 
    sortField: SortField, 
    direction: SortDirection
  ): T[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue = a[sortField as keyof T] as string;
      let bValue = b[sortField as keyof T] as string;
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterData = <T extends ScholarshipPost>(data: T[]): T[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const filteredScholarshipPosts = filterData(mockScholarshipPosts);
  const sortedScholarshipPosts = sortData(filteredScholarshipPosts, scholarshipSort, scholarshipDirection);

  const handleScholarshipRowClick = (scholarship: ScholarshipPost) => {
    setSelectedScholarship(scholarship);
    setScholarshipModalOpen(true);
  };

  const handleScholarshipApprove = (id: string) => {
    console.log("Approved scholarship:", id);
    setScholarshipModalOpen(false);
  };

  const handleScholarshipReject = (id: string) => {
    console.log("Rejected scholarship:", id);
    setScholarshipModalOpen(false);
  };

  const handleScholarshipRequestChanges = (id: string) => {
    console.log("Requested changes for scholarship:", id);
    setScholarshipModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
        <p className="text-muted-foreground">
          Manage scholarship programs and applications
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for scholarships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Materials">Materials</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
          </SelectContent>
        </Select>

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

      {/* Scholarship Posts Section - Full Width */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Scholarship Posts</h2>
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="organization"
                    currentSort={scholarshipSort}
                    currentDirection={scholarshipDirection}
                    onSort={handleScholarshipSort}
                    className="w-2/5"
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="type"
                    currentSort={scholarshipSort}
                    currentDirection={scholarshipDirection}
                    onSort={handleScholarshipSort}
                    className="w-1/6"
                  >
                    Type
                  </SortableTableHead>
                  <SortableTableHead
                    field="item"
                    currentSort={scholarshipSort}
                    currentDirection={scholarshipDirection}
                    onSort={handleScholarshipSort}
                    className="w-1/6"
                  >
                    Item
                  </SortableTableHead>
                  <SortableTableHead
                    field="details"
                    currentSort={scholarshipSort}
                    currentDirection={scholarshipDirection}
                    onSort={handleScholarshipSort}
                    className="w-1/4"
                  >
                    Details
                  </SortableTableHead>
                  <SortableTableHead
                    field="status"
                    currentSort={scholarshipSort}
                    currentDirection={scholarshipDirection}
                    onSort={handleScholarshipSort}
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
                  {sortedScholarshipPosts.map((post) => (
                    <TableRow 
                      key={post.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleScholarshipRowClick(post)}
                    >
                      <TableCell className="font-medium w-2/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.organization}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap">{post.type}</TableCell>
                      <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.item}</TableCell>
                      <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">{post.details}</TableCell>
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
        donation={selectedScholarship}
        open={scholarshipModalOpen}
        onOpenChange={setScholarshipModalOpen}
        onApprove={handleScholarshipApprove}
        onReject={handleScholarshipReject}
        onRequestChanges={handleScholarshipRequestChanges}
      />
    </div>
  );
};
