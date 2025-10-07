
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Request } from "@/hooks/useRequests";

interface RequestModalActionButtonsProps {
  request: Request;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  onEdit?: () => void;
  onOpenChange: (open: boolean) => void;
}

export const RequestModalActionButtons = ({
  request,
  onApprove,
  onReject,
  onRequestChanges,
  onMarkCompleted,
  onEdit,
  onOpenChange,
}: RequestModalActionButtonsProps) => {
  const { user, isAdministrator } = useAuth();
  const isOwner = user?.id === request.creator_user_id;
  const canEdit = isOwner || isAdministrator;
  
  console.log('RequestActionButtons - Debug:', { 
    userId: user?.id, 
    creatorUserId: request.creator_user_id, 
    isOwner, 
    isAdministrator, 
    canEdit,
    hasOnEdit: !!onEdit 
  });
  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_approved: true,
          approval_decision_made: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error approving request:", error);
        return;
      }

      console.log("Request approved successfully");
      onApprove(id);
      onOpenChange(false); // Navigate back after approval
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_approved: false,
          approval_decision_made: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error rejecting request:", error);
        return;
      }

      console.log("Request rejected successfully");
      onReject(id);
      onOpenChange(false); // Navigate back after rejection
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleFulfillRequest = () => {
    console.log("Fulfilling request:", request.id);
    // Add your fulfill request logic here
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_completed: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error marking request as completed:", error);
        return;
      }

      console.log("Request marked as completed successfully");
      onMarkCompleted && onMarkCompleted(id);
      onOpenChange(false); // Close the modal
    } catch (error) {
      console.error("Error marking request as completed:", error);
    }
  };

  // Check if the "Mark Completed" button should be shown
  const shouldShowMarkCompleted = request.is_approved && !request.is_completed;

  // Determine which buttons to show based on approval status
  const renderActionButtons = () => {
    if (request.approval_decision_made) {
      if (request.is_approved) {
        return (
          <div className="flex gap-3 flex-wrap">
            <Button 
              onClick={handleFulfillRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Fulfill Request
            </Button>
            {shouldShowMarkCompleted && (
              <Button 
                onClick={() => handleMarkCompleted(request.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark Completed
              </Button>
            )}
          </div>
        );
      }
      // If rejected, show no buttons
      return null;
    }

    // Show approval buttons if no decision has been made yet
    return (
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={() => handleApprove(request.id)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Approve
        </Button>
        <Button 
          onClick={() => handleReject(request.id)}
          variant="destructive"
        >
          Reject
        </Button>
        <Button 
          onClick={() => onRequestChanges(request.id)}
          variant="outline"
        >
          Request Changes
        </Button>
      </div>
    );
  };

  return (
    <div className="flex-shrink-0 border-t p-6 flex justify-between flex-wrap">
      <div>
        {canEdit && onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      <div>
        {renderActionButtons()}
      </div>
    </div>
  );
};
