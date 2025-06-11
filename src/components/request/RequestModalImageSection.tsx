
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface RequestModalImageSectionProps {
  title: string;
}

export const RequestModalImageSection = ({ title }: RequestModalImageSectionProps) => {
  // Mock images for demonstration
  const mockImages = [
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop"
  ];

  return (
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
                    alt={`${title} ${index + 1}`}
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
  );
};
