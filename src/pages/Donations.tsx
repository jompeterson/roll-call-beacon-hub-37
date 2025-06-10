import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";

type SortDirection = "asc" | "desc" | null;
type SortField = "organization" | "type" | "item" | "details" | "status" | null;

interface DonationPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

interface RequestPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

const mockDonationPosts: DonationPost[] = [
  {
    id: "1",
    organization: "Green Earth Foundation",
    type: "Materials",
    item: "Recycled Paper",
    details: "500 sheets of recycled office paper",
    status: "Approved"
  },
  {
    id: "2",
    organization: "Tech for Good",
    type: "Tools",
    item: "Laptops",
    details: "10 refurbished laptops for education",
    status: "Pending"
  },
  {
    id: "3",
    organization: "Community Garden",
    type: "Materials",
    item: "Seeds",
    details: "Vegetable seeds for spring planting",
    status: "Rejected"
  }
];

const mockRequestPosts: RequestPost[] = [
  {
    id: "1",
    organization: "Local School District",
    type: "Materials",
    item: "Art Supplies",
    details: "Paint, brushes, and canvas for art class",
    status: "Pending"
  },
  {
    id: "2",
    organization: "Youth Center",
    type: "Tools",
    item: "Sports Equipment",
    details: "Basketball hoops and volleyballs",
    status: "Approved"
  },
  {
    id: "3",
    organization: "Senior Center",
    type: "Materials",
    item: "Craft Materials",
    details: "Yarn and knitting needles",
    status: "Archived"
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

export const Donations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for donation posts
  const [donationSort, setDonationSort] = useState<SortField>(null);
  const [donationDirection, setDonationDirection] = useState<SortDirection>(null);
  
  // Sorting states for request posts
  const [requestSort, setRequestSort] = useState<SortField>(null);
  const [requestDirection, setRequestDirection] = useState<SortDirection>(null);

  // Modal state
  const [selectedDonation, setSelectedDonation] = useState<DonationPost | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDonationSort = (field: SortField) => {
    if (donationSort === field) {
      if (donationDirection === "asc") {
        setDonationDirection("desc");
      } else if (donationDirection === "desc") {
        setDonationSort(null);
        setDonationDirection(null);
      } else {
        setDonationDirection("asc");
      }
    } else {
      setDonationSort(field);
      setDonationDirection("asc");
    }
  };

  const handleRequestSort = (field: SortField) => {
    if (requestSort === field) {
      if (requestDirection === "asc") {
        setRequestDirection("desc");
      } else if (requestDirection === "desc") {
        setRequestSort(null);
        setRequestDirection(null);
      } else {
        setRequestDirection("asc");
      }
    } else {
      setRequestSort(field);
      setRequestDirection("asc");
    }
  };

  const sortData = <T extends DonationPost | RequestPost>(
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

  const filterData = <T extends DonationPost | RequestPost>(data: T[]): T[] => {
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

  const filteredDonationPosts = filterData(mockDonationPosts);
  const sortedDonationPosts = sortData(filteredDonationPosts, donationSort, donationDirection);
  
  const filteredRequestPosts = filterData(mockRequestPosts);
  const sortedRequestPosts = sortData(filteredRequestPosts, requestSort, requestDirection);

  const handleDonationRowClick = (donation: DonationPost) => {
    setSelectedDonation(donation);
    setModalOpen(true);
  };

  const handleApprove = (id: string) => {
    console.log("Approved donation:", id);
    setModalOpen(false);
  };

  const handleReject = (id: string) => {
    console.log("Rejected donation:", id);
    setModalOpen(false);
  };

  const handleRequestChanges = (id: string) => {
    console.log("Requested changes for donation:", id);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
        <p className="text-muted-foreground">
          Manage and track all donation activities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for donations..."
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

      {/* Two Sections Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Posts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Donation Posts</h2>
          <div className="border rounded-lg h-96">
            <div className="h-full flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      field="organization"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-2/5"
                    >
                      Organization
                    </SortableTableHead>
                    <SortableTableHead
                      field="type"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/6"
                    >
                      Type
                    </SortableTableHead>
                    <SortableTableHead
                      field="item"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/6"
                    >
                      Item
                    </SortableTableHead>
                    <SortableTableHead
                      field="details"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/4"
                    >
                      Details
                    </SortableTableHead>
                    <SortableTableHead
                      field="status"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
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
                    {sortedDonationPosts.map((post) => (
                      <TableRow 
                        key={post.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleDonationRowClick(post)}
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

        {/* Request Posts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Request Posts</h2>
          <div className="border rounded-lg h-96">
            <div className="h-full flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      field="organization"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-2/5"
                    >
                      Organization
                    </SortableTableHead>
                    <SortableTableHead
                      field="type"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/6"
                    >
                      Type
                    </SortableTableHead>
                    <SortableTableHead
                      field="item"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/6"
                    >
                      Item
                    </SortableTableHead>
                    <SortableTableHead
                      field="details"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/4"
                    >
                      Details
                    </SortableTableHead>
                    <SortableTableHead
                      field="status"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
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
                    {sortedRequestPosts.map((post) => (
                      <TableRow key={post.id}>
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
      </div>

      {/* Donation Modal */}
      <DonationModal
        donation={selectedDonation}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestChanges={handleRequestChanges}
      />
    </div>
  );
};
