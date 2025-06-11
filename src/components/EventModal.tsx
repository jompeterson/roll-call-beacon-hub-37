
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

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
}

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "Approved":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "Pending":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case "Rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

export const EventModal = ({
  event,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
}: EventModalProps) => {
  const { isAdministrator } = useAuth();

  if (!event) return null;

  const getStatus = () => {
    if (!event.approval_decision_made) return "Pending";
    return event.is_approved ? "Approved" : "Rejected";
  };

  const getStatusVariant = () => {
    const status = getStatus();
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

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
          {/* Status */}
          <div className="flex items-center gap-2">
            <StatusIcon status={getStatus()} />
            <Badge variant={getStatusVariant()}>
              {getStatus()}
            </Badge>
          </div>

          <Separator />

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
            </div>
          </div>
        </div>

        {showApprovalButtons && (
          <div className="flex gap-2 pt-4">
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
