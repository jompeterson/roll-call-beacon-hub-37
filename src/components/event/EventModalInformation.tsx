
import { Calendar, MapPin, Users, UserCheck, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date?: string | null;
  location: string | null;
  event_link?: string | null;
  event_type?: string | null;
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
  highlightedFields?: string[];
}

const FieldWrapper = ({ fieldKey, highlightedFields, children }: { fieldKey: string; highlightedFields?: string[]; children: React.ReactNode }) => {
  const isHighlighted = highlightedFields?.includes(fieldKey);
  return (
    <div className={cn(isHighlighted && "bg-destructive/10 border border-destructive/30 rounded-md p-2 -mx-2")}>
      {children}
    </div>
  );
};

export const EventModalInformation = ({ event, rsvpCount, highlightedFields }: EventModalInformationProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-semibold text-lg">Event Information</h3>
        {event.event_type && (
          <Badge variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {event.event_type}
          </Badge>
        )}
      </div>
      
      {event.description && (
        <FieldWrapper fieldKey="description" highlightedFields={highlightedFields}>
          <p className={cn("text-sm", highlightedFields?.includes("description") ? "text-destructive" : "text-muted-foreground")}>{event.description}</p>
        </FieldWrapper>
      )}
      
      <div className="space-y-3">
        <FieldWrapper fieldKey="start_date" highlightedFields={highlightedFields}>
          <div className="flex items-center gap-2">
            <Calendar className={cn("h-4 w-4", highlightedFields?.includes("start_date") || highlightedFields?.includes("end_date") ? "text-destructive" : "text-muted-foreground")} />
            <div className="text-sm">
              <div>Start: {formatDate(event.start_date, { includeTime: true })}</div>
              {event.end_date && <div>End: {formatDate(event.end_date, { includeTime: true })}</div>}
            </div>
          </div>
        </FieldWrapper>
        
        {event.location && (
          <FieldWrapper fieldKey="location" highlightedFields={highlightedFields}>
            <div className="flex items-start gap-2">
              <MapPin className={cn("h-4 w-4 mt-0.5", highlightedFields?.includes("location") ? "text-destructive" : "text-muted-foreground")} />
              <span className="text-sm">{event.location}</span>
            </div>
          </FieldWrapper>
        )}
        
        {event.event_link && (
          <FieldWrapper fieldKey="event_link" highlightedFields={highlightedFields}>
            <Button
              asChild
              size="sm"
              variant="default"
            >
              <a
                href={event.event_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Event
              </a>
            </Button>
          </FieldWrapper>
        )}
        
        {event.max_participants && (
          <FieldWrapper fieldKey="max_participants" highlightedFields={highlightedFields}>
            <div className="flex items-center gap-2">
              <Users className={cn("h-4 w-4", highlightedFields?.includes("max_participants") ? "text-destructive" : "text-muted-foreground")} />
              <span className="text-sm">Max Participants: {event.max_participants}</span>
            </div>
          </FieldWrapper>
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
