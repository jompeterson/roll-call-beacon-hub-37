import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useScholarships } from "@/hooks/useScholarships";
import { useAuth } from "@/hooks/useAuth";
import { useChangeRequest } from "@/hooks/useChangeRequest";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScholarshipInfo } from "@/components/scholarship/ScholarshipInfo";
import { ScholarshipActionButtons } from "@/components/scholarship/ScholarshipActionButtons";
import { ScholarshipApplyButton } from "@/components/scholarship/ScholarshipApplyButton";
import { ScholarshipEditModal } from "@/components/scholarship/ScholarshipEditModal";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ChangeRequestBanner } from "@/components/shared/ChangeRequestBanner";

export const ScholarshipDetail = () => {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const { 
    scholarships,
    isLoading,
    approveScholarship,
    rejectScholarship,
    requestChanges,
    deleteScholarship,
    isApproving,
    isRejecting,
    isRequestingChanges,
    isDeleting
  } = useScholarships();
  const [editOpen, setEditOpen] = useState(false);
  const { changeRequest, refetch: refetchChangeRequest } = useChangeRequest("scholarship", scholarshipId || "");

  const scholarship = scholarships.find(s => s.id === scholarshipId);
  const isOwner = user?.id === scholarship?.creator_user_id;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/scholarships">Scholarships</Link>
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
          <p>Loading scholarship details...</p>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/scholarships">Scholarships</Link>
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
            <p className="text-lg mb-4">Scholarship not found</p>
            <button
              onClick={() => navigate('/scholarships')}
              className="text-primary hover:underline"
            >
              Back to Scholarships
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveScholarship(scholarship.id);
    navigate('/scholarships');
  };

  const handleReject = () => {
    rejectScholarship(scholarship.id);
    navigate('/scholarships');
  };

  const handleRequestChanges = () => {
    requestChanges(scholarship.id);
    navigate('/scholarships');
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
  const showComments = scholarship.is_approved;
  const canDelete = user && (user.id === scholarship.creator_user_id || isAdministrator);
  const canEdit = user && ((user.id === scholarship.creator_user_id && !scholarship.is_approved) || isAdministrator);

  const handleDelete = () => {
    deleteScholarship(scholarship.id);
    navigate('/scholarships');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/scholarships">Scholarships</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{scholarship.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold">{scholarship.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Scholarships</p>
            </div>
            <ShareButton />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Change Request Banner */}
          {changeRequest && isOwner && (
            <ChangeRequestBanner
              comment={changeRequest.comment}
              fieldLabels={changeRequest.fieldLabels}
            />
          )}

          {/* Image Carousel */}
          {scholarship.images && scholarship.images.length > 0 && (
            <ImageCarousel images={scholarship.images} title={scholarship.title} />
          )}
          
          <ScholarshipInfo scholarship={scholarship} isAuthenticated={isAuthenticated} highlightedFields={isOwner && changeRequest ? changeRequest.fieldKeys : undefined} />

          {/* Comments Section */}
          {showComments && (
            <CommentsSection
              contentType="scholarship"
              contentId={scholarship.id}
              title="Scholarship Discussion"
            />
          )}
        </div>

        {/* Footer with Action Buttons */}
        {(showApplyButton || showActionButtons || canDelete) && (
          <div className="border-t p-6 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {canDelete && (
                  <DeleteConfirmDialog
                    title="Delete Scholarship"
                    description="Are you sure you want to delete this scholarship? This action cannot be undone."
                    onConfirm={handleDelete}
                    isDeleting={isDeleting}
                  />
                )}
                {canEdit && (
                  <Button variant="outline" onClick={() => setEditOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {showApplyButton && (
                  <ScholarshipApplyButton
                    scholarshipLink={scholarship.scholarship_link}
                    onApply={handleApplyToScholarship}
                  />
                )}
              </div>
            </div>

            {showActionButtons && (
              <ScholarshipActionButtons
                scholarshipId={scholarship.id}
                onApprove={handleApprove}
                onReject={handleReject}
                onRequestChanges={handleRequestChanges}
                creatorUserId={scholarship.creator_user_id}
                isApproving={isApproving}
                isRejecting={isRejecting}
                isRequestingChanges={isRequestingChanges}
              />
            )}
          </div>
        )}
      </div>
      {canEdit && (
        <ScholarshipEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          scholarship={scholarship}
          hasChangeRequest={!!changeRequest}
          onScholarshipUpdated={refetchChangeRequest}
        />
      )}
    </div>
  );
};
