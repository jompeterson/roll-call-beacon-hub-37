
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { RequestModalHeader } from "./request/RequestModalHeader";
import { RequestModalCreatorInfo } from "./request/RequestModalCreatorInfo";
import { RequestModalInformation } from "./request/RequestModalInformation";
import { RequestModalImageSection } from "./request/RequestModalImageSection";
import { RequestModalActionButtons } from "./request/RequestModalActionButtons";
import { RequestEditModal } from "./donations/RequestEditModal";
import type { Request } from "@/hooks/useRequests";

interface RequestModalProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
  disableNavigation?: boolean;
}

export const RequestModal = ({ 
  request, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges,
  onMarkCompleted,
  disableNavigation = false
}: RequestModalProps) => {
  const { user, isAdministrator } = useAuth();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  
  const isOwner = user?.id === request?.creator_user_id;
  const canEdit = isOwner || isAdministrator;

  // Update URL when modal opens - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && request) {
      navigate(`/requests/${request.id}`, { replace: true });
    } else if (!disableNavigation && !open) {
      navigate('/donations', { replace: true });
    }
  }, [open, request, navigate, disableNavigation]);

  if (!request) return null;

  // Show comments only for approved requests
  const showComments = request.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[80vh]" : "h-[60vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl w-full ${modalHeight} flex flex-col p-0`}>
        <RequestModalHeader title={request.title} />
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <RequestModalCreatorInfo
              creatorUserId={request.creator_user_id}
              organizationName={request.organization_name}
              open={open}
              createdAt={request.created_at}
            />
            
            <div className={request.images?.length ? "grid grid-cols-1 lg:grid-cols-2 gap-3" : "space-y-3"}>
              <RequestModalInformation request={request} />
              <RequestModalImageSection title={request.title} images={request.images || []} />
            </div>

            {/* Comments Section - Only show for approved requests */}
            {showComments && (
              <CommentsSection
                contentType="request"
                contentId={request.id}
                title="Request Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Show action buttons if handlers are provided OR if user can edit */}
        {(onApprove || onReject || onRequestChanges || onMarkCompleted || canEdit) && (
          <RequestModalActionButtons
            request={request}
            onApprove={onApprove || (() => {})}
            onReject={onReject || (() => {})}
            onRequestChanges={onRequestChanges || (() => {})}
            onMarkCompleted={onMarkCompleted}
            onEdit={() => setEditModalOpen(true)}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>

      <RequestEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        request={request}
        onRequestUpdated={() => {
          setEditModalOpen(false);
          window.location.reload();
        }}
      />
    </Dialog>
  );
};
