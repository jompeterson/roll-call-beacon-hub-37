
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";
import { RequestModal } from "@/components/RequestModal";
import { useDonations, type Donation } from "@/hooks/useDonations";

type SortDirection = "asc" | "desc" | null;
type DonationSortField = "organization_name" | "title" | "description" | "status" | null;
type RequestSortField = "organization" | "type" | "item" | "details" | "status" | null;

interface RequestPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

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

const DonationSortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: { 
  children: React.ReactNode;
  field: DonationSortField;
  currentSort: DonationSortField;
  currentDirection: SortDirection;
  onSort: (field: DonationSortField) => void;
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

const RequestSortableTableHead = ({ 
  children, 
  field, 
  currentSort, 
  currentDirection, 
  onSort,
  className = ""
}: { 
  children: React.ReactNode;
  field: RequestSortField;
  currentSort: RequestSortField;
  currentDirection: SortDirection;
  onSort: (field: RequestSortField) => void;
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

// Helper function to get status from donation approval state
const getDonationStatus = (donation: Donation): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!donation.approval_decision_made) {
    return "Pending";
  }
  return donation.is_approved ? "Approved" : "Rejected";
};

export const Donations = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for donation posts
  const [donationSort, setDonationSort] = useState<DonationSortField>(null);
  const [donationDirection, setDonationDirection] = useState<SortDirection>(null);
  
  // Sorting states for request posts
  const [requestSort, setRequestSort] = useState<RequestSortField>(null);
  const [requestDirection, setRequestDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestPost | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Fetch donations from Supabase
  const { data: donations = [], isLoading, error } = useDonations();

  const handleDonationSort = (field: DonationSortField) => {
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

  const handleRequestSort = (field: RequestSortField) => {
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

  const sortDonations = (
    data: Donation[], 
    sortField: DonationSortField, 
    direction: SortDirection
  ): Donation[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (sortField) {
        case "organization_name":
          aValue = a.organization_name || "";
          bValue = b.organization_name || "";
          break;
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "description":
          aValue = a.description || "";
          bValue = b.description || "";
          break;
        case "status":
          aValue = getDonationStatus(a);
          bValue = getDonationStatus(b);
          break;
        default:
          return 0;
      }
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const sortRequests = (
    data: RequestPost[], 
    sortField: RequestSortField, 
    direction: SortDirection
  ): RequestPost[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (sortField) {
        case "organization":
          aValue = a.organization;
          bValue = b.organization;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "item":
          aValue = a.item;
          bValue = b.item;
          break;
        case "details":
          aValue = a.details;
          bValue = b.details;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterDonations = (data: Donation[]): Donation[] => {
    return data.filter((donation) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(donation).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      const status = getDonationStatus(donation);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filterRequests = (data: RequestPost[]): RequestPost[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredDonationPosts = filterDonations(donations);
  const sortedDonationPosts = sortDonations(filteredDonationPosts, donationSort, donationDirection);
  
  const filteredRequestPosts = filterRequests(mockRequestPosts);
  const sortedRequestPosts = sortRequests(filteredRequestPosts, requestSort, requestDirection);

  const handleDonationRowClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setDonationModalOpen(true);
  };

  const handleRequestRowClick = (request: RequestPost) => {
    setSelectedRequest(request);
    setRequestModalOpen(true);
  };

  const handleDonationApprove = (id: string) => {
    console.log("Approved donation:", id);
    setDonationModalOpen(false);
  };

  const handleDonationReject = (id: string) => {
    console.log("Rejected donation:", id);
    setDonationModalOpen(false);
  };

  const handleDonationRequestChanges = (id: string) => {
    console.log("Requested changes for donation:", id);
    setDonationModalOpen(false);
  };

  const handleRequestApprove = (id: string) => {
    console.log("Approved request:", id);
    setRequestModalOpen(false);
  };

  const handleRequestReject = (id: string) => {
    console.log("Rejected request:", id);
    setRequestModalOpen(false);
  };

  const handleRequestRequestChanges = (id: string) => {
    console.log("Requested changes for request:", id);
    setRequestModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donation activities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading donations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donation activities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading donations: {error.message}</p>
        </div>
      </div>
    );
  }

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
                    <DonationSortableTableHead
                      field="organization_name"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-2/5"
                    >
                      Organization
                    </DonationSortableTableHead>
                    <DonationSortableTableHead
                      field="title"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/4"
                    >
                      Title
                    </DonationSortableTableHead>
                    <DonationSortableTableHead
                      field="description"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/4"
                    >
                      Description
                    </DonationSortableTableHead>
                    <DonationSortableTableHead
                      field="status"
                      currentSort={donationSort}
                      currentDirection={donationDirection}
                      onSort={handleDonationSort}
                      className="w-1/6"
                    >
                      Status
                    </DonationSortableTableHead>
                  </TableRow>
                </TableHeader>
              </Table>
              <ScrollArea className="flex-1">
                <Table>
                  <TableBody>
                    {sortedDonationPosts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No donations available
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedDonationPosts.map((donation) => {
                        const status = getDonationStatus(donation);
                        return (
                          <TableRow 
                            key={donation.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => handleDonationRowClick(donation)}
                          >
                            <TableCell className="font-medium w-2/5 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                              {donation.organization_name || "No Organization"}
                            </TableCell>
                            <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                              {donation.title}
                            </TableCell>
                            <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                              {donation.description || "No description"}
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
        </div>

        {/* Request Posts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Request Posts</h2>
          <div className="border rounded-lg h-96">
            <div className="h-full flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow>
                    <RequestSortableTableHead
                      field="organization"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-2/5"
                    >
                      Organization
                    </RequestSortableTableHead>
                    <RequestSortableTableHead
                      field="type"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/6"
                    >
                      Type
                    </RequestSortableTableHead>
                    <RequestSortableTableHead
                      field="item"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/6"
                    >
                      Item
                    </RequestSortableTableHead>
                    <RequestSortableTableHead
                      field="details"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
                      className="w-1/4"
                    >
                      Details
                    </RequestSortableTableHead>
                    <RequestSortableTableHead
                      field="status"
                      currentSort={requestSort}
                      currentDirection={requestDirection}
                      onSort={handleRequestSort}
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
                    {sortedRequestPosts.map((post) => (
                      <TableRow 
                        key={post.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRequestRowClick(post)}
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
      </div>

      {/* Modals */}
      <DonationModal
        donation={selectedDonation}
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onApprove={handleDonationApprove}
        onReject={handleDonationReject}
        onRequestChanges={handleDonationRequestChanges}
      />

      <RequestModal
        request={selectedRequest}
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onApprove={handleRequestApprove}
        onReject={handleRequestReject}
        onRequestChanges={handleRequestRequestChanges}
      />
    </div>
  );
};
