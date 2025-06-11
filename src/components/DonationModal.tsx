
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import type { Donation } from "@/hooks/useDonations";

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

interface CreatorInfo {
  name: string;
  email: string;
  postedDate: string;
  lastLogin?: string;
}

// Mock images for demonstration
const mockImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
];

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
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch creator information when donation changes
  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!donation?.creator_user_id || !open) return;

      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, email')
          .eq('id', donation.creator_user_id)
          .single();

        if (error) {
          console.error('Error fetching creator profile:', error);
          setCreatorInfo({
            name: "Unknown User",
            email: "unknown@example.com",
            postedDate: donation.created_at
          });
        } else {
          setCreatorInfo({
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            postedDate: donation.created_at
          });
        }
      } catch (error) {
        console.error('Error fetching creator info:', error);
        setCreatorInfo({
          name: "Unknown User",
          email: "unknown@example.com",
          postedDate: donation.created_at
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorInfo();
  }, [donation?.creator_user_id, donation?.created_at, open]);

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
        
        {/* Creator Information Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              {loading ? (
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-40"></div>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-base">{creatorInfo?.name || "Loading..."}</h4>
                  <p className="text-sm text-muted-foreground">{creatorInfo?.email || "Loading..."}</p>
                  <p className="text-sm text-muted-foreground">{orgName}</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{getDateLabel()}</p>
              <p className="text-sm font-medium">
                {creatorInfo?.postedDate ? new Date(creatorInfo.postedDate).toLocaleDateString() : "Loading..."}
              </p>
              {isUser && creatorInfo && (creatorInfo as any).lastLogin && (
                <>
                  <p className="text-sm text-muted-foreground mt-2">Last Login</p>
                  <p className="text-sm font-medium">{new Date((creatorInfo as any).lastLogin).toLocaleDateString()}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">{getInformationTitle()}</h3>
              <div className="space-y-4">
                {!isScholarship && !isEvent && !isOrganization && !isUser && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Donation Title</label>
                    <p className="text-base mt-1">{donation.title}</p>
                  </div>
                )}
                {!isOrganization && !isUser && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">
                      {isEvent ? "Event Details" : isScholarship ? "Scholarship Details" : "Donation Details"}
                    </label>
                    <p className="text-base mt-1">{donation.description || "No description provided"}</p>
                  </div>
                )}
                {isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Organization Bio</label>
                    <p className="text-base mt-1">{getOrganizationBio()}</p>
                  </div>
                )}
                {isUser && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">User Bio</label>
                    <p className="text-base mt-1">{getUserBio()}</p>
                  </div>
                )}
                {!isOrganization && !isUser && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">
                      {isEvent ? "Volunteer Hours" : isScholarship ? "Scholarship Amount" : "Amount Needed"}
                    </label>
                    <p className="text-base mt-1">
                      {formatAmount(donation.amount_needed)}
                    </p>
                  </div>
                )}
                {!isOrganization && !isUser && donation.amount_raised !== null && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Amount Raised</label>
                    <p className="text-base mt-1">{formatAmount(donation.amount_raised)}</p>
                  </div>
                )}
                {donation.contact_email && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Email</label>
                    <p className="text-base mt-1">{donation.contact_email}</p>
                  </div>
                )}
                {donation.contact_phone && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Phone</label>
                    <p className="text-base mt-1">{donation.contact_phone}</p>
                  </div>
                )}
                {donation.target_date && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Target Date</label>
                    <p className="text-base mt-1">{new Date(donation.target_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {isUser ? "User Image" : isOrganization ? "Organization Image" : "Donation Images"}
            </h3>
            {isOrganization || isUser ? (
              <div className="aspect-square rounded-lg overflow-hidden max-w-sm mx-auto">
                <img 
                  src={isUser 
                    ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop"
                    : "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop"
                  }
                  alt={isUser ? donation.title : orgName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative px-8">
                <Carousel className="w-full max-w-sm mx-auto">
                  <CarouselContent>
                    {mockImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={image} 
                            alt={`${donation.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-6" />
                  <CarouselNext className="-right-6" />
                </Carousel>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons at bottom for all modals except users */}
        {!isUser && (
          <div className="flex gap-3 pt-6 border-t">
            <Button 
              onClick={() => onApprove(donation.id)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve
            </Button>
            <Button 
              onClick={() => onReject(donation.id)}
              variant="destructive"
            >
              Reject
            </Button>
            <Button 
              onClick={() => onRequestChanges(donation.id)}
              variant="outline"
            >
              Request Changes
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
