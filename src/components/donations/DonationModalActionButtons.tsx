
import { Button } from "@/components/ui/button";

interface DonationModalActionButtonsProps {
  donationId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isUser?: boolean;
}

export const DonationModalActionButtons = ({
  donationId,
  onApprove,
  onReject,
  onRequestChanges,
  isUser = false
}: DonationModalActionButtonsProps) => {
  if (isUser) {
    return null;
  }

  return (
    <div className="flex gap-3 pt-6 border-t">
      <Button 
        onClick={() => onApprove(donationId)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Approve
      </Button>
      <Button 
        onClick={() => onReject(donationId)}
        variant="destructive"
      >
        Reject
      </Button>
      <Button 
        onClick={() => onRequestChanges(donationId)}
        variant="outline"
      >
        Request Changes
      </Button>
    </div>
  );
};
