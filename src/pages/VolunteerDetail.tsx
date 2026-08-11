import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useAuth } from "@/hooks/useAuth";
import { useVolunteerSignups } from "@/hooks/useVolunteerSignups";
import { useChangeRequest } from "@/hooks/useChangeRequest";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Calendar, MapPin, Users, CheckCircle, XCircle, Edit, Flag, Lock, UserCheck } from "lucide-react";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { ImageCarousel } from "@/components/shared/ImageCarousel";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { VolunteerEditModal } from "@/components/volunteer/VolunteerEditModal";
import { EndOpportunityModal } from "@/components/volunteer/EndOpportunityModal";
import { ChangeRequestBanner } from "@/components/shared/ChangeRequestBanner";
import { formatDate, cn } from "@/lib/utils";
import { canViewPost } from "@/lib/postVisibility";
import { RichText } from "@/components/ui/rich-text";

export const VolunteerDetail = () => {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const { 
    volunteers,
    loading,
    approveVolunteer,
    rejectVolunteer,
    deleteVolunteer
  } = useVolunteers();
  const { signupCount, hasSignedUp, submitting, signUp, cancelSignup, userSignup } = useVolunteerSignups(volunteerId || "");
  const [editOpen, setEditOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const queryClient = useQueryClient();
  const { changeRequest, refetch: refetchChangeRequest } = useChangeRequest("volunteer", volunteerId || "");

  const volunteer = volunteers.find(v => v.id === volunteerId);
  const isOwner = user?.id === volunteer?.creator_user_id;
  const canView = !volunteer || canViewPost(volunteer, user?.id, isAdministrator);

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/volunteers">Volunteer Opportunities</Link>
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
          <p>Loading volunteer opportunity details...</p>
        </div>
      </div>
    );
  }

  if (!volunteer || !canView) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/volunteers">Volunteer Opportunities</Link>
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
            <p className="text-lg mb-4">Volunteer opportunity not found</p>
            <button
              onClick={() => navigate('/volunteers')}
              className="text-primary hover:underline"
            >
              Back to Volunteer Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSignupAction = () => {
    if (hasSignedUp && userSignup) {
      cancelSignup(userSignup.id);
    } else {
      signUp();
    }
  };

  const handleApprove = () => {
    approveVolunteer(volunteer.id);
    navigate('/volunteers');
  };

  const handleReject = () => {
    rejectVolunteer(volunteer.id);
    navigate('/volunteers');
  };

  const getStatusBadge = () => {
    if (!volunteer.approval_decision_made) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Approval</Badge>;
    }
    if (volunteer.is_approved) {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
    }
    return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
  };

  const showComments = volunteer.is_approved;
  const isVolunteerFull = volunteer.max_participants && signupCount >= volunteer.max_participants;
  const canDelete = user && (isAdministrator || (user.id === volunteer.creator_user_id && !volunteer.is_approved));
  const canEdit = user && ((user.id === volunteer.creator_user_id && !volunteer.is_approved) || isAdministrator);
  const hasPassed = new Date(volunteer.end_date || volunteer.start_date) < new Date();
  const canEndOpportunity = !!user && volunteer.is_approved && hasPassed && !volunteer.is_ended && (isOwner || isAdministrator);

  const handleDelete = () => {
    deleteVolunteer(volunteer.id);
    navigate('/volunteers');
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/volunteers">Volunteer Opportunities</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{volunteer.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold">{volunteer.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Volunteer Opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              {volunteer.is_approved && !isVolunteerFull && isAuthenticated && (
                <Button
                  onClick={handleSignupAction}
                  disabled={submitting}
                  variant={hasSignedUp ? "outline" : "default"}
                  size="sm"
                >
                  {submitting ? (
                    "Processing..."
                  ) : hasSignedUp ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Remove Interest
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Show Interest
                    </>
                  )}
                </Button>
              )}
              <ShareButton />
            </div>
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

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {volunteer.is_private && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 gap-1">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            )}
            {isVolunteerFull && (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                Full
              </Badge>
            )}
          </div>

          {/* Image Carousel */}
          {volunteer.images && volunteer.images.length > 0 && (
            <ImageCarousel images={volunteer.images} title={volunteer.title} />
          )}

          {/* Volunteer Information */}
          <div className="space-y-4">
            {volunteer.description && (
              <div className={cn(isOwner && changeRequest?.fieldKeys.includes("description") && "bg-destructive/10 border border-destructive/30 rounded-md p-2")}>
                <h3 className={cn("font-semibold mb-2", isOwner && changeRequest?.fieldKeys.includes("description") && "text-destructive")}>Description</h3>
                <RichText value={volunteer.description} className="text-muted-foreground" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={cn("flex items-start gap-2", isOwner && changeRequest?.fieldKeys.includes("start_date") && "bg-destructive/10 border border-destructive/30 rounded-md p-2")}>
                <Calendar className={cn("h-5 w-5 mt-0.5", isOwner && changeRequest?.fieldKeys.includes("start_date") ? "text-destructive" : "text-muted-foreground")} />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <div className="text-sm text-muted-foreground">
                    <div>Start: {formatDate(volunteer.start_date, { includeTime: true })}</div>
                    {volunteer.end_date && <div>End: {formatDate(volunteer.end_date, { includeTime: true })}</div>}
                  </div>
                </div>
              </div>

              {volunteer.location && (
                <div className={cn("flex items-start gap-2", isOwner && changeRequest?.fieldKeys.includes("location") && "bg-destructive/10 border border-destructive/30 rounded-md p-2")}>
                  <MapPin className={cn("h-5 w-5 mt-0.5", isOwner && changeRequest?.fieldKeys.includes("location") ? "text-destructive" : "text-muted-foreground")} />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{volunteer.location}</p>
                  </div>
                </div>
              )}

              {volunteer.volunteer_link && (
                <div className={cn("flex items-start gap-2", isOwner && changeRequest?.fieldKeys.includes("volunteer_link") && "bg-destructive/10 border border-destructive/30 rounded-md p-2")}>
                  <div>
                    <p className="font-medium">Link</p>
                    <a 
                      href={volunteer.volunteer_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Visit Volunteer Page
                    </a>
                  </div>
                </div>
              )}

              {volunteer.max_participants && (
                <div className={cn("flex items-start gap-2", isOwner && changeRequest?.fieldKeys.includes("max_participants") && "bg-destructive/10 border border-destructive/30 rounded-md p-2")}>
                  <Users className={cn("h-5 w-5 mt-0.5", isOwner && changeRequest?.fieldKeys.includes("max_participants") ? "text-destructive" : "text-muted-foreground")} />
                  <div>
                    <p className="font-medium">Participants</p>
                    <p className="text-sm text-muted-foreground">
                      {signupCount} / {volunteer.max_participants} interested
                    </p>
                  </div>
                </div>
              )}

              {volunteer.organization_name && (
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Organization</p>
                    <p className="text-sm text-muted-foreground">
                      Posted by: {volunteer.organization_name}
                    </p>
                  </div>
                </div>
              )}

              {volunteer.helping_organization_name && (
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Organization Helping</p>
                    <p className="text-muted-foreground">{volunteer.helping_organization_name}</p>
                  </div>
                </div>
              )}

              {(volunteer.interested_organizations?.length ?? 0) > 0 && (
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Interested Organizations</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {volunteer.interested_organizations!.map((org) => (
                        <Badge key={org} variant="secondary">{org}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {volunteer.is_ended && (volunteer.accomplishments || volunteer.total_hours != null || volunteer.discounted_services_value != null || (volunteer.completion_images?.length ?? 0) > 0) && (
              <div className="rounded-md border bg-muted/40 p-4">
                <h3 className="font-semibold mb-2">Accomplishments</h3>
                {volunteer.total_hours != null && (
                  <p className="mb-1 text-sm">
                    <span className="font-medium">Total hours volunteered:</span>{" "}
                    {Number(volunteer.total_hours).toLocaleString()}
                  </p>
                )}
                {volunteer.discounted_services_value != null && (
                  <p className="mb-3 text-sm">
                    <span className="font-medium">Discounted professional services:</span>{" "}
                    {Number(volunteer.discounted_services_value).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                )}
                {volunteer.accomplishments && (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {volunteer.accomplishments.split("\n").filter(Boolean).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {(volunteer.completion_images?.length ?? 0) > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {volunteer.completion_images!.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={url}
                          alt={`Photo ${i + 1} from ${volunteer.title}`}
                          loading="lazy"
                          className="aspect-square w-full rounded-md border object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <CommentsSection
              contentType="volunteer"
              contentId={volunteer.id}
              title="Volunteer Discussion"
            />
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="px-6 py-4 border-t bg-card">
          <div className="flex justify-between items-center gap-2">
            <div className="flex gap-2">
              {canDelete && (
                <DeleteConfirmDialog
                  title="Delete Volunteer Opportunity"
                  description="Are you sure you want to delete this volunteer opportunity? This action cannot be undone."
                  onConfirm={handleDelete}
                />
              )}
              {canEdit && (
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canEndOpportunity && (
                <Button variant="outline" onClick={() => setEndOpen(true)}>
                  <Flag className="w-4 h-4 mr-2" />
                  End Opportunity
                </Button>
              )}
              {volunteer.is_ended && (isOwner || isAdministrator) && (
                <Badge variant="outline" className="self-center bg-gray-100 text-gray-800 border-gray-300">
                  Ended
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {isAdministrator && !volunteer.approval_decision_made && (
                <>
                  <Button
                    onClick={handleApprove}
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </>
              )}

              {volunteer.is_approved && !isVolunteerFull && isAuthenticated && (
                <Button
                  onClick={handleSignupAction}
                  disabled={submitting}
                  variant={hasSignedUp ? "outline" : "default"}
                >
                  {submitting ? (
                    "Processing..."
                  ) : hasSignedUp ? (
                    "Remove Interest"
                  ) : (
                    "Show Interest"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {canEndOpportunity && (
        <EndOpportunityModal
          open={endOpen}
          onOpenChange={setEndOpen}
          volunteerId={volunteer.id}
          volunteerTitle={volunteer.title}
          onEnded={() => queryClient.invalidateQueries({ queryKey: ["volunteers"] })}
        />
      )}
      {canEdit && (
        <VolunteerEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          volunteer={volunteer}
          hasChangeRequest={!!changeRequest}
          onVolunteerUpdated={refetchChangeRequest}
        />
      )}
    </div>
  );
};
