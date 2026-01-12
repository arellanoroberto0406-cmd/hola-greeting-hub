import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  mainImage: string;
  images: string[];
  productName: string;
  primaryColor?: string;
}

const ProductGallery = ({ mainImage, images, productName, primaryColor }: ProductGalleryProps) => {
  const allImages = [mainImage, ...(images || [])].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-xl flex items-center justify-center">
        <span className="text-muted-foreground">Sin imagen</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted group">
        <img
          src={allImages[selectedIndex]}
          alt={`${productName} - Imagen ${selectedIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
        />
        
        {allImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
              {selectedIndex + 1} / {allImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-muted-foreground/30"
              )}
              style={selectedIndex === index && primaryColor ? { borderColor: primaryColor } : undefined}
            >
              <img
                src={img}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
