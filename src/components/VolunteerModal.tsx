
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVolunteerSignups } from "@/hooks/useVolunteerSignups";
import { CommentsSection } from "@/components/comments/CommentsSection";

interface Volunteer {
  id: string;
  title: string;
  description: string | null;
  volunteer_date: string;
  location: string | null;
  max_participants: number | null;
  creator_user_id: string;
  is_approved: boolean;
  approval_decision_made: boolean;
  created_at: string;
  updated_at: string;
}

interface VolunteerModalProps {
  volunteer: Volunteer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  onOpenGuestSignupModal?: () => void;
  disableNavigation?: boolean;
}

export const VolunteerModal = ({
  volunteer,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onRequestChanges,
  onOpenGuestSignupModal,
  disableNavigation = false,
}: VolunteerModalProps) => {
  const { isAdministrator, isAuthenticated } = useAuth();
  const { signupCount, hasSignedUp, submitting, signUp, cancelSignup, userSignup } = useVolunteerSignups(volunteer?.id || "");
  const navigate = useNavigate();

  // Update URL when modal opens - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && volunteer) {
      navigate(`/volunteers/${volunteer.id}`, { replace: true });
    } else if (!disableNavigation && !open) {
      navigate('/volunteers', { replace: true });
    }
  }, [open, volunteer, navigate, disableNavigation]);

  if (!volunteer) return null;

  const handleSignupAction = () => {
    if (isAuthenticated) {
      // For authenticated users, toggle signup directly
      if (hasSignedUp && userSignup) {
        cancelSignup(userSignup.id);
      } else {
        signUp();
      }
    } else {
      // For guests, open the guest signup modal
      if (onOpenGuestSignupModal) {
        onOpenGuestSignupModal();
      }
    }
  };

  // Show comments only for approved volunteers
  const showComments = volunteer.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[80vh]" : "h-[60vh]";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl ${modalHeight} flex flex-col p-0`}>
        {/* Fixed Header */}
        <div className="px-6 py-4 border-b bg-card space-y-2">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold text-foreground pr-8">{volunteer.title}</h2>
            {getStatusBadge()}
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Volunteer Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(volunteer.volunteer_date)}</span>
              </div>

              {volunteer.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{volunteer.location}</span>
                </div>
              )}

              {volunteer.max_participants && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Maximum {volunteer.max_participants} participants</span>
                </div>
              )}

              {volunteer.is_approved && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{signupCount} {signupCount === 1 ? 'volunteer signed up' : 'volunteers signed up'}</span>
                </div>
              )}

              {volunteer.description && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{volunteer.description}</p>
                </div>
              )}
            </div>

            {/* Signup Status for authenticated users */}
            {isAuthenticated && volunteer.is_approved && hasSignedUp && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You have signed up for this volunteer opportunity</span>
                </div>
              </div>
            )}

            {/* Comments Section - Only show for approved volunteers */}
            {showComments && (
              <CommentsSection
                contentType="volunteer"
                contentId={volunteer.id}
                title="Volunteer Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Fixed Footer - Only show action buttons if handlers are provided */}
        {(onApprove || onReject || onRequestChanges) && (
          <div className="px-6 py-4 border-t bg-card flex gap-2">
            {isAdministrator && !volunteer.approval_decision_made && (
              <>
                <Button
                  onClick={() => onApprove(volunteer.id)}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => onReject(volunteer.id)}
                  className="flex-1"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {volunteer.is_approved && (
              <Button
                onClick={handleSignupAction}
                disabled={submitting}
                className="flex-1"
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
        )}
      </DialogContent>
    </Dialog>
  );
};
