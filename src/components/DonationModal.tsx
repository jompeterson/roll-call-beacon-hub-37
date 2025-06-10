
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
  onRequestChanges 
}: DonationModalProps) => {
  if (!donation) return null;

  // Mock estimated value based on item type
  const getEstimatedValue = (type: string, item: string) => {
    if (type === "Tools") return "$250 - $500";
    return "$50 - $150";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{donation.item}</DialogTitle>
          <p className="text-sm text-muted-foreground">Give a Donation</p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Information Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-3">Donation Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Donation Type</label>
                  <p className="text-base">{donation.type}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Donation Item</label>
                  <p className="text-base">{donation.item}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Donation Details</label>
                  <p className="text-base">{donation.details}</p>
                </div>
                <div>
                  <label className="font-medium text-sm text-muted-foreground">Estimated Value</label>
                  <p className="text-base">{getEstimatedValue(donation.type, donation.item)}</p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
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
          </div>

          {/* Image Carousel Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Item Images</h3>
            <Carousel className="w-full max-w-md mx-auto">
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
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
