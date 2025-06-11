
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

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

  if (isUser) {
    return (
      <div className="flex gap-3 pt-6 border-t flex-wrap">
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
    <div className="flex gap-3 pt-6 border-t flex-wrap">
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
