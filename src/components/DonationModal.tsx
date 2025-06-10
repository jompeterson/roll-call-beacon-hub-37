
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface DonationPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

interface DonationModalProps {
  donation: DonationPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  isScholarship?: boolean;
  isEvent?: boolean;
  isOrganization?: boolean;
}

// Mock images for demonstration
const mockImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
];

// Mock user data for demonstration
const getUserInfo = (orgName: string, isScholarship: boolean = false, isEvent: boolean = false, isOrganization: boolean = false) => {
  if (isOrganization) {
    const users = {
      "Tech Solutions Inc": { name: "John Smith", email: "john@techsolutions.com", postedDate: "2024-06-08" },
      "Green Earth Foundation": { name: "Sarah Johnson", email: "sarah@greenearth.org", postedDate: "2024-06-09" },
      "Community Health Center": { name: "Dr. Michael Brown", email: "michael@healthcenter.org", postedDate: "2024-06-07" }
    };
    return users[orgName as keyof typeof users] || { name: "Unknown User", email: "unknown@example.com", postedDate: "2024-06-10" };
  } else if (isEvent) {
    const users = {
      "Community Center": { name: "John Davis", email: "john@communitycenter.org", postedDate: "2024-06-08", expectedAttendees: "50-75 people" },
      "Local Library": { name: "Emma Wilson", email: "emma@locallibrary.org", postedDate: "2024-06-09", expectedAttendees: "25-30 people" },
      "Food Bank": { name: "Robert Smith", email: "robert@foodbank.org", postedDate: "2024-06-07", expectedAttendees: "100+ people" }
    };
    return users[orgName as keyof typeof users] || { name: "Unknown User", email: "unknown@example.com", postedDate: "2024-06-10", expectedAttendees: "TBD" };
  } else if (isScholarship) {
    const users = {
      "Education Foundation": { name: "Sarah Johnson", email: "sarah@greenearth.org", postedDate: "2024-06-08" },
      "Community College": { name: "Mike Chen", email: "mike@techforgood.org", postedDate: "2024-06-09" },
      "Local University": { name: "Lisa Martinez", email: "lisa@communitygarden.org", postedDate: "2024-06-07" }
    };
    return users[orgName as keyof typeof users] || { name: "Unknown User", email: "unknown@example.com", postedDate: "2024-06-10" };
  } else {
    const users = {
      "Green Earth Foundation": { name: "Sarah Johnson", email: "sarah@greenearth.org", postedDate: "2024-06-08" },
      "Tech for Good": { name: "Mike Chen", email: "mike@techforgood.org", postedDate: "2024-06-09" },
      "Community Garden": { name: "Lisa Martinez", email: "lisa@communitygarden.org", postedDate: "2024-06-07" }
    };
    return users[orgName as keyof typeof users] || { name: "Unknown User", email: "unknown@example.com", postedDate: "2024-06-10" };
  }
};

export const DonationModal = ({ 
  donation, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges,
  isScholarship = false,
  isEvent = false,
  isOrganization = false
}: DonationModalProps) => {
  if (!donation) return null;

  const userInfo = getUserInfo(donation.organization, isScholarship, isEvent, isOrganization);

  // Mock estimated value based on item type
  const getEstimatedValue = (type: string, item: string) => {
    if (type === "Tools") return "$250 - $500";
    return "$50 - $150";
  };

  const getModalType = () => {
    if (isOrganization) return "Business";
    if (isEvent) return "Event - Community Engagement";
    if (isScholarship) return "Scholarship";
    return "Give a Donation";
  };

  const getInformationTitle = () => {
    if (isOrganization) return "Organization Information";
    if (isEvent) return "Event Information";
    if (isScholarship) return "Scholarship Information";
    return "Donation Information";
  };

  const getDateLabel = () => {
    if (isOrganization) return "Created on";
    return "Posted on";
  };

  const getOrganizationBio = () => {
    return "A leading organization dedicated to making a positive impact in the community through innovative solutions and collaborative partnerships.";
  };

  const getModalTitle = () => {
    if (isOrganization) return donation.organization;
    return donation.item;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{getModalTitle()}</DialogTitle>
          <p className="text-sm text-muted-foreground">{getModalType()}</p>
        </DialogHeader>
        
        {/* User Information Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-base">{userInfo.name}</h4>
              <p className="text-sm text-muted-foreground">{userInfo.email}</p>
              <p className="text-sm text-muted-foreground">{donation.organization}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{getDateLabel()}</p>
              <p className="text-sm font-medium">{new Date(userInfo.postedDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">{getInformationTitle()}</h3>
              <div className="space-y-4">
                {!isScholarship && !isEvent && !isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Donation Type</label>
                    <p className="text-base mt-1">{donation.type}</p>
                  </div>
                )}
                {!isScholarship && !isEvent && !isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Donation Item</label>
                    <p className="text-base mt-1">{donation.item}</p>
                  </div>
                )}
                {!isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">
                      {isEvent ? "Event Details" : isScholarship ? "Scholarship Details" : "Donation Details"}
                    </label>
                    <p className="text-base mt-1">{donation.details}</p>
                  </div>
                )}
                {isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Organization Bio</label>
                    <p className="text-base mt-1">{getOrganizationBio()}</p>
                  </div>
                )}
                {!isOrganization && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">
                      {isEvent ? "Volunteer Hours" : isScholarship ? "Scholarship Amount" : "Estimated Value"}
                    </label>
                    <p className="text-base mt-1">
                      {isEvent || isScholarship ? donation.details : getEstimatedValue(donation.type, donation.item)}
                    </p>
                  </div>
                )}
                {isEvent && (userInfo as any).expectedAttendees && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Expected Attendees</label>
                    <p className="text-base mt-1">{(userInfo as any).expectedAttendees}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">
              {isOrganization ? "Organization Image" : "Item Images"}
            </h3>
            {isOrganization ? (
              <div className="aspect-square rounded-lg overflow-hidden max-w-sm mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop"
                  alt={donation.organization}
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
                            alt={`${donation.item} ${index + 1}`}
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

        {/* Action Buttons at bottom for all modals */}
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
      </DialogContent>
    </Dialog>
  );
};
