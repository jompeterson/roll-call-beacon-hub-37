
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import type { Request } from "@/hooks/useRequests";

interface RequestModalProps {
  request: Request | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
  onMarkCompleted?: (id: string) => void;
}

// Mock images for demonstration
const mockImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
];

interface CreatorInfo {
  name: string;
  email: string;
  organization: string;
}

// Helper function to get status from request approval state
const getRequestStatus = (request: Request): "Approved" | "Pending" | "Rejected" | "Archived" => {
  if (!request.approval_decision_made) {
    return "Pending";
  }
  return request.is_approved ? "Approved" : "Rejected";
};

export const RequestModal = ({ 
  request, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges,
  onMarkCompleted 
}: RequestModalProps) => {
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: "Loading...",
    email: "Loading...",
    organization: "Loading..."
  });

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!request?.creator_user_id) return;

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
          .eq("id", request.creator_user_id)
          .single();

        if (error) {
          console.error("Error fetching creator info:", error);
          setCreatorInfo({
            name: "Unknown User",
            email: "unknown@example.com",
            organization: request.organization_name || "Unknown Organization"
          });
          return;
        }

        if (profile) {
          setCreatorInfo({
            name: `${profile.first_name} ${profile.last_name}`,
            email: profile.email,
            organization: (profile.organizations as any)?.name || request.organization_name || "Unknown Organization"
          });
        }
      } catch (error) {
        console.error("Error fetching creator info:", error);
        setCreatorInfo({
          name: "Unknown User",
          email: "unknown@example.com",
          organization: request.organization_name || "Unknown Organization"
        });
      }
    };

    if (open && request) {
      fetchCreatorInfo();
    }
  }, [request, open]);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_approved: true,
          approval_decision_made: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error approving request:", error);
        return;
      }

      console.log("Request approved successfully");
      onApprove(id);
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_approved: false,
          approval_decision_made: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error rejecting request:", error);
        return;
      }

      console.log("Request rejected successfully");
      onReject(id);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleFulfillRequest = () => {
    console.log("Fulfilling request:", request.id);
    // Add your fulfill request logic here
  };

  const handleMarkCompleted = async (id: string) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({
          is_completed: true
        })
        .eq("id", id);

      if (error) {
        console.error("Error marking request as completed:", error);
        return;
      }

      console.log("Request marked as completed successfully");
      onMarkCompleted && onMarkCompleted(id);
    } catch (error) {
      console.error("Error marking request as completed:", error);
    }
  };

  if (!request) return null;

  // Mock donation need by date based on request type
  const getDonationNeedBy = (deadline: string | null) => {
    if (deadline) {
      return new Date(deadline).toLocaleDateString();
    }
    return "Not specified";
  };

  // Check if the "Mark Completed" button should be shown
  const shouldShowMarkCompleted = request.is_approved && !request.is_completed;

  // Determine which buttons to show based on approval status
  const renderActionButtons = () => {
    if (request.approval_decision_made) {
      if (request.is_approved) {
        return (
          <div className="flex gap-3 pt-6 border-t flex-wrap">
            <Button 
              onClick={handleFulfillRequest}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Fulfill Request
            </Button>
            {shouldShowMarkCompleted && (
              <Button 
                onClick={() => handleMarkCompleted(request.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Mark Completed
              </Button>
            )}
          </div>
        );
      }
      // If rejected, show no buttons
      return null;
    }

    // Show approval buttons if no decision has been made yet
    return (
      <div className="flex gap-3 pt-6 border-t flex-wrap">
        <Button 
          onClick={() => handleApprove(request.id)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Approve
        </Button>
        <Button 
          onClick={() => handleReject(request.id)}
          variant="destructive"
        >
          Reject
        </Button>
        <Button 
          onClick={() => onRequestChanges(request.id)}
          variant="outline"
        >
          Request Changes
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{request.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">Request a Donation</p>
        </DialogHeader>
        
        {/* User Information Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-base">{creatorInfo.name}</h4>
              <p className="text-sm text-muted-foreground">{creatorInfo.email}</p>
              <p className="text-sm text-muted-foreground">{creatorInfo.organization}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Posted on</p>
              <p className="text-sm font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {/* Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">Request Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Request Type</label>
                  <p className="text-base mt-1">{request.request_type}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Requested Item</label>
                  <p className="text-base mt-1">{request.title}</p>
                </div>
                {request.description && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Request Details</label>
                    <p className="text-base mt-1">{request.description}</p>
                  </div>
                )}
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Donation Need By</label>
                  <p className="text-base mt-1">{getDonationNeedBy(request.deadline)}</p>
                </div>
                {request.location && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Location</label>
                    <p className="text-base mt-1">{request.location}</p>
                  </div>
                )}
                {request.urgency_level && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Urgency Level</label>
                    <p className="text-base mt-1">{request.urgency_level}</p>
                  </div>
                )}
                {request.contact_email && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Email</label>
                    <p className="text-base mt-1">{request.contact_email}</p>
                  </div>
                )}
                {request.contact_phone && (
                  <div>
                    <label className="font-medium text-sm text-muted-foreground">Contact Phone</label>
                    <p className="text-base mt-1">{request.contact_phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Carousel Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Item Images</h3>
            <div className="relative px-8">
              <Carousel className="w-full max-w-sm mx-auto">
                <CarouselContent>
                  {mockImages.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square rounded-lg overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${request.title} ${index + 1}`}
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
          </div>
        </div>

        {/* Conditional Action Buttons */}
        {renderActionButtons()}
      </DialogContent>
    </Dialog>
  );
};
