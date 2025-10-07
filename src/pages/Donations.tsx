
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DonationFilters } from "@/components/donations/DonationFilters";
import { DonationTable } from "@/components/donations/DonationTable";
import { RequestTable } from "@/components/donations/RequestTable";
import { DonationCreateModal } from "@/components/donations/DonationCreateModal";
import { RequestCreateModal } from "@/components/donations/RequestCreateModal";
import { useDonations, type Donation } from "@/hooks/useDonations";
import { useRequests, type Request } from "@/hooks/useRequests";
import { useAuth } from "@/hooks/useAuth";
import { sortDonations } from "@/hooks/useDonationSorting";
import { sortRequests } from "@/hooks/useRequestSorting";
import { filterDonations, filterRequests } from "@/hooks/useDonationFiltering";

type SortDirection = "asc" | "desc" | null;
type DonationSortField = "organization_name" | "title" | "description" | "status" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

export const Donations = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modal states
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  
  // Sorting states for donation posts
  const [donationSort, setDonationSort] = useState<DonationSortField>(null);
  const [donationDirection, setDonationDirection] = useState<SortDirection>(null);
  
  // Sorting states for request posts
  const [requestSort, setRequestSort] = useState<RequestSortField>(null);
  const [requestDirection, setRequestDirection] = useState<SortDirection>(null);

  const { data: donations = [], isLoading: donationsLoading, error: donationsError } = useDonations();
  const { data: requests = [], isLoading: requestsLoading, error: requestsError } = useRequests();

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

  const filteredDonationPosts = filterDonations(donations, searchTerm, statusFilter);
  const sortedDonationPosts = sortDonations(filteredDonationPosts, donationSort, donationDirection);
  
  const filteredRequestPosts = filterRequests(requests, searchTerm, statusFilter);
  const sortedRequestPosts = sortRequests(filteredRequestPosts, requestSort, requestDirection);

  const handleDonationRowClick = (donation: Donation) => {
    navigate(`/donations/${donation.id}`);
  };

  const handleRequestRowClick = (request: Request) => {
    navigate(`/requests/${request.id}`);
  };

  if (donationsLoading || requestsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donation activities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading donations and requests...</p>
        </div>
      </div>
    );
  }

  if (donationsError || requestsError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donation activities
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">
            Error loading data: {donationsError?.message || requestsError?.message}
          </p>
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

      <DonationFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Two Sections Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Posts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Donation Posts</h2>
            {isAuthenticated && (
              <Button onClick={() => setDonationModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Donation
              </Button>
            )}
          </div>
          <DonationTable
            donations={sortedDonationPosts}
            sortField={donationSort}
            sortDirection={donationDirection}
            onSort={handleDonationSort}
            onRowClick={handleDonationRowClick}
            showStatus={isAuthenticated}
          />
        </div>

        {/* Request Posts Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Request Posts</h2>
            {isAuthenticated && (
              <Button onClick={() => setRequestModalOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Request
              </Button>
            )}
          </div>
          <RequestTable
            requests={sortedRequestPosts}
            sortField={requestSort}
            sortDirection={requestDirection}
            onSort={handleRequestSort}
            onRowClick={handleRequestRowClick}
            showStatus={isAuthenticated}
          />
        </div>
      </div>

      {/* Modals */}
      <DonationCreateModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        onDonationCreated={() => setDonationModalOpen(false)}
      />
      <RequestCreateModal
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        onRequestCreated={() => setRequestModalOpen(false)}
      />
    </div>
  );
};
