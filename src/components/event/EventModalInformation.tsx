
import { Calendar, MapPin, Users, UserCheck } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date?: string | null;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

interface EventModalInformationProps {
  event: Event;
  rsvpCount: number;
}

export const EventModalInformation = ({ event, rsvpCount }: EventModalInformationProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Event Information</h3>
      
      {event.description && (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div>Start: {formatDate(event.start_date)}</div>
            {event.end_date && <div>End: {formatDate(event.end_date)}</div>}
          </div>
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
  );
};
