
import { Button } from "@/components/ui/button";

interface ScholarshipActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
  isApproving: boolean;
  isRejecting: boolean;
  isRequestingChanges: boolean;
}

export const ScholarshipActionButtons = ({
  onApprove,
  onReject,
  onRequestChanges,
  isApproving,
  isRejecting,
  isRequestingChanges,
}: ScholarshipActionButtonsProps) => {
  return (
    <div className="flex gap-2 w-full">
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
  );
};
