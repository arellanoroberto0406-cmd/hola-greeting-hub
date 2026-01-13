import { StoreSection } from "@/types/storeLayout";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { motion } from "framer-motion";

interface ImageSliderSectionProps {
  section: StoreSection;
  store: any;
}

const defaultImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
    alt: "Tienda 1",
    caption: "Descubre nuestra nueva colección"
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200",
    alt: "Tienda 2",
    caption: "Los mejores productos"
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1560472355-536de3962603?w=1200",
    alt: "Tienda 3",
    caption: "Calidad garantizada"
  }
];

export const ImageSliderSection = ({ section, store }: ImageSliderSectionProps) => {
  const images = section.settings.images || defaultImages;
  const autoplay = section.settings.autoplay !== false;
  const interval = section.settings.interval || 5000;
  const showCaptions = section.settings.showCaptions !== false;
  const aspectRatio = section.settings.aspectRatio || "16/9";

  const plugin = useRef(
    Autoplay({ delay: interval, stopOnInteraction: true })
  );

  return (
    <motion.section 
      className="py-8 md:py-12"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        {section.settings.headline && (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {section.settings.headline}
            </h2>
            {section.settings.subtitle && (
              <p className="text-muted-foreground">{section.settings.subtitle}</p>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Carousel
            plugins={autoplay ? [plugin.current] : []}
            className="w-full max-w-5xl mx-auto"
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {images.map((image: any, index: number) => (
                <CarouselItem key={image.id || index}>
                  <div className="relative overflow-hidden rounded-xl">
                    <AspectRatio ratio={aspectRatio === "16/9" ? 16/9 : aspectRatio === "4/3" ? 4/3 : 21/9}>
                      <img
                        src={image.url}
                        alt={image.alt || `Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </AspectRatio>
                    {showCaptions && image.caption && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <p className="text-white text-lg md:text-xl font-medium">
                          {image.caption}
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </motion.div>
      </div>
    </motion.section>
  );
};