
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive } from "lucide-react";
import { DonationModal } from "@/components/DonationModal";

type SortDirection = "asc" | "desc" | null;
type SortField = "organization" | "name" | "hours" | "status" | null;

interface EventPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

const mockEventPosts: EventPost[] = [
  {
    id: "1",
    organization: "Community Center",
    type: "Materials",
    item: "Beach Cleanup Day",
    details: "15 hours",
    status: "Approved"
  },
  {
    id: "2",
    organization: "Local Library",
    type: "Tools",
    item: "Reading Program",
    details: "8 hours",
    status: "Pending"
  },
  {
    id: "3",
    organization: "Food Bank",
    type: "Materials",
    item: "Food Drive",
    details: "12 hours",
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

export const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states for event posts
  const [eventSort, setEventSort] = useState<SortField>(null);
  const [eventDirection, setEventDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<EventPost | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const handleEventSort = (field: SortField) => {
    if (eventSort === field) {
      if (eventDirection === "asc") {
        setEventDirection("desc");
      } else if (eventDirection === "desc") {
        setEventSort(null);
        setEventDirection(null);
      } else {
        setEventDirection("asc");
      }
    } else {
      setEventSort(field);
      setEventDirection("asc");
    }
  };

  const sortData = <T extends EventPost>(
    data: T[], 
    sortField: SortField, 
    direction: SortDirection
  ): T[] => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "name") {
        aValue = a.item;
        bValue = b.item;
      } else if (sortField === "hours") {
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

  const filterData = <T extends EventPost>(data: T[]): T[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value.toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredEventPosts = filterData(mockEventPosts);
  const sortedEventPosts = sortData(filteredEventPosts, eventSort, eventDirection);

  const handleEventRowClick = (event: EventPost) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleEventApprove = (id: string) => {
    console.log("Approved event:", id);
    setEventModalOpen(false);
  };

  const handleEventReject = (id: string) => {
    console.log("Rejected event:", id);
    setEventModalOpen(false);
  };

  const handleEventRequestChanges = (id: string) => {
    console.log("Requested changes for event:", id);
    setEventModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Create and manage community events
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for events..."
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

      {/* Event Posts Section - Full Width */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Event Posts</h2>
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="organization"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className="w-2/5"
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="name"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className="w-1/4"
                  >
                    Name
                  </SortableTableHead>
                  <SortableTableHead
                    field="hours"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className="w-1/6"
                  >
                    Volunteer Hours
                  </SortableTableHead>
                  <SortableTableHead
                    field="status"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
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
                  {sortedEventPosts.map((post) => (
                    <TableRow 
                      key={post.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEventRowClick(post)}
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
        donation={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        onRequestChanges={handleEventRequestChanges}
        isEvent={true}
      />
    </div>
  );
};
