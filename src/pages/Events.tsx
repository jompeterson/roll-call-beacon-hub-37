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
import { formatDate } from "@/lib/utils";
import { filterVisiblePosts } from "@/lib/postVisibility";
import { Lock } from "lucide-react";

type SortDirection = "asc" | "desc" | null;
type SortField = "title" | "start_date" | "location" | "status" | null;

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
  const { events, loading, approveEvent, rejectEvent, deleteEvent } = useEvents();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [eventSort, setEventSort] = useState<SortField>("start_date");
  const [eventDirection, setEventDirection] = useState<SortDirection>("desc");


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
      } else if (sortField === "start_date") {
        aValue = a.start_date;
        bValue = b.start_date;
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
    return filterVisiblePosts(data, user?.id, isAdministrator).filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );

      if (!isAuthenticated) {
        return matchesSearch && item.is_approved;
      }
      
      const status = getEventStatus(item);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredEvents = filterData(events);
  const sortedEvents = sortData(filteredEvents, eventSort, eventDirection);

  const isPastEvent = (event: any) => {
    if (event.is_ended) return true;
    const endsAt = new Date(event.end_date || event.start_date);
    return endsAt.getTime() < Date.now();
  };

  const upcomingEvents = sortedEvents.filter((e) => !isPastEvent(e));
  const pastEvents = sortedEvents.filter((e) => isPastEvent(e));

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

  // formatDate imported from utils

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
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Create and manage events
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
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
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Events</h2>
          {isAuthenticated && isAdministrator && (
            <Button onClick={() => setCreateModalOpen(true)} size="sm" style={{ backgroundColor: "#3d7471" }} className="text-white hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
        </div>

        <Tabs defaultValue="upcoming" className="w-full flex-1 flex flex-col min-h-0">
          <TabsList className="w-auto self-start">
            <TabsTrigger value="upcoming" className="gap-2">
              <CalendarClock className="h-4 w-4" />
              Upcoming ({upcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <Archive className="h-4 w-4" />
              Past ({pastEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0 flex-1 data-[state=active]:flex flex-col min-h-0">
            {renderEventTable(upcomingEvents)}
          </TabsContent>

          <TabsContent value="past" className="mt-0 flex-1 data-[state=active]:flex flex-col min-h-0">
            {renderEventTable(pastEvents)}
          </TabsContent>
        </Tabs>
      </div>


      {/* Modals */}
      <EventModal
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        onRequestChanges={handleEventRequestChanges}
        onDelete={deleteEvent}
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
