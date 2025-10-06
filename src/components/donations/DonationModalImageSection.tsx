
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { Donation } from "@/hooks/useDonations";

interface DonationModalImageSectionProps {
  donation: Donation;
  orgName: string;
  isOrganization?: boolean;
  isUser?: boolean;
}

const defaultImages = [
  "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
];

export const DonationModalImageSection = ({
  donation,
  orgName,
  isOrganization = false,
  isUser = false
}: DonationModalImageSectionProps) => {
  // Use actual donation images if available, otherwise fall back to defaults
  const images = donation.images && donation.images.length > 0 
    ? donation.images 
    : defaultImages;

  // Don't show the section if there are no images for non-organization/user views
  if (!isOrganization && !isUser && (!donation.images || donation.images.length === 0)) {
    return null;
  }

  return (
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
              {images.map((image, index) => (
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
            {images.length > 1 && (
              <>
                <CarouselPrevious className="-left-6" />
                <CarouselNext className="-right-6" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
};
