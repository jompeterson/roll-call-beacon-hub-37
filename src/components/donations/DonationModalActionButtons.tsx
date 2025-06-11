
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DonationModalActionButtonsProps {
  donationId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isUser?: boolean;
  approvalDecisionMade: boolean;
  isApproved: boolean;
}

export const DonationModalActionButtons = ({
  donationId,
  onApprove,
  onReject,
  onRequestChanges,
  isUser = false,
  approvalDecisionMade,
  isApproved
}: DonationModalActionButtonsProps) => {
  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({
          is_approved: true,
          approval_decision_made: true
        })
        .eq("id", donationId);

      if (error) {
        console.error("Error approving donation:", error);
        return;
      }

      console.log("Donation approved successfully");
      onApprove(donationId);
    } catch (error) {
      console.error("Error approving donation:", error);
    }
  };

  const handleReject = async () => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({
          is_approved: false,
          approval_decision_made: true
        })
        .eq("id", donationId);

      if (error) {
        console.error("Error rejecting donation:", error);
        return;
      }

      console.log("Donation rejected successfully");
      onReject(donationId);
    } catch (error) {
      console.error("Error rejecting donation:", error);
    }
  };

  const handleAcceptDonation = () => {
    console.log("Accepting donation:", donationId);
    // Add your accept donation logic here
  };

  // If approval decision has been made, show different buttons
  if (approvalDecisionMade) {
    if (isApproved) {
      return (
        <div className="flex gap-3 p-6 flex-wrap">
          <Button 
            onClick={handleAcceptDonation}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept Donation
          </Button>
        </div>
      );
    }
    // If rejected, show no buttons
    return null;
  }

  // Show approval buttons if no decision has been made yet
  if (isUser) {
    return (
      <div className="flex gap-3 p-6 flex-wrap">
        <Button 
          onClick={handleApprove}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Approve User
        </Button>
        <Button 
          onClick={handleReject}
          variant="destructive"
        >
          Reject User
        </Button>
        <Button 
          onClick={() => onRequestChanges(donationId)}
          variant="outline"
        >
          Request Changes
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 p-6 flex-wrap">
      <Button 
        onClick={handleApprove}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Approve
      </Button>
      <Button 
        onClick={handleReject}
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
