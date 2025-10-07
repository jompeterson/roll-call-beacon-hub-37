
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Donation } from "@/hooks/useDonations";
import { DonationModalCreatorInfo } from "./donations/DonationModalCreatorInfo";
import { DonationModalInformation } from "./donations/DonationModalInformation";
import { DonationModalImageSection } from "./donations/DonationModalImageSection";
import { DonationModalActionButtons } from "./donations/DonationModalActionButtons";
import { DonationEditModal } from "./donations/DonationEditModal";
import { CommentsSection } from "./comments/CommentsSection";
import { ShareButton } from "./ShareButton";

interface DonationModalProps {
  donation: Donation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  isScholarship?: boolean;
  isEvent?: boolean;
  isOrganization?: boolean;
  isUser?: boolean;
  disableNavigation?: boolean;
}

export const DonationModal = ({ 
  donation, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges,
  isScholarship = false,
  isEvent = false,
  isOrganization = false,
  isUser = false,
  disableNavigation = false
}: DonationModalProps) => {
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Update URL when modal opens, but don't navigate back when closing - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && donation) {
      navigate(`/donations/${donation.id}`, { replace: true });
    }
  }, [open, donation, navigate, disableNavigation]);

  // Handle modal close by navigating back to donations page - only if navigation is enabled
  const handleOpenChange = (newOpen: boolean) => {
    if (!disableNavigation && !newOpen) {
      navigate('/donations', { replace: true });
    }
    onOpenChange(newOpen);
  };

  if (!donation) return null;

  const orgName = donation.organization_name || "Unknown Organization";

  // Format amount for display
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getModalType = () => {
    if (isUser) return `Administrator • ${orgName}`;
    if (isOrganization) return "Business";
    if (isEvent) return "Event - Community Engagement";
    if (isScholarship) return "Scholarship";
    return "Give a Donation";
  };

  const getInformationTitle = () => {
    if (isUser) return "User Information";
    if (isOrganization) return "Organization Information";
    if (isEvent) return "Event Information";
    if (isScholarship) return "Scholarship Information";
    return "Donation Information";
  };

  const getDateLabel = () => {
    if (isUser) return "Joined on";
    if (isOrganization) return "Created on";
    return "Posted on";
  };

  const getOrganizationBio = () => {
    return "A leading organization dedicated to making a positive impact in the community through innovative solutions and collaborative partnerships.";
  };

  const getUserBio = () => {
    return "An experienced administrator dedicated to supporting community initiatives and driving positive change through effective organizational management.";
  };

  const getModalTitle = () => {
    if (isUser) return donation.title; // Full name
    if (isOrganization) return orgName;
    return donation.title;
  };

  const getCommentsContentType = () => {
    if (isScholarship) return 'scholarship' as const;
    return 'donation' as const;
  };

  // Show comments only for approved donations/scholarships
  const showComments = donation.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[80vh]" : "h-[60vh]";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`max-w-5xl w-full ${modalHeight} flex flex-col p-0`}>
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-6 border-b">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">{getModalTitle()}</DialogTitle>
                <p className="text-sm text-muted-foreground">{getModalType()}</p>
              </div>
              <ShareButton />
            </div>
          </DialogHeader>
        </div>
        
        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <DonationModalCreatorInfo
              creatorUserId={donation.creator_user_id}
              createdAt={donation.created_at}
              orgName={orgName}
              open={open}
              isUser={isUser}
              getDateLabel={getDateLabel}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <DonationModalInformation
                donation={donation}
                isScholarship={isScholarship}
                isEvent={isEvent}
                isOrganization={isOrganization}
                isUser={isUser}
                getInformationTitle={getInformationTitle}
                getOrganizationBio={getOrganizationBio}
                getUserBio={getUserBio}
                formatAmount={formatAmount}
              />

              <DonationModalImageSection
                donation={donation}
                orgName={orgName}
                isOrganization={isOrganization}
                isUser={isUser}
              />
            </div>

            {/* Comments Section - Only show for approved donations/scholarships */}
            {showComments && (
              <CommentsSection
                contentType={getCommentsContentType()}
                contentId={donation.id}
                title={isScholarship ? "Scholarship Discussion" : "Donation Discussion"}
              />
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer - Only show action buttons if handlers are provided */}
        {(onApprove || onReject || onRequestChanges) && (
          <div className="flex-shrink-0 border-t">
            <DonationModalActionButtons
              donationId={donation.id}
              creatorUserId={donation.creator_user_id}
              onApprove={onApprove || (() => {})}
              onReject={onReject || (() => {})}
              onRequestChanges={onRequestChanges || (() => {})}
              onOpenChange={onOpenChange}
              onEdit={() => setEditModalOpen(true)}
              isUser={isUser}
              approvalDecisionMade={donation.approval_decision_made}
              isApproved={donation.is_approved}
            />
          </div>
        )}
      </DialogContent>

      <DonationEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        donation={donation}
        onDonationUpdated={() => {
          setEditModalOpen(false);
          window.location.reload();
        }}
      />
    </Dialog>
  );
};
