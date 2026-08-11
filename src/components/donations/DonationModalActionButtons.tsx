import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { RequestChangesModal } from "@/components/shared/RequestChangesModal";
import { PrivateApprovalToggle } from "@/components/shared/PrivateApprovalToggle";

interface DonationModalActionButtonsProps {
  donationId: string;
  creatorUserId: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onChangeRequestSubmitted?: () => void;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  isUser?: boolean;
  approvalDecisionMade: boolean;
  isApproved: boolean;
}

export const DonationModalActionButtons = ({
  donationId,
  creatorUserId,
  onApprove,
  onReject,
  onRequestChanges,
  onChangeRequestSubmitted,
  onOpenChange,
  onEdit,
  isUser = false,
  approvalDecisionMade,
  isApproved
}: DonationModalActionButtonsProps) => {
  const { user, isAdministrator } = useAuth();
  const isOwner = user?.id === creatorUserId;
  const canEdit = isOwner || isAdministrator;
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [approveAsPrivate, setApproveAsPrivate] = useState(false);

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from("donations")
        .update({
          is_approved: true,
          approval_decision_made: true,
          is_private: approveAsPrivate,
        })
        .eq("id", donationId);

      if (error) {
        console.error("Error approving donation:", error);
        return;
      }

      onApprove(donationId);
      onOpenChange(false);
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

      onReject(donationId);
      onOpenChange(false);
    } catch (error) {
      console.error("Error rejecting donation:", error);
    }
  };

  // If approval decision has been made and approved, no footer action buttons here
  // (Ask for this Donation is rendered in the page header next to Share)
  if (approvalDecisionMade) {
    if (isApproved) {
      return null;
    }
    // If rejected, show no buttons
    return null;
  }

  // Show approval buttons if no decision has been made yet
  if (isUser) {
    return (
      <>
        <div className="flex gap-3 p-6 justify-between flex-wrap">
          <div>
            {canEdit && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              style={{ backgroundColor: "#3d7471" }}
              className="text-white hover:opacity-90"
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
              onClick={() => setShowRequestChangesModal(true)}
              variant="outline"
            >
              Request Changes
            </Button>
          </div>
        </div>
        <RequestChangesModal
          open={showRequestChangesModal}
          onOpenChange={setShowRequestChangesModal}
          contentType="donation"
          contentId={donationId}
          onSubmit={() => onRequestChanges(donationId)}
          onChangeRequestSubmitted={onChangeRequestSubmitted}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex justify-end">
          <PrivateApprovalToggle isPrivate={approveAsPrivate} onChange={setApproveAsPrivate} />
        </div>
        <div className="flex gap-3 justify-between flex-wrap">
          <div>
            {canEdit && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              style={{ backgroundColor: "#3d7471" }}
              className="text-white hover:opacity-90"
            >
              {approveAsPrivate ? "Approve as Private" : "Approve"}
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
            >
              Reject
            </Button>
            <Button
              onClick={() => setShowRequestChangesModal(true)}
              variant="outline"
            >
              Request Changes
            </Button>
          </div>
        </div>
      </div>
      <RequestChangesModal
        open={showRequestChangesModal}
        onOpenChange={setShowRequestChangesModal}
        contentType="donation"
        contentId={donationId}
        onSubmit={() => onRequestChanges(donationId)}
        onChangeRequestSubmitted={onChangeRequestSubmitted}
      />
    </>
  );
};
