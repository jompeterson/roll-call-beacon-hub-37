
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface RequestModalImageSectionProps {
  title: string;
  images?: string[];
}

export const RequestModalImageSection = ({ title, images = [] }: RequestModalImageSectionProps) => {
  if (images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Request Photos</h3>
      <div className="relative px-8">
        <Carousel className="w-full max-w-sm mx-auto">
          <CarouselContent>
            {images.map((image, index) => (
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
          {images.length > 1 && <CarouselPrevious className="-left-6" />}
          {images.length > 1 && <CarouselNext className="-right-6" />}
        </Carousel>
      </div>
    </div>
  );
};
