
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEventRSVPs } from "@/hooks/useEventRSVPs";

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
  onOpenRSVPModal?: () => void;
}

export const EventModal = ({
  event,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  onOpenRSVPModal,
}: EventModalProps) => {
  const { isAdministrator, isAuthenticated } = useAuth();
  const { rsvpCount } = useEventRSVPs(event?.id || "");

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showApprovalButtons = !event.approval_decision_made && isAdministrator;
  const showRSVPButton = event.is_approved; // Show for all approved events, regardless of auth status

  // Debug logging
  console.log('EventModal Debug:', {
    eventId: event.id,
    isApproved: event.is_approved,
    isAuthenticated,
    showRSVPButton,
    onOpenRSVPModal: !!onOpenRSVPModal
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.title}
          </DialogTitle>
          <DialogDescription>
            Event details and management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Event Information</h3>
            
            {event.description && (
              <p className="text-sm text-muted-foreground">{event.description}</p>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(event.event_date)}</span>
              </div>
              
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{event.location}</span>
                </div>
              )}
              
              {event.max_participants && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Max Participants: {event.max_participants}</span>
                </div>
              )}

              {event.is_approved && (
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {rsvpCount} {rsvpCount === 1 ? 'person' : 'people'} attending
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          {showRSVPButton && onOpenRSVPModal && (
            <Button
              onClick={onOpenRSVPModal}
              className="flex-1"
              variant="outline"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              RSVP to Event
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
      </DialogContent>
    </Dialog>
  );
};
