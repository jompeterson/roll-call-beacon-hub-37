
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface RequestPost {
  id: string;
  organization: string;
  type: "Materials" | "Tools";
  item: string;
  details: string;
  status: "Approved" | "Pending" | "Rejected" | "Archived";
}

interface RequestModalProps {
  request: RequestPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestChanges: (id: string) => void;
}

// Mock images for demonstration
const mockImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
];

// Mock user data for demonstration
const getUserInfo = (orgName: string) => {
  const users = {
    "Local School District": { name: "Emily Rodriguez", email: "emily@schooldistrict.edu", postedDate: "2024-06-06" },
    "Youth Center": { name: "David Thompson", email: "david@youthcenter.org", postedDate: "2024-06-05" },
    "Senior Center": { name: "Margaret Wilson", email: "margaret@seniorcenter.org", postedDate: "2024-06-04" }
  };
  return users[orgName as keyof typeof users] || { name: "Unknown User", email: "unknown@example.com", postedDate: "2024-06-10" };
};

export const RequestModal = ({ 
  request, 
  open, 
  onOpenChange, 
  onApprove, 
  onReject, 
  onRequestChanges 
}: RequestModalProps) => {
  if (!request) return null;

  const userInfo = getUserInfo(request.organization);

  // Mock estimated value based on item type
  const getEstimatedValue = (type: string, item: string) => {
    if (type === "Tools") return "$250 - $500";
    return "$50 - $150";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{request.item}</DialogTitle>
          <p className="text-sm text-muted-foreground">Request a Donation</p>
        </DialogHeader>
        
        {/* User Information Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-base">{userInfo.name}</h4>
              <p className="text-sm text-muted-foreground">{userInfo.email}</p>
              <p className="text-sm text-muted-foreground">{request.organization}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Posted on</p>
              <p className="text-sm font-medium">{new Date(userInfo.postedDate).toLocaleDateString()}</p>
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
                  <p className="text-base mt-1">{request.type}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Requested Item</label>
                  <p className="text-base mt-1">{request.item}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Request Details</label>
                  <p className="text-base mt-1">{request.details}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Estimated Value</label>
                  <p className="text-base mt-1">{getEstimatedValue(request.type, request.item)}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button 
                onClick={() => onApprove(request.id)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
              <Button 
                onClick={() => onReject(request.id)}
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
                          alt={`${request.item} ${index + 1}`}
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
      </DialogContent>
    </Dialog>
  );
};
