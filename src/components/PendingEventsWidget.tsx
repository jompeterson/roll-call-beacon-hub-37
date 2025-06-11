
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventModal } from "@/components/EventModal";
import { useState } from "react";

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

export const PendingEventsWidget = () => {
  const { events, loading, approveEvent, rejectEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const pendingEvents = events.filter(event => !event.approval_decision_made);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
  };

  const handleApprove = async (eventId: string) => {
    approveEvent(eventId);
    setEventModalOpen(false);
  };

  const handleReject = async (eventId: string) => {
    rejectEvent(eventId);
    setEventModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {pendingEvents.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending events</div>
          ) : (
            <div className="space-y-2">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(event.event_date)} • {event.location || 'Location TBD'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EventModal
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        disableNavigation={true}
      />
    </>
  );
};
