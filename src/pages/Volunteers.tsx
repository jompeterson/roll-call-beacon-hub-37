import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle, Archive, Users } from "lucide-react";
import { VolunteerModal } from "@/components/VolunteerModal";
import { VolunteerCreateModal } from "@/components/VolunteerCreateModal";
import { GuestVolunteerSignupModal } from "@/components/GuestVolunteerSignupModal";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useAuth } from "@/hooks/useAuth";
import { useVolunteerSignups } from "@/hooks/useVolunteerSignups";

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

const SignupCount = ({ volunteerId, isApproved }: { volunteerId: string; isApproved: boolean }) => {
  const { signupCount } = useVolunteerSignups(isApproved ? volunteerId : "");
  
  if (!isApproved) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Users className="h-3 w-3" />
      <span>{signupCount}</span>
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

export const Volunteers = () => {
  const { volunteerId } = useParams();
  const { volunteers, loading, approveVolunteer, rejectVolunteer } = useVolunteers();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [volunteerSort, setVolunteerSort] = useState<SortField>(null);
  const [volunteerDirection, setVolunteerDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [guestSignupModalOpen, setGuestSignupModalOpen] = useState(false);

  // Handle URL parameters for direct modal opening
  useEffect(() => {
    if (volunteerId && volunteers.length > 0) {
      const volunteer = volunteers.find(v => v.id === volunteerId);
      if (volunteer) {
        setSelectedVolunteer(volunteer);
        setVolunteerModalOpen(true);
      }
    }
  }, [volunteerId, volunteers]);

  const handleVolunteerSort = (field: SortField) => {
    if (volunteerSort === field) {
      if (volunteerDirection === "asc") {
        setVolunteerDirection("desc");
      } else if (volunteerDirection === "desc") {
        setVolunteerSort(null);
        setVolunteerDirection(null);
      } else {
        setVolunteerDirection("asc");
      }
    } else {
      setVolunteerSort(field);
      setVolunteerDirection("asc");
    }
  };

  const getVolunteerStatus = (volunteer: any) => {
    if (!volunteer.approval_decision_made) return "Pending";
    return volunteer.is_approved ? "Approved" : "Rejected";
  };

  const sortData = (data: any[], sortField: SortField, direction: SortDirection) => {
    if (!sortField || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      if (sortField === "status") {
        aValue = getVolunteerStatus(a);
        bValue = getVolunteerStatus(b);
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
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      if (!isAuthenticated) {
        // When not authenticated, only show approved volunteers and ignore status filter
        return matchesSearch && item.is_approved;
      }
      
      const status = getVolunteerStatus(item);
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredVolunteers = filterData(volunteers);
  const sortedVolunteers = sortData(filteredVolunteers, volunteerSort, volunteerDirection);

  const handleVolunteerRowClick = (volunteer: any) => {
    setSelectedVolunteer(volunteer);
    setVolunteerModalOpen(true);
  };

  const handleVolunteerApprove = (id: string) => {
    approveVolunteer(id);
    setVolunteerModalOpen(false);
  };

  const handleVolunteerReject = (id: string) => {
    rejectVolunteer(id);
    setVolunteerModalOpen(false);
  };

  const handleVolunteerRequestChanges = (id: string) => {
    console.log("Requested changes for volunteer:", id);
    setVolunteerModalOpen(false);
  };

  const handleOpenGuestSignupModal = () => {
    setVolunteerModalOpen(false);
    setGuestSignupModalOpen(true);
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
          <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
          <p className="text-muted-foreground">Loading volunteer opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
        <p className="text-muted-foreground">
          Find and manage volunteer opportunities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search for volunteer opportunities..."
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

      {/* Volunteers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Volunteer Opportunities</h2>
          {isAuthenticated && (
            <Button onClick={() => setCreateModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
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
                    currentSort={volunteerSort}
                    currentDirection={volunteerDirection}
                    onSort={handleVolunteerSort}
                    className={isAuthenticated ? "w-1/3" : "w-1/2"}
                  >
                    Opportunity Title
                  </SortableTableHead>
                  <SortableTableHead
                    field="start_date"
                    currentSort={volunteerSort}
                    currentDirection={volunteerDirection}
                    onSort={handleVolunteerSort}
                    className={isAuthenticated ? "w-1/4" : "w-1/4"}
                  >
                    Start Date
                  </SortableTableHead>
                  <SortableTableHead
                    field="location"
                    currentSort={volunteerSort}
                    currentDirection={volunteerDirection}
                    onSort={handleVolunteerSort}
                    className={isAuthenticated ? "w-1/4" : "w-1/4"}
                  >
                    Location
                  </SortableTableHead>
                  {isAuthenticated && (
                    <SortableTableHead
                      field="status"
                      currentSort={volunteerSort}
                      currentDirection={volunteerDirection}
                      onSort={handleVolunteerSort}
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
                  {sortedVolunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAuthenticated ? 4 : 3} className="text-center py-8 text-muted-foreground">
                        No volunteer opportunities found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedVolunteers.map((volunteer) => (
                      <TableRow 
                        key={volunteer.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleVolunteerRowClick(volunteer)}
                      >
                        <TableCell className={`font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-0 ${isAuthenticated ? "w-1/3" : "w-1/2"}`}>
                          <div className="flex items-center gap-2">
                            <span>{volunteer.title}</span>
                            <SignupCount volunteerId={volunteer.id} isApproved={volunteer.is_approved} />
                          </div>
                        </TableCell>
                        <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                          {formatDate(volunteer.start_date)}
                        </TableCell>
                        <TableCell className="w-1/4 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                          {volunteer.location || "TBD"}
                        </TableCell>
                        {isAuthenticated && (
                          <TableCell className="w-1/6">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <StatusIcon status={getVolunteerStatus(volunteer)} />
                              <span>{getVolunteerStatus(volunteer)}</span>
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
      <VolunteerModal
        volunteer={selectedVolunteer}
        open={volunteerModalOpen}
        onOpenChange={setVolunteerModalOpen}
        onApprove={handleVolunteerApprove}
        onReject={handleVolunteerReject}
        onRequestChanges={handleVolunteerRequestChanges}
        onOpenGuestSignupModal={handleOpenGuestSignupModal}
      />

      <VolunteerCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onVolunteerCreated={() => setCreateModalOpen(false)}
      />

      <GuestVolunteerSignupModal
        volunteer={selectedVolunteer}
        open={guestSignupModalOpen}
        onOpenChange={setGuestSignupModalOpen}
      />
    </div>
  );
};

export default Volunteers;
