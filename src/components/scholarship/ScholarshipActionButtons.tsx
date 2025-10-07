
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ScholarshipActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  onEdit?: () => void;
  creatorUserId: string;
  isApproving: boolean;
  isRejecting: boolean;
  isRequestingChanges: boolean;
}

export const ScholarshipActionButtons = ({
  onApprove,
  onReject,
  onRequestChanges,
  onEdit,
  creatorUserId,
  isApproving,
  isRejecting,
  isRequestingChanges,
}: ScholarshipActionButtonsProps) => {
  const { user, isAdministrator } = useAuth();
  const canEdit = user?.id === creatorUserId || isAdministrator;

  return (
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
        onClick={onApprove}
        disabled={isApproving}
        className="flex-1"
      >
        {isApproving ? "Approving..." : "Approve Scholarship"}
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
        onClick={onRequestChanges}
        disabled={isRequestingChanges}
        className="flex-1"
      >
        {isRequestingChanges ? "Requesting..." : "Request Changes"}
      </Button>
      </div>
    </div>
  );
};
