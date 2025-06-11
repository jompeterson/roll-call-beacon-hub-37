
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { useDonations } from "@/hooks/useDonations";
import { useRequests } from "@/hooks/useRequests";
import { DonationModal } from "@/components/DonationModal";
import { RequestModal } from "@/components/RequestModal";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";

type Donation = Tables<"donations"> & {
  creator?: {
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  };
};

type Request = Tables<"requests"> & {
  creator?: {
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  };
};

export const PendingDonationsRequestsWidget = () => {
  const { data: donations = [], isLoading: donationsLoading } = useDonations();
  const { data: requests = [], isLoading: requestsLoading } = useRequests();
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const pendingDonations = donations.filter(donation => !donation.approval_decision_made);
  const pendingRequests = requests.filter(request => !request.approval_decision_made);
  const allPendingItems = [...pendingDonations, ...pendingRequests];

  const handleDonationClick = (donation: Donation) => {
    setSelectedDonation(donation);
    setDonationModalOpen(true);
  };

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
    setRequestModalOpen(true);
  };

  if (donationsLoading || requestsLoading) {
    return (
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Donations/Requests</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-64">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Donations/Requests</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-0">
          {allPendingItems.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No pending donations/requests</div>
          ) : (
            <ScrollArea className="h-44 px-6">
              <div className="space-y-2 py-2">
                {pendingDonations.map((donation) => (
                  <div
                    key={`donation-${donation.id}`}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleDonationClick(donation)}
                  >
                    <div className="font-medium text-sm">{donation.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Donation • ${donation.amount_needed}
                    </div>
                  </div>
                ))}
                {pendingRequests.map((request) => (
                  <div
                    key={`request-${request.id}`}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRequestClick(request)}
                  >
                    <div className="font-medium text-sm">{request.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Request • {request.request_type}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <DonationModal
        donation={selectedDonation}
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        disableNavigation={true}
      />

      <RequestModal
        request={selectedRequest}
        open={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        disableNavigation={true}
      />
    </>
  );
};
