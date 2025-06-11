
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { ScholarshipInfo } from "./scholarship/ScholarshipInfo";
import { ScholarshipActionButtons } from "./scholarship/ScholarshipActionButtons";
import { ScholarshipApplyButton } from "./scholarship/ScholarshipApplyButton";
import { CommentsSection } from "./comments/CommentsSection";

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
}: ScholarshipModalProps) => {
  const { isAdministrator, isAuthenticated } = useAuth();

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {scholarship.title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">Scholarships</p>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            <ScholarshipInfo scholarship={scholarship} isAuthenticated={isAuthenticated} />

            {/* Comments Section - Only show for approved scholarships */}
            {scholarship.is_approved && (
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
