
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RequestChangesModal } from "@/components/shared/RequestChangesModal";
import { PrivateApprovalToggle } from "@/components/shared/PrivateApprovalToggle";
import { supabase } from "@/integrations/supabase/client";

interface ScholarshipActionButtonsProps {
  scholarshipId: string;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  onChangeRequestSubmitted?: () => void;
  onEdit?: () => void;
  creatorUserId: string;
  isApproving: boolean;
  isRejecting: boolean;
  isRequestingChanges: boolean;
}

export const ScholarshipActionButtons = ({
  scholarshipId,
  onApprove,
  onReject,
  onRequestChanges,
  onChangeRequestSubmitted,
  onEdit,
  creatorUserId,
  isApproving,
  isRejecting,
  isRequestingChanges,
}: ScholarshipActionButtonsProps) => {
  const { user, isAdministrator } = useAuth();
  const canEdit = user?.id === creatorUserId || isAdministrator;
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [approveAsPrivate, setApproveAsPrivate] = useState(false);

  const handleApproveClick = async () => {
    // Persist privacy choice before approval mutation runs.
    if (approveAsPrivate) {
      const { error } = await supabase
        .from("scholarships")
        .update({ is_private: true })
        .eq("id", scholarshipId);
      if (error) {
        console.error("Error setting scholarship privacy:", error);
      }
    } else {
      // Ensure it's public if toggle is off (in case it was previously set)
      await supabase
        .from("scholarships")
        .update({ is_private: false })
        .eq("id", scholarshipId);
    }
    onApprove();
  };

  return (
    <>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex justify-end">
          <PrivateApprovalToggle isPrivate={approveAsPrivate} onChange={setApproveAsPrivate} />
        </div>
        <div className="flex justify-between w-full">
          <div>
            {canEdit && onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApproveClick}
              disabled={isApproving}
              className="flex-1"
            >
              {isApproving
                ? "Approving..."
                : approveAsPrivate
                ? "Approve as Private"
                : "Approve Scholarship"}
            </Button>
            <Button
              variant="destructive"
              onClick={onReject}
              disabled={isRejecting}
              className="flex-1"
            >
              {isRejecting ? "Rejecting..." : "Reject Scholarship"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRequestChangesModal(true)}
              disabled={isRequestingChanges}
              className="flex-1"
            >
              {isRequestingChanges ? "Requesting..." : "Request Changes"}
            </Button>
          </div>
        </div>
      </div>
      <RequestChangesModal
        open={showRequestChangesModal}
        onOpenChange={setShowRequestChangesModal}
        contentType="scholarship"
        contentId={scholarshipId}
        onSubmit={onRequestChanges}
        onChangeRequestSubmitted={onChangeRequestSubmitted}
      />
    </>
  );
};
