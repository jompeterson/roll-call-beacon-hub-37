import { useParams, useNavigate, Link } from "react-router-dom";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useAuth } from "@/hooks/useAuth";
import { useVolunteerSignups } from "@/hooks/useVolunteerSignups";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ChevronRight, Calendar, MapPin, Users, CheckCircle, XCircle, Edit } from "lucide-react";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { ShareButton } from "@/components/ShareButton";
import { ImageCarousel } from "@/components/shared/ImageCarousel";

export const VolunteerDetail = () => {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdministrator } = useAuth();
  const { 
    volunteers,
    loading,
    approveVolunteer,
    rejectVolunteer
  } = useVolunteers();
  const { signupCount, hasSignedUp, submitting, signUp, cancelSignup, userSignup } = useVolunteerSignups(volunteerId || "");

  const volunteer = volunteers.find(v => v.id === volunteerId);

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/volunteers">Volunteers</Link>
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

  if (!volunteer) {
    return (
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/volunteers">Volunteers</Link>
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
              Back to Volunteers
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/volunteers">Volunteers</Link>
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
            <ShareButton />
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {getStatusBadge()}
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
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{volunteer.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">{formatDate(volunteer.volunteer_date)}</p>
                  </div>
                </div>

                {volunteer.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{volunteer.location}</p>
                    </div>
                  </div>
                )}

                {volunteer.max_participants && (
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-muted-foreground">
                        {signupCount} / {volunteer.max_participants} signed up
                      </p>
                    </div>
                  </div>
                )}
              </div>
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
        </ScrollArea>

        {/* Footer with Action Buttons */}
        <div className="px-6 py-4 border-t bg-card">
          <div className="flex justify-between items-center gap-2">
            <div>
              {/* Edit button will be added by the action buttons component */}
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
                    "Cancel Signup"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
