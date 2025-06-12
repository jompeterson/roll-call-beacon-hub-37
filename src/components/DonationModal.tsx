
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { DonationModalCreatorInfo } from "./donations/DonationModalCreatorInfo";
import { DonationModalInformation } from "./donations/DonationModalInformation";
import { DonationModalImageSection } from "./donations/DonationModalImageSection";
import { DonationModalActionButtons } from "./donations/DonationModalActionButtons";
import { useAuth } from "@/hooks/useAuth";
import type { Donation } from "@/hooks/useDonations";

interface DonationModalProps {
  donation: Donation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onRequestChanges?: (id: string) => void;
  disableNavigation?: boolean;
}

interface CreatorInfo {
  name: string;
  email: string;
  organization: string;
}

export const DonationModal = ({ 
  donation, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges,
  disableNavigation = false
}: DonationModalProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: "Loading...",
    email: "Loading...",
    organization: "Loading..."
  });

  // Update URL when modal opens - only if navigation is enabled
  useEffect(() => {
    if (!disableNavigation && open && donation) {
      navigate(`/donations/${donation.id}`, { replace: true });
    } else if (!disableNavigation && !open) {
      navigate('/donations', { replace: true });
    }
  }, [open, donation, navigate, disableNavigation]);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!donation?.creator_user_id) return;

      try {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select(`
            first_name,
            last_name,
            email,
            organizations:organization_id (
              name
            )
          `)
          .eq("id", donation.creator_user_id)
          .single();

        if (error) {
          console.error("Error fetching creator info:", error);
          setCreatorInfo({
            name: "Unknown User",
            email: "unknown@example.com",
            organization: donation.organization_name || "Unknown Organization"
          });
          return;
        }

        if (profile) {
          setCreatorInfo({
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            organization: (profile.organizations as any)?.name || donation.organization_name || "Unknown Organization"
          });
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
        setCreatorInfo({
          name: "Unknown User",
          email: "unknown@example.com",
          organization: donation.organization_name || "Unknown Organization"
        });
      }
    };

    if (open && donation) {
      fetchCreatorInfo();
    }
  }, [donation, open]);

  if (!donation) return null;

  // Show comments only for approved donations
  const showComments = donation.is_approved;
  // Use smaller height when comments aren't shown
  const modalHeight = showComments ? "h-[80vh]" : "h-[60vh]";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-5xl w-full ${modalHeight} flex flex-col p-0`}>
        <div className="flex-shrink-0 px-6 py-4 border-b">
          <h2 className="text-2xl font-bold">{donation.title}</h2>
        </div>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            <DonationModalCreatorInfo
              creatorInfo={creatorInfo}
              createdAt={donation.created_at}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <DonationModalInformation donation={donation} />
              <DonationModalImageSection title={donation.title} />
            </div>

            {/* Comments Section - Only show for approved donations */}
            {showComments && (
              <CommentsSection
                contentType="donation"
                contentId={donation.id}
                title="Donation Discussion"
              />
            )}
          </div>
        </ScrollArea>

        {/* Only show action buttons if user is authenticated and handlers are provided */}
        {isAuthenticated && (onApprove || onReject || onRequestChanges) && (
          <DonationModalActionButtons
            donationId={donation.id}
            onApprove={onApprove || (() => {})}
            onReject={onReject || (() => {})}
            onRequestChanges={onRequestChanges || (() => {})}
            approvalDecisionMade={donation.approval_decision_made}
            isApproved={donation.is_approved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
