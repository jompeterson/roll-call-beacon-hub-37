
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useEventRSVPs } from "@/hooks/useEventRSVPs";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { EventModalHeader } from "@/components/event/EventModalHeader";
import { EventModalInformation } from "@/components/event/EventModalInformation";
import { EventModalRSVPStatus } from "@/components/event/EventModalRSVPStatus";
import { EventModalActionButtons } from "@/components/event/EventModalActionButtons";

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

interface EventModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onOpenGuestRSVPModal?: () => void;
  disableNavigation?: boolean;
}

export const EventModal = ({
  event,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  onOpenGuestRSVPModal,
  disableNavigation = false,
}: EventModalProps) => {
  const { isAdministrator, isAuthenticated } = useAuth();
  const { rsvpCount, hasRsvp, submitting, createRSVP, deleteRSVP } = useEventRSVPs(event?.id || "");
  const navigate = useNavigate();

  // Update URL when modal opens - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && event) {
      navigate(`/events/${event.id}`, { replace: true });
    } else if (!disableNavigation && !open) {
      navigate('/events', { replace: true });
    }
  }, [open, event, navigate, disableNavigation]);

  if (!event) return null;

  const handleRSVPAction = () => {
    if (isAuthenticated) {
      // For authenticated users, toggle RSVP directly
      if (hasRsvp) {
        deleteRSVP();
      } else {
        createRSVP();
      }
    } else {
      // For guests, open the guest RSVP modal
      if (onOpenGuestRSVPModal) {
        onOpenGuestRSVPModal();
      }
    }
  };

  // Show comments only for approved events
  const showComments = event.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[80vh]" : "h-[60vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${modalHeight} flex flex-col p-0`}>
        {/* Fixed Header */}
        <EventModalHeader title={event.title} />

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Event Information */}
            <EventModalInformation event={event} rsvpCount={rsvpCount} />

            {/* RSVP Status for authenticated users */}
            <EventModalRSVPStatus 
              event={event}
              hasRsvp={hasRsvp}
              rsvpCount={rsvpCount}
              isAuthenticated={isAuthenticated}
            />

            {/* Comments Section - Only show for approved events */}
            {showComments && (
              <CommentsSection
                contentType="event"
                contentId={event.id}
                title="Event Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer - Only show action buttons if handlers are provided */}
        {(onApprove || onReject || onRequestChanges) && (
          <EventModalActionButtons
            event={event}
            isAdministrator={isAdministrator}
            isAuthenticated={isAuthenticated}
            hasRsvp={hasRsvp}
            rsvpCount={rsvpCount}
            submitting={submitting}
            onApprove={onApprove}
            onReject={onReject}
            onRequestChanges={onRequestChanges}
            onRSVPAction={handleRSVPAction}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
