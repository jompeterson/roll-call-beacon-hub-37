import { useParams, useNavigate, Link } from "react-router-dom";
import { useDonations, type Donation } from "@/hooks/useDonations";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { DonationModalCreatorInfo } from "@/components/donations/DonationModalCreatorInfo";
import { DonationModalInformation } from "@/components/donations/DonationModalInformation";
import { DonationModalImageSection } from "@/components/donations/DonationModalImageSection";
import { DonationModalActionButtons } from "@/components/donations/DonationModalActionButtons";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";

export const DonationDetail = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: donations = [], isLoading } = useDonations();

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

  const showComments = donation.is_approved;

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

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100vh-280px)]">
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
        </ScrollArea>

        {/* Footer with Action Buttons */}
        {isAuthenticated && (
          <div className="border-t">
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
        )}
      </div>
    </div>
  );
};
