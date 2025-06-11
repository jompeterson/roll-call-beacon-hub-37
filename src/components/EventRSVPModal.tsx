
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, UserCheck, UserX } from "lucide-react";
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

interface EventRSVPModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventRSVPModal = ({
  event,
  open,
  onOpenChange,
}: EventRSVPModalProps) => {
  const { isAuthenticated } = useAuth();
  
  const { 
    rsvpCount, 
    hasRsvp, 
    submitting, 
    createRSVP, 
    deleteRSVP 
  } = useEventRSVPs(event?.id || "");

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

  const handleRSVPToggle = () => {
    if (hasRsvp) {
      deleteRSVP();
    } else {
      createRSVP();
    }
  };

  const isEventFull = event.max_participants && rsvpCount >= event.max_participants;
  const canRSVP = isAuthenticated && event.is_approved && (!isEventFull || hasRsvp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {event.title}
          </DialogTitle>
          <DialogDescription>
            RSVP to this event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Event Details</h3>
            
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
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* RSVP Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">RSVP Information</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {rsvpCount} {rsvpCount === 1 ? 'person' : 'people'} attending
                </span>
              </div>
              
              {event.max_participants && (
                <span className="text-sm text-muted-foreground">
                  (Max: {event.max_participants})
                </span>
              )}
            </div>

            {isEventFull && !hasRsvp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  This event is at full capacity.
                </p>
              </div>
            )}

            {hasRsvp && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    You have RSVP'd to this event.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {canRSVP && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleRSVPToggle}
              disabled={submitting}
              className="flex-1"
              variant={hasRsvp ? "destructive" : "default"}
            >
              {submitting ? (
                "Processing..."
              ) : hasRsvp ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Cancel RSVP
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  RSVP to Event
                </>
              )}
            </Button>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Please log in to RSVP to this event.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
