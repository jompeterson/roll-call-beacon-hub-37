import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useAuth } from "@/hooks/useAuth";
import { useEventRSVPs } from "@/hooks/useEventRSVPs";
import { useChangeRequest } from "@/hooks/useChangeRequest";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Edit } from "lucide-react";
import { EventModalHeader } from "@/components/event/EventModalHeader";
import { EventModalInformation } from "@/components/event/EventModalInformation";
import { EventModalRSVPStatus } from "@/components/event/EventModalRSVPStatus";
import { EventModalActionButtons } from "@/components/event/EventModalActionButtons";
import { EventEditModal } from "@/components/event/EventEditModal";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ChangeRequestBanner } from "@/components/shared/ChangeRequestBanner";

export const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const { 
    events,
    loading,
    approveEvent,
    rejectEvent,
    deleteEvent
  } = useEvents();
  const { rsvpCount, hasRsvp, submitting, createRSVP, deleteRSVP } = useEventRSVPs(eventId || "");
  const [editOpen, setEditOpen] = useState(false);

  const event = events.find(e => e.id === eventId);
  const { changeRequest, refetch: refetchChangeRequest } = useChangeRequest("event", eventId || "");
  const isOwner = user?.id === event?.creator_user_id;

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
  const canDelete = user && (user.id === event.creator_user_id || isAdministrator);
  const canEdit = user && ((user.id === event.creator_user_id && !event.is_approved) || isAdministrator);

  const handleDelete = () => {
    deleteEvent(event.id);
    navigate('/events');
  };

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
          {/* Change Request Banner */}
          {changeRequest && isOwner && (
            <ChangeRequestBanner
              comment={changeRequest.comment}
              fieldLabels={changeRequest.fieldLabels}
            />
          )}

          {/* Image Carousel */}
          {event.images && event.images.length > 0 && (
            <ImageCarousel images={event.images} title={event.title} />
          )}
          
          {/* Event Information */}
          <EventModalInformation event={event} rsvpCount={rsvpCount} highlightedFields={isOwner && changeRequest ? changeRequest.fieldKeys : undefined} />

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
        <div className="px-6 py-4 border-t bg-card">
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2">
              {canDelete && (
                <DeleteConfirmDialog
                  title="Delete Event"
                  description="Are you sure you want to delete this event? This action cannot be undone."
                  onConfirm={handleDelete}
                />
              )}
              {canEdit && (
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div>
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
                onChangeRequestSubmitted={refetchChangeRequest}
              />
            </div>
          </div>
        </div>
      </div>
      {canEdit && (
        <EventEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          event={event}
          hasChangeRequest={!!changeRequest}
          onEventUpdated={refetchChangeRequest}
        />
      )}
    </div>
  );
};
