
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Mail, Phone, Building, Clock, AlertTriangle } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Request = Tables<"requests">;

interface RequestModalProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

export const RequestModal = ({
  request,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
}: RequestModalProps) => {
  const { isAdministrator } = useAuth();
  const { toast } = useToast();
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  if (!request) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUrgencyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusBadge = () => {
    if (request.is_completed) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
    }
    
    if (!request.approval_decision_made) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>;
    }
    
    if (request.is_approved) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    }
  };

  const handleMarkCompleted = async () => {
    if (!request.id) return;

    setIsMarkingCompleted(true);
    
    try {
      const { error } = await supabase
        .from("requests")
        .update({ is_completed: true })
        .eq("id", request.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Request marked as completed successfully!",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error marking request as completed:", error);
      toast({
        title: "Error",
        description: "Failed to mark request as completed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const showActionButtons = isAdministrator && !request.approval_decision_made;
  const showMarkCompletedButton = request.is_approved && !request.is_completed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold pr-4">
                {request.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge()}
                {request.urgency_level && (
                  <Badge className={getUrgencyColor(request.urgency_level)}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {request.urgency_level.charAt(0).toUpperCase() + request.urgency_level.slice(1)} Priority
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span className="font-medium">Organization:</span>
                <span>{request.organization_name || "No Organization"}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Type:</span>
                <Badge variant="outline">{request.request_type}</Badge>
              </div>

              {request.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location:</span>
                  <span>{request.location}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {request.deadline && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Deadline:</span>
                  <span>{formatDate(request.deadline)}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Posted:</span>
                <span>{formatDate(request.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {request.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {request.description}
              </p>
            </div>
          )}

          {/* Contact Information */}
          {(request.contact_email || request.contact_phone) && (
            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                {request.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${request.contact_email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.contact_email}
                    </a>
                  </div>
                )}
                {request.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${request.contact_phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {showMarkCompletedButton && (
            <Button
              onClick={handleMarkCompleted}
              disabled={isMarkingCompleted}
              className="w-full"
            >
              {isMarkingCompleted ? "Marking as Completed..." : "Mark as Completed"}
            </Button>
          )}

          {showActionButtons && (
            <div className="flex gap-2 w-full">
              <Button
                onClick={() => onApprove(request.id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
              <Button
                onClick={() => onReject(request.id)}
                variant="destructive"
                className="flex-1"
              >
                Reject
              </Button>
              <Button
                onClick={() => onRequestChanges(request.id)}
                variant="outline"
                className="flex-1"
              >
                Request Changes
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
