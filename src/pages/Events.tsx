import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive, Users } from "lucide-react";
import { EventModal } from "@/components/EventModal";
import { EventCreateModal } from "@/components/EventCreateModal";
import { GuestRSVPModal } from "@/components/GuestRSVPModal";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useEventRSVPs } from "@/hooks/useEventRSVPs";

type SortDirection = "asc" | "desc" | null;
type SortField = "title" | "event_date" | "location" | "status" | null;

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

const RSVPCount = ({ eventId, isApproved }: { eventId: string; isApproved: boolean }) => {
  const { rsvpCount } = useEventRSVPs(isApproved ? eventId : "");
  
  if (!isApproved) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Users className="h-3 w-3" />
      <span>{rsvpCount}</span>
    </div>
  );
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
      className={`cursor-pointer hover:bg-[#326663] select-none text-white ${className}`}
      style={{ backgroundColor: "#3d7471" }}
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
  const { eventId } = useParams();
  const { events, loading, approveEvent, rejectEvent } = useEvents();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [eventSort, setEventSort] = useState<SortField>(null);
  const [eventDirection, setEventDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [guestRSVPModalOpen, setGuestRSVPModalOpen] = useState(false);

  // Handle URL parameters for direct modal opening
  useEffect(() => {
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setEventModalOpen(true);
      }
    }
  }, [eventId, events]);

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

  const getEventStatus = (event: any) => {
    if (!event.approval_decision_made) return "Pending";
    return event.is_approved ? "Approved" : "Rejected";
  };

  const sortData = (data: any[], sortField: SortField, direction: SortDirection) => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "status") {
        aValue = getEventStatus(a);
        bValue = getEventStatus(b);
      } else if (sortField === "event_date") {
        aValue = a.event_date;
        bValue = b.event_date;
      } else {
        aValue = a[sortField as keyof typeof a] || "";
        bValue = b[sortField as keyof typeof b] || "";
      }
      
      if (direction === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const filterData = (data: any[]) => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      if (!isAuthenticated) {
        // When not authenticated, only show approved events and ignore status filter
        return matchesSearch && item.is_approved;
      }
      
      const status = getEventStatus(item);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredEvents = filterData(events);
  const sortedEvents = sortData(filteredEvents, eventSort, eventDirection);

  const handleEventRowClick = (event: any) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleEventApprove = (id: string) => {
    approveEvent(id);
    setEventModalOpen(false);
  };

  const handleEventReject = (id: string) => {
    rejectEvent(id);
    setEventModalOpen(false);
  };

  const handleEventRequestChanges = (id: string) => {
    console.log("Requested changes for event:", id);
    setEventModalOpen(false);
  };

  const handleOpenGuestRSVPModal = () => {
    setEventModalOpen(false);
    setGuestRSVPModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

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

        {isAuthenticated && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Events</h2>
          {isAuthenticated && (
            <Button onClick={() => setCreateModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="title"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className={isAuthenticated ? "w-1/3" : "w-1/2"}
                  >
                    Event Title
                  </SortableTableHead>
                  <SortableTableHead
                    field="event_date"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className={isAuthenticated ? "w-1/4" : "w-1/4"}
                  >
                    Date
                  </SortableTableHead>
                  <SortableTableHead
                    field="location"
                    currentSort={eventSort}
                    currentDirection={eventDirection}
                    onSort={handleEventSort}
                    className={isAuthenticated ? "w-1/4" : "w-1/4"}
                  >
                    Location
                  </SortableTableHead>
                  {isAuthenticated && (
                    <SortableTableHead
                      field="status"
                      currentSort={eventSort}
                      currentDirection={eventDirection}
                      onSort={handleEventSort}
                      className="w-1/6"
                    >
                      Status
                    </SortableTableHead>
                  )}
                </TableRow>
              </TableHeader>
            </Table>
            <ScrollArea className="flex-1">
              <Table>
                <TableBody>
                  {sortedEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAuthenticated ? 4 : 3} className="text-center py-8 text-muted-foreground">
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedEvents.map((event) => (
                      <TableRow 
                        key={event.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleEventRowClick(event)}
                      >
                        <TableCell className={`font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-0 ${isAuthenticated ? "w-1/3" : "w-1/2"}`}>
                          <div className="flex items-center gap-2">
                            <span>{event.title}</span>
                            <RSVPCount eventId={event.id} isApproved={event.is_approved} />
                          </div>
                        </TableCell>
                        <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                          {formatDate(event.event_date)}
                        </TableCell>
                        <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                          {event.location || "TBD"}
                        </TableCell>
                        {isAuthenticated && (
                          <TableCell className="w-1/6">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <StatusIcon status={getEventStatus(event)} />
                              <span>{getEventStatus(event)}</span>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        onRequestChanges={handleEventRequestChanges}
        onOpenGuestRSVPModal={handleOpenGuestRSVPModal}
      />

      <EventCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onEventCreated={() => setCreateModalOpen(false)}
      />

      <GuestRSVPModal
        event={selectedEvent}
        open={guestRSVPModalOpen}
        onOpenChange={setGuestRSVPModalOpen}
      />
    </div>
  );
};

export default Events;
