import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface DonationModalActionButtonsProps {
  donationId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  isUser?: boolean;
  approvalDecisionMade: boolean;
  isApproved: boolean;
}

export const DonationModalActionButtons = ({
  donationId,
  onApprove,
  onReject,
  onRequestChanges,
  onOpenChange,
  isUser = false,
  approvalDecisionMade,
  isApproved
}: DonationModalActionButtonsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Check if user has already accepted this donation
  useEffect(() => {
    const checkAcceptance = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('donation_acceptances')
        .select('id')
        .eq('donation_id', donationId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setHasAccepted(!!data);
    };

    checkAcceptance();
  }, [donationId, user]);
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
      onOpenChange(false); // Navigate back after approval
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
      onOpenChange(false); // Navigate back after rejection
    } catch (error) {
      console.error("Error rejecting donation:", error);
    }
  };

  const handleAcceptDonation = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to accept donations.",
        variant: "destructive",
      });
      return;
    }

    setIsAccepting(true);
    
    try {
      const { error } = await supabase
        .from('donation_acceptances')
        .insert({
          donation_id: donationId,
          user_id: user.id
        });

      if (error) throw error;

      setHasAccepted(true);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error accepting donation:", error);
      toast({
        title: "Error",
        description: "Failed to accept donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };

  // If approval decision has been made, show different buttons
  if (approvalDecisionMade) {
    if (isApproved) {
      return (
        <>
          <div className="flex gap-3 p-6 flex-wrap">
            <Button 
              onClick={handleAcceptDonation}
              disabled={hasAccepted || isAccepting}
              className={hasAccepted ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
            >
              {hasAccepted ? "Already Accepted" : isAccepting ? "Accepting..." : "Accept Donation"}
            </Button>
          </div>
          
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Thank You!</AlertDialogTitle>
                <AlertDialogDescription>
                  Your interest has been noted. The donation poster will reach out to you soon to coordinate the donation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <Button onClick={() => setShowConfirmDialog(false)}>
                  Got it
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
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
