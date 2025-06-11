import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronUp, ChevronDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { ScholarshipModal } from "@/components/ScholarshipModal";
import { useScholarships } from "@/hooks/useScholarships";
import { useAuth } from "@/hooks/useAuth";
import { Tables } from "@/integrations/supabase/types";

type SortDirection = "asc" | "desc" | null;
type SortField = "organization_name" | "title" | "amount" | "is_approved" | null;

type Scholarship = Tables<"scholarships"> & {
  creator?: {
    email: string;
  };
};

const StatusIcon = ({ scholarship }: { scholarship: Scholarship }) => {
  if (scholarship.approval_decision_made) {
    return scholarship.is_approved ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  }
  return <Clock className="h-4 w-4 text-yellow-600" />;
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
  const { scholarshipId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Sorting states
  const [sort, setSort] = useState<SortField>(null);
  const [direction, setDirection] = useState<SortDirection>(null);

  // Modal states
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use the scholarships hook and auth
  const {
    scholarships,
    isLoading,
    error,
    approveScholarship,
    rejectScholarship,
    requestChanges,
    isApproving,
    isRejecting,
    isRequestingChanges,
  } = useScholarships();

  const { isAuthenticated } = useAuth();

  // Handle URL parameters for direct modal opening
  useEffect(() => {
    if (scholarshipId && scholarships.length > 0) {
      const scholarship = scholarships.find(s => s.id === scholarshipId);
      if (scholarship) {
        setSelectedScholarship(scholarship);
        setModalOpen(true);
      }
    }
  }, [scholarshipId, scholarships]);

  const handleSort = (field: SortField) => {
    if (sort === field) {
      if (direction === "asc") {
        setDirection("desc");
      } else if (direction === "desc") {
        setSort(null);
        setDirection(null);
      } else {
        setDirection("asc");
      }
    } else {
      setSort(field);
      setDirection("asc");
    }
  };

  const sortData = (data: Scholarship[]): Scholarship[] => {
    if (!sort || !direction) return data;
    
    return [...data].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (sort === "title") {
        aValue = a.title;
        bValue = b.title;
      } else if (sort === "amount") {
        aValue = Number(a.amount);
        bValue = Number(b.amount);
      } else if (sort === "organization_name") {
        aValue = a.organization_name;
        bValue = b.organization_name;
      } else if (sort === "is_approved") {
        aValue = a.approval_decision_made ? (a.is_approved ? "approved" : "rejected") : "pending";
        bValue = b.approval_decision_made ? (b.is_approved ? "approved" : "rejected") : "pending";
      } else {
        aValue = String(a[sort as keyof Scholarship]);
        bValue = String(b[sort as keyof Scholarship]);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      if (direction === "asc") {
        return String(aValue).localeCompare(String(bValue));
      } else {
        return String(bValue).localeCompare(String(aValue));
      }
    });
  };

  const filterData = (data: Scholarship[]): Scholarship[] => {
    return data.filter((item) => {
      const matchesSearch = searchTerm === "" || 
        [item.title, item.organization_name, item.description].some(value => 
          value?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      let matchesStatus = true;
      if (statusFilter === "Approved") {
        matchesStatus = item.approval_decision_made && item.is_approved;
      } else if (statusFilter === "Rejected") {
        matchesStatus = item.approval_decision_made && !item.is_approved;
      } else if (statusFilter === "Pending") {
        matchesStatus = !item.approval_decision_made;
      }
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredScholarships = filterData(scholarships);
  const sortedScholarships = sortData(filteredScholarships);

  const handleRowClick = (scholarship: Scholarship) => {
    setSelectedScholarship(scholarship);
    setModalOpen(true);
  };

  const getStatusText = (scholarship: Scholarship) => {
    if (scholarship.approval_decision_made) {
      return scholarship.is_approved ? "Approved" : "Rejected";
    }
    return "Pending";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarships</h1>
          <p className="text-muted-foreground">
            Manage scholarship programs and applications
          </p>
        </div>
        <div className="text-center text-red-600">
          Error loading scholarships. Please try again later.
        </div>
      </div>
    );
  }

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

      {/* Scholarship Posts Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Scholarship Posts</h2>
        <div className="border rounded-lg h-96">
          <div className="h-full flex flex-col">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableTableHead
                    field="organization_name"
                    currentSort={sort}
                    currentDirection={direction}
                    onSort={handleSort}
                    className={isAuthenticated ? "w-2/5" : "w-1/2"}
                  >
                    Organization
                  </SortableTableHead>
                  <SortableTableHead
                    field="title"
                    currentSort={sort}
                    currentDirection={direction}
                    onSort={handleSort}
                    className={isAuthenticated ? "w-1/4" : "w-1/3"}
                  >
                    Name
                  </SortableTableHead>
                  <SortableTableHead
                    field="amount"
                    currentSort={sort}
                    currentDirection={direction}
                    onSort={handleSort}
                    className="w-1/6"
                  >
                    Amount
                  </SortableTableHead>
                  {isAuthenticated && (
                    <SortableTableHead
                      field="is_approved"
                      currentSort={sort}
                      currentDirection={direction}
                      onSort={handleSort}
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={isAuthenticated ? 4 : 3} className="text-center py-8">
                        Loading scholarships...
                      </TableCell>
                    </TableRow>
                  ) : sortedScholarships.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAuthenticated ? 4 : 3} className="text-center py-8">
                        No scholarships found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedScholarships.map((scholarship) => (
                      <TableRow 
                        key={scholarship.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(scholarship)}
                      >
                        <TableCell className={`font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-0 ${isAuthenticated ? "w-2/5" : "w-1/2"}`}>
                          {scholarship.organization_name}
                        </TableCell>
                        <TableCell className={`whitespace-nowrap overflow-hidden text-ellipsis max-w-0 ${isAuthenticated ? "w-1/4" : "w-1/3"}`}>
                          {scholarship.title}
                        </TableCell>
                        <TableCell className="w-1/6 whitespace-nowrap overflow-hidden text-ellipsis max-w-0">
                          {formatCurrency(Number(scholarship.amount))}
                        </TableCell>
                        {isAuthenticated && (
                          <TableCell className="w-1/6">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <StatusIcon scholarship={scholarship} />
                              <span>{getStatusText(scholarship)}</span>
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

      {/* Modal */}
      <ScholarshipModal
        scholarship={selectedScholarship}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={approveScholarship}
        onReject={rejectScholarship}
        onRequestChanges={requestChanges}
        isApproving={isApproving}
        isRejecting={isRejecting}
        isRequestingChanges={isRequestingChanges}
      />
    </div>
  );
};
