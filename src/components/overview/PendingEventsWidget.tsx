
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { EventModal } from "@/components/EventModal";

export const PendingEventsWidget = () => {
  const { events, approveEvent, rejectEvent } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const pendingEvents = events.filter(event => !event.approval_decision_made);

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleRequestChanges = (id: string) => {
    // Implementation for requesting changes on events
    console.log('Request changes for event:', id);
  };

  return (
    <>
      <Card className="cursor-pointer" onClick={() => {}}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{pendingEvents.length}</div>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {pendingEvents.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="text-xs p-2 rounded bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event);
                  }}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-muted-foreground truncate">
                    {formatDate(event.event_date)}
                  </div>
                </div>
              ))}
              {pendingEvents.length > 5 && (
                <div className="text-xs text-muted-foreground text-center p-1">
                  +{pendingEvents.length - 5} more...
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onApprove={approveEvent}
        onReject={rejectEvent}
        onRequestChanges={handleRequestChanges}
      />
    </>
  );
};
