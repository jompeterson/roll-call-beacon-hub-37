
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EventModal } from "@/components/EventModal";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

export const Events = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  
  const { events, loading } = useEvents();
  const { isAdministrator } = useAuth();

  // Handle URL parameter to open specific event modal
  useEffect(() => {
    const fetchAndOpenEvent = async () => {
      if (eventId) {
        // First try to find in current list
        const event = events.find(e => e.id === eventId);
        if (event) {
          setSelectedEvent(event);
          setEventModalOpen(true);
        } else if (events.length > 0) {
          // If not found in list but we have events loaded, try database
          try {
            const { data, error } = await supabase
              .from('events')
              .select('*')
              .eq('id', eventId)
              .single();
            
            if (!error && data) {
              setSelectedEvent(data as Event);
              setEventModalOpen(true);
            }
          } catch (error) {
            console.error('Error fetching event:', error);
          }
        }
      }
    };

    fetchAndOpenEvent();
  }, [eventId, events]);

  // Handle modal close and update URL
  const handleEventModalClose = (open: boolean) => {
    setEventModalOpen(open);
    if (!open) {
      setSelectedEvent(null);
      if (eventId) {
        navigate('/events', { replace: true });
      }
    }
  };

  const handleEventRowClick = (event: Event) => {
    setSelectedEvent(event);
    setEventModalOpen(true);
    navigate(`/events/${event.id}`);
  };

  const handleEventApprove = (id: string) => {
    console.log("Approved event:", id);
    setEventModalOpen(false);
    if (eventId) {
      navigate('/events', { replace: true });
    }
  };

  const handleEventReject = (id: string) => {
    console.log("Rejected event:", id);
    setEventModalOpen(false);
    if (eventId) {
      navigate('/events', { replace: true });
    }
  };

  const handleEventRequestChanges = (id: string) => {
    console.log("Requested changes for event:", id);
    setEventModalOpen(false);
    if (eventId) {
      navigate('/events', { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage and track community events
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Manage and track community events
        </p>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
            onClick={() => handleEventRowClick(event)}
          >
            <h3 className="font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Date: {formatDate(event.event_date)}</span>
              {event.location && <span>Location: {event.location}</span>}
            </div>
          </div>
        ))}
      </div>

      <EventModal
        event={selectedEvent}
        open={eventModalOpen}
        onOpenChange={handleEventModalClose}
        onApprove={handleEventApprove}
        onReject={handleEventReject}
        onRequestChanges={handleEventRequestChanges}
      />
    </div>
  );
};
