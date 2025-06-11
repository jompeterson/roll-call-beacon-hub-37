
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { ScholarshipInfo } from "./scholarship/ScholarshipInfo";
import { ScholarshipActionButtons } from "./scholarship/ScholarshipActionButtons";
import { ScholarshipApplyButton } from "./scholarship/ScholarshipApplyButton";
import { CommentsSection } from "./comments/CommentsSection";
import { ShareButton } from "./ShareButton";

type Scholarship = Tables<"scholarships"> & {
  creator?: {
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    type: string;
  };
};

interface ScholarshipModalProps {
  scholarship: Scholarship | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isRequestingChanges?: boolean;
  disableNavigation?: boolean;
}

export const ScholarshipModal = ({
  scholarship,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  isApproving = false,
  isRejecting = false,
  isRequestingChanges = false,
  disableNavigation = false,
}: ScholarshipModalProps) => {
  const { isAdministrator, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Update URL when modal opens - only if navigation is enabled and we're on the scholarships page
  useEffect(() => {
    if (disableNavigation) return;
    
    const isOnScholarshipsPage = location.pathname.startsWith('/scholarships');
    
    if (open && scholarship && isOnScholarshipsPage) {
      navigate(`/scholarships/${scholarship.id}`, { replace: true });
    } else if (!open && isOnScholarshipsPage) {
      navigate('/scholarships', { replace: true });
    }
  }, [open, scholarship, navigate, location.pathname, disableNavigation]);

  if (!scholarship) return null;

  const handleApprove = () => {
    onApprove(scholarship.id);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject(scholarship.id);
    onOpenChange(false);
  };

  const handleRequestChanges = () => {
    onRequestChanges(scholarship.id);
    onOpenChange(false);
  };

  const handleApplyToScholarship = () => {
    if (scholarship.scholarship_link) {
      window.open(scholarship.scholarship_link, '_blank', 'noopener,noreferrer');
    }
  };

  const showActionButtons = isAdministrator && !scholarship.approval_decision_made;
  const showApplyButton = scholarship.scholarship_link && 
                          scholarship.scholarship_link.trim() !== '' && 
                          scholarship.is_approved;

  // Show comments only for approved scholarships
  const showComments = scholarship.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[90vh]" : "h-[70vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${modalHeight} flex flex-col p-0`}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  {scholarship.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">Scholarships</p>
              </div>
              <ShareButton />
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            <ScholarshipInfo scholarship={scholarship} isAuthenticated={isAuthenticated} />

            {/* Comments Section - Only show for approved scholarships */}
            {showComments && (
              <CommentsSection
                contentType="scholarship"
                contentId={scholarship.id}
                title="Scholarship Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t">
          <DialogFooter className="flex flex-col gap-2 p-6">
            {showApplyButton && (
              <ScholarshipApplyButton
                scholarshipLink={scholarship.scholarship_link}
                onApply={handleApplyToScholarship}
              />
            )}

            {showActionButtons && (
              <ScholarshipActionButtons
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
                isApproving={isApproving}
                isRejecting={isRejecting}
                isRequestingChanges={isRequestingChanges}
              />
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
