
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { RequestModalHeader } from "./request/RequestModalHeader";
import { RequestModalCreatorInfo } from "./request/RequestModalCreatorInfo";
import { RequestModalInformation } from "./request/RequestModalInformation";
import { RequestModalImageSection } from "./request/RequestModalImageSection";
import { RequestModalActionButtons } from "./request/RequestModalActionButtons";
import { useAuth } from "@/hooks/useAuth";
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

interface CreatorInfo {
  name: string;
  email: string;
  organization: string;
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: "Loading...",
    email: "Loading...",
    organization: "Loading..."
  });

  // Update URL when modal opens - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && request) {
      navigate(`/requests/${request.id}`, { replace: true });
    } else if (!disableNavigation && !open) {
      navigate('/donations', { replace: true });
    }
  }, [open, request, navigate, disableNavigation]);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!request?.creator_user_id) return;

      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select(`
            first_name,
            last_name,
            email,
            organizations:organization_id (
              name
            )
          `)
          .eq("id", request.creator_user_id)
          .single();

        if (error) {
          console.error("Error fetching creator info:", error);
          setCreatorInfo({
            name: "Unknown User",
            email: "unknown@example.com",
            organization: request.organization_name || "Unknown Organization"
          });
          return;
        }

        if (profile) {
          setCreatorInfo({
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            organization: (profile.organizations as any)?.name || request.organization_name || "Unknown Organization"
          });
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
        setCreatorInfo({
          name: "Unknown User",
          email: "unknown@example.com",
          organization: request.organization_name || "Unknown Organization"
        });
      }
    };

    if (open && request) {
      fetchCreatorInfo();
    }
  }, [request, open]);

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
              creatorInfo={creatorInfo}
              createdAt={request.created_at}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <RequestModalInformation request={request} />
              <RequestModalImageSection title={request.title} />
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

        {/* Only show action buttons if user is authenticated and handlers are provided */}
        {isAuthenticated && (onApprove || onReject || onRequestChanges || onMarkCompleted) && (
          <RequestModalActionButtons
            request={request}
            onApprove={onApprove || (() => {})}
            onReject={onReject || (() => {})}
            onRequestChanges={onRequestChanges || (() => {})}
            onMarkCompleted={onMarkCompleted}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
