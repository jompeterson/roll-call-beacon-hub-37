
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Donation } from "@/hooks/useDonations";
import { DonationModalCreatorInfo } from "./donations/DonationModalCreatorInfo";
import { DonationModalInformation } from "./donations/DonationModalInformation";
import { DonationModalImageSection } from "./donations/DonationModalImageSection";
import { DonationModalActionButtons } from "./donations/DonationModalActionButtons";

interface DonationModalProps {
  donation: Donation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isScholarship?: boolean;
  isEvent?: boolean;
  isOrganization?: boolean;
  isUser?: boolean;
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
  isUser = false
}: DonationModalProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getModalTitle()}</DialogTitle>
          <p className="text-sm text-muted-foreground">{getModalType()}</p>
        </DialogHeader>
        
        <DonationModalCreatorInfo
          creatorUserId={donation.creator_user_id}
          createdAt={donation.created_at}
          orgName={orgName}
          open={open}
          isUser={isUser}
          getDateLabel={getDateLabel}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
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

        <DonationModalActionButtons
          donationId={donation.id}
          onApprove={onApprove}
          onReject={onReject}
          onRequestChanges={onRequestChanges}
          isUser={isUser}
          approvalDecisionMade={donation.approval_decision_made}
          isApproved={donation.is_approved}
        />
      </DialogContent>
    </Dialog>
  );
};
