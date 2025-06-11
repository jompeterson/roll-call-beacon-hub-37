import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DonationModal } from "@/components/DonationModal";
import { RequestModal } from "@/components/RequestModal";
import { DonationFilters } from "@/components/donations/DonationFilters";
import { DonationTable } from "@/components/donations/DonationTable";
import { RequestTable } from "@/components/donations/RequestTable";
import { useDonations, type Donation } from "@/hooks/useDonations";
import { useRequests, type Request } from "@/hooks/useRequests";
import { sortDonations } from "@/hooks/useDonationSorting";
import { sortRequests } from "@/hooks/useRequestSorting";
import { filterDonations, filterRequests } from "@/hooks/useDonationFiltering";

type SortDirection = "asc" | "desc" | null;
type DonationSortField = "organization_name" | "title" | "description" | "status" | null;
type RequestSortField = "organization_name" | "request_type" | "title" | "description" | "status" | null;

export const Donations = () => {
  const { donationId, requestId } = useParams();
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
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // Fetch data from Supabase
  const { data: donations = [], isLoading: donationsLoading, error: donationsError } = useDonations();
  const { data: requests = [], isLoading: requestsLoading, error: requestsError } = useRequests();

  // Handle URL parameters for direct modal opening
  useEffect(() => {
    if (donationId && donations.length > 0) {
      const donation = donations.find(d => d.id === donationId);
      if (donation) {
        setSelectedDonation(donation);
        setDonationModalOpen(true);
      }
    }
  }, [donationId, donations]);

  useEffect(() => {
    if (requestId && requests.length > 0) {
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setSelectedRequest(request);
        setRequestModalOpen(true);
      }
    }
  }, [requestId, requests]);

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
    setSelectedDonation(donation);
    setDonationModalOpen(true);
  };

  const handleRequestRowClick = (request: Request) => {
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
          <h2 className="text-2xl font-semibold">Donation Posts</h2>
          <DonationTable
            donations={sortedDonationPosts}
            sortField={donationSort}
            sortDirection={donationDirection}
            onSort={handleDonationSort}
            onRowClick={handleDonationRowClick}
          />
        </div>

        {/* Request Posts Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Request Posts</h2>
          <RequestTable
            requests={sortedRequestPosts}
            sortField={requestSort}
            sortDirection={requestDirection}
            onSort={handleRequestSort}
            onRowClick={handleRequestRowClick}
          />
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
