import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDonations, type Donation } from "@/hooks/useDonations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Edit } from "lucide-react";
import { DonationModalCreatorInfo } from "@/components/donations/DonationModalCreatorInfo";
import { DonationModalInformation } from "@/components/donations/DonationModalInformation";
import { DonationModalImageSection } from "@/components/donations/DonationModalImageSection";
import { DonationModalActionButtons } from "@/components/donations/DonationModalActionButtons";
import { DonationEditModal } from "@/components/donations/DonationEditModal";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

export const DonationDetail = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const { data: donations = [], isLoading, deleteDonation, isDeletingDonation } = useDonations();

  const donation = donations.find(d => d.id === donationId);

  if (isLoading) {
    return (
      <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/donations">Donations</Link>
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
          <p>Loading donation details...</p>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/donations">Donations</Link>
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
            <p className="text-lg mb-4">Donation not found</p>
            <Button onClick={() => navigate('/donations')}>Back to Donations</Button>
          </div>
        </div>
      </div>
    );
  }

  const orgName = donation.organization_name || "Unknown Organization";

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInformationTitle = () => "Donation Information";
  const getDateLabel = () => "Posted on";
  const getOrganizationBio = () => "A leading organization dedicated to making a positive impact in the community.";
  const getUserBio = () => "An experienced administrator dedicated to supporting community initiatives.";

  const handleApprove = (id: string) => {
    console.log("Approved donation:", id);
  };

  const handleReject = (id: string) => {
    console.log("Rejected donation:", id);
  };

  const handleRequestChanges = (id: string) => {
    console.log("Requested changes for donation:", id);
  };

  const [editOpen, setEditOpen] = useState(false);

  const showComments = donation.is_approved;
  const canDelete = user && (user.id === donation.creator_user_id || isAdministrator);
  const canEdit = user && ((user.id === donation.creator_user_id && !donation.is_approved) || isAdministrator);

  const handleDelete = () => {
    deleteDonation(donation.id);
    navigate('/donations');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/donations">Donations</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{donation.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Content Card */}
      <div className="bg-card rounded-lg border">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{donation.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Give a Donation</p>
            </div>
            <ShareButton />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <DonationModalCreatorInfo
            creatorUserId={donation.creator_user_id}
            createdAt={donation.created_at}
            orgName={orgName}
            open={true}
            getDateLabel={getDateLabel}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DonationModalInformation
              donation={donation}
              getInformationTitle={getInformationTitle}
              getOrganizationBio={getOrganizationBio}
              getUserBio={getUserBio}
              formatAmount={formatAmount}
            />

            <DonationModalImageSection
              donation={donation}
              orgName={orgName}
            />
          </div>

          {/* Comments Section */}
          {showComments && (
            <CommentsSection
              contentType="donation"
              contentId={donation.id}
              title="Donation Discussion"
            />
          )}
        </div>

        {/* Footer with Action Buttons */}
        {isAuthenticated && (
          <div className="border-t p-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {canDelete && (
                  <DeleteConfirmDialog
                    title="Delete Donation"
                    description="Are you sure you want to delete this donation? This action cannot be undone."
                    onConfirm={handleDelete}
                    isDeleting={isDeletingDonation}
                  />
                )}
                {canEdit && (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <DonationModalActionButtons
                donationId={donation.id}
                creatorUserId={donation.creator_user_id}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
                onOpenChange={() => navigate('/donations')}
                approvalDecisionMade={donation.approval_decision_made}
                isApproved={donation.is_approved}
              />
            </div>
          </div>
        )}
      </div>
      {canEdit && (
        <DonationEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          donation={donation}
        />
      )}
    </div>
  );
};
