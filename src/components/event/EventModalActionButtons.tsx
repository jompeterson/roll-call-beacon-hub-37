
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { UserCheck } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

interface EventModalActionButtonsProps {
  event: Event;
  isAdministrator: boolean;
  isAuthenticated: boolean;
  hasRsvp: boolean;
  rsvpCount: number;
  submitting: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onRSVPAction: () => void;
  onEdit?: () => void;
}

export const EventModalActionButtons = ({
  event,
  isAdministrator,
  isAuthenticated,
  hasRsvp,
  rsvpCount,
  submitting,
  onApprove,
  onReject,
  onRequestChanges,
  onRSVPAction,
  onEdit,
}: EventModalActionButtonsProps) => {
  const { user, isAdministrator: authIsAdmin } = useAuth();
  const isOwner = user?.id === event.creator_user_id;
  const canEdit = isOwner || isAdministrator;

  const showApprovalButtons = !event.approval_decision_made && isAdministrator;
  const showRSVPButton = event.is_approved;
  const isEventFull = event.max_participants && rsvpCount >= event.max_participants;
  const canRSVP = event.is_approved && (!isEventFull || hasRsvp);

  // Show guest RSVP info for non-authenticated users
  const showGuestInfo = !isAuthenticated && showRSVPButton;

  return (
    <div className="flex-shrink-0 border-t p-6">
      {showGuestInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            Please log in to RSVP directly, or continue as a guest.
          </p>
        </div>
      )}

      <div className="flex justify-between items-center gap-2">
        <div>
          {canEdit && onEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
        
        <div className="flex gap-2">
          {showRSVPButton && canRSVP && (
            <Button
              onClick={onRSVPAction}
              disabled={submitting}
              className="flex-1"
              variant={isAuthenticated && hasRsvp ? "destructive" : "outline"}
            >
              {submitting ? (
                "Processing..."
              ) : isAuthenticated ? (
                hasRsvp ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Cancel RSVP
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    RSVP to Event
                  </>
                )
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  RSVP to Event
                </>
              )}
            </Button>
          )}

          {showApprovalButtons && (
            <>
              <Button
                onClick={() => onApprove(event.id)}
                className="flex-1"
              >
                Approve Event
              </Button>
              <Button
                variant="destructive"
                onClick={() => onReject(event.id)}
                className="flex-1"
              >
                Reject Event
              </Button>
              {onRequestChanges && (
                <Button
                  variant="outline"
                  onClick={() => onRequestChanges(event.id)}
                  className="flex-1"
                >
                  Request Changes
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
