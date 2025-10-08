import { useParams, useNavigate, Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useEventRSVPs } from "@/hooks/useEventRSVPs";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { EventModalHeader } from "@/components/event/EventModalHeader";
import { EventModalInformation } from "@/components/event/EventModalInformation";
import { EventModalRSVPStatus } from "@/components/event/EventModalRSVPStatus";
import { EventModalActionButtons } from "@/components/event/EventModalActionButtons";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { ImageCarousel } from "@/components/shared/ImageCarousel";

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdministrator } = useAuth();
  const { 
    events,
    loading,
    approveEvent,
    rejectEvent
  } = useEvents();
  const { rsvpCount, hasRsvp, submitting, createRSVP, deleteRSVP } = useEventRSVPs(eventId || "");

  const event = events.find(e => e.id === eventId);

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/events">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Loading...</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-center h-64">
          <p>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/events">Events</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Not Found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg mb-4">Event not found</p>
            <button
              onClick={() => navigate('/events')}
              className="text-primary hover:underline"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRSVPAction = () => {
    if (hasRsvp) {
      deleteRSVP();
    } else {
      createRSVP();
    }
  };

  const handleApprove = () => {
    approveEvent(event.id);
    navigate('/events');
  };

  const handleReject = () => {
    rejectEvent(event.id);
    navigate('/events');
  };

  const showComments = event.is_approved;

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/events">Events</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{event.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold">{event.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Events</p>
            </div>
            <ShareButton />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Carousel */}
          {event.images && event.images.length > 0 && (
            <ImageCarousel images={event.images} title={event.title} />
          )}
          
          {/* Event Information */}
          <EventModalInformation event={event} rsvpCount={rsvpCount} />

          {/* RSVP Status for authenticated users */}
          <EventModalRSVPStatus 
            event={event}
            hasRsvp={hasRsvp}
            rsvpCount={rsvpCount}
            isAuthenticated={isAuthenticated}
          />

          {/* Comments Section */}
          {showComments && (
            <CommentsSection
              contentType="event"
              contentId={event.id}
              title="Event Discussion"
            />
          )}
        </div>

        {/* Footer with Action Buttons */}
        <EventModalActionButtons
          event={event}
          isAdministrator={isAdministrator}
          isAuthenticated={isAuthenticated}
          hasRsvp={hasRsvp}
          rsvpCount={rsvpCount}
          submitting={submitting}
          onApprove={handleApprove}
          onReject={handleReject}
          onRSVPAction={handleRSVPAction}
        />
      </div>
    </div>
  );
};
