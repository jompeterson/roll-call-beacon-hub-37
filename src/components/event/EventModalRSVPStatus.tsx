
import { UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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

interface EventModalRSVPStatusProps {
  event: Event;
  hasRsvp: boolean;
  rsvpCount: number;
  isAuthenticated: boolean;
}

export const EventModalRSVPStatus = ({ 
  event, 
  hasRsvp, 
  rsvpCount, 
  isAuthenticated 
}: EventModalRSVPStatusProps) => {
  if (!isAuthenticated || !event.is_approved) {
    return null;
  }

  const isEventFull = event.max_participants && rsvpCount >= event.max_participants;

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">RSVP Status</h3>
        
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
    </>
  );
};
