
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import { useDonations } from "@/hooks/useDonations";
import { useRequests } from "@/hooks/useRequests";
import { DonationModal } from "@/components/DonationModal";
import { RequestModal } from "@/components/RequestModal";

type PendingItem = {
  id: string;
  title: string;
  type: 'donation' | 'request';
  amount?: number;
  request_type?: string;
};

export const PendingDonationsRequestsWidget = () => {
  const { data: donations = [] } = useDonations();
  const { data: requests = [] } = useRequests();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<'donation' | 'request' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingDonations = donations.filter(donation => !donation.approval_decision_made);
  const pendingRequests = requests.filter(request => !request.approval_decision_made);

  const pendingItems: PendingItem[] = [
    ...pendingDonations.map(d => ({ ...d, type: 'donation' as const })),
    ...pendingRequests.map(r => ({ ...r, type: 'request' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleItemClick = (item: PendingItem) => {
    setSelectedItem(item);
    setModalType(item.type);
    setModalOpen(true);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleApprove = (id: string) => {
    // Implementation would depend on the specific approval logic for donations/requests
    console.log('Approve:', id);
  };

  const handleReject = (id: string) => {
    // Implementation would depend on the specific rejection logic for donations/requests
    console.log('Reject:', id);
  };

  const handleRequestChanges = (id: string) => {
    // Implementation would depend on the specific request changes logic
    console.log('Request changes:', id);
  };

  const handleMarkCompleted = (id: string) => {
    // Implementation for marking requests as completed
    console.log('Mark completed:', id);
  };

  return (
    <>
      <Card className="cursor-pointer" onClick={() => {}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Donations/Requests</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{pendingItems.length}</div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {pendingItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="text-xs p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  <div className="font-medium truncate">{item.title}</div>
                  <div className="text-muted-foreground truncate">
                    {item.type === 'donation' && item.amount && formatAmount(item.amount)}
                    {item.type === 'request' && item.request_type}
                  </div>
                </div>
              ))}
              {pendingItems.length > 5 && (
                <div className="text-xs text-muted-foreground text-center p-1">
                  +{pendingItems.length - 5} more...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {modalType === 'donation' && (
        <DonationModal
          donation={selectedItem}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
        />
      )}

      {modalType === 'request' && (
        <RequestModal
          request={selectedItem}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onApprove={handleApprove}
          onReject={handleReject}
          onRequestChanges={handleRequestChanges}
          onMarkCompleted={handleMarkCompleted}
        />
      )}
    </>
  );
};
