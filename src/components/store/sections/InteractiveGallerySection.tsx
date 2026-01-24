import { StoreSection } from "@/types/storeLayout";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, X, ChevronLeft, ChevronRight, ZoomIn, 
  Download, Share2, Heart, Maximize2, Grid3X3, LayoutGrid 
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface InteractiveGalleryProps {
  section: StoreSection;
  store: any;
  planTier?: 'basic' | 'professional' | 'enterprise';
}

interface GalleryImage {
  url: string;
  title?: string;
  description?: string;
}

export const InteractiveGallerySection = ({ section, store, planTier = 'basic' }: InteractiveGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  
  const accentColor = store?.primary_color || '#8B4513';

  // Check plan tier
  if (planTier !== 'enterprise') {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: `${accentColor}30` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)` }}
            >
              <Crown className="h-10 w-10" style={{ color: accentColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Galería Interactiva</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Muestra tus productos con una galería premium con zoom, lightbox y efectos hover avanzados.
            </p>
            <Badge 
              className="text-sm px-4 py-2"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              Requiere Plan Enterprise
            </Badge>
          </motion.div>
        </div>
      </section>
    );
  }

  const layoutStyle = section.settings.layoutStyle || 'masonry';
  const images: GalleryImage[] = section.settings.images || [
    { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', title: 'Colección Primavera' },
    { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', title: 'Productos Premium' },
    { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', title: 'Audio Elite' },
    { url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800', title: 'Accesorios' },
    { url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800', title: 'Gafas de Sol' },
    { url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800', title: 'Moda Urbana' },
  ];

  const toggleLike = (idx: number) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    const newIndex = direction === 'prev' 
      ? (selectedImage - 1 + images.length) % images.length
      : (selectedImage + 1) % images.length;
    setSelectedImage(newIndex);
  };

  // Interactive Image Card with 3D effect
  const ImageCard = ({ image, index }: { image: GalleryImage; index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
      setHoveredIndex(null);
    };

    const isHovered = hoveredIndex === index;

    return (
      <motion.div
        ref={cardRef}
        className="relative cursor-pointer group"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => setSelectedImage(index)}
        whileHover={{ scale: 1.02 }}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          {/* Image */}
          <motion.img
            src={image.url}
            alt={image.title || `Imagen ${index + 1}`}
            className="w-full h-full object-cover"
            style={{ 
              height: layoutStyle === 'masonry' ? (index % 3 === 0 ? '400px' : index % 3 === 1 ? '300px' : '350px') : '300px'
            }}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Overlay */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Content on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 flex flex-col justify-between p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Top actions */}
                <div className="flex justify-end gap-2">
                  <motion.button
                    className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${likedImages.has(index) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(index);
                    }}
                  >
                    <Heart className={`h-5 w-5 ${likedImages.has(index) ? 'fill-current' : ''}`} />
                  </motion.button>
                  <motion.button
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Bottom info */}
                <div>
                  {image.title && (
                    <motion.h3 
                      className="text-xl font-bold text-white mb-1"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {image.title}
                    </motion.h3>
                  )}
                  {image.description && (
                    <motion.p 
                      className="text-white/70 text-sm"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      {image.description}
                    </motion.p>
                  )}
                  
                  <motion.div 
                    className="flex items-center gap-2 mt-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div 
                      className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5"
                      style={{ backgroundColor: accentColor, color: 'white' }}
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                      Ver más
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </motion.div>
    );
  };

  // Masonry Layout
  const renderMasonryLayout = () => (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {images.map((image, idx) => (
        <ImageCard key={idx} image={image} index={idx} />
      ))}
    </div>
  );

  // Grid Layout
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {images.map((image, idx) => (
        <ImageCard key={idx} image={image} index={idx} />
      ))}
    </div>
  );

  // Carousel Layout
  const renderCarouselLayout = () => (
    <div className="relative">
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide">
        {images.map((image, idx) => (
          <motion.div 
            key={idx} 
            className="flex-shrink-0 w-80 md:w-96 snap-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <ImageCard image={image} index={idx} />
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Featured Layout - One big + smaller ones
  const renderFeaturedLayout = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main featured image */}
      <div className="lg:row-span-2">
        <ImageCard image={images[0]} index={0} />
      </div>
      
      {/* Secondary images */}
      <div className="grid grid-cols-2 gap-6">
        {images.slice(1, 5).map((image, idx) => (
          <ImageCard key={idx + 1} image={image} index={idx + 1} />
        ))}
      </div>
    </div>
  );

  return (
    <section ref={containerRef} className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div>
            {section.settings.badge && (
              <Badge 
                className="mb-4"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                {section.settings.badge}
              </Badge>
            )}
            
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--store-heading-font)' }}
            >
              {section.settings.headline || 'Galería'}
            </h2>
            
            {section.settings.subtitle && (
              <p className="text-lg text-muted-foreground max-w-xl">
                {section.settings.subtitle}
              </p>
            )}
          </div>

          {/* Layout toggle buttons */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-xl">
            {[
              { value: 'masonry', icon: Grid3X3, label: 'Masonry' },
              { value: 'grid', icon: LayoutGrid, label: 'Grid' },
            ].map((layout) => (
              <Button
                key={layout.value}
                variant={layoutStyle === layout.value ? "default" : "ghost"}
                size="sm"
                className="rounded-lg"
                style={layoutStyle === layout.value ? { backgroundColor: accentColor } : {}}
                onClick={() => {}}
              >
                <layout.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Gallery */}
        {layoutStyle === 'masonry' && renderMasonryLayout()}
        {layoutStyle === 'grid' && renderGridLayout()}
        {layoutStyle === 'carousel' && renderCarouselLayout()}
        {layoutStyle === 'featured' && renderFeaturedLayout()}
      </div>

      {/* Lightbox */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-6xl w-full p-0 bg-black/95 border-none">
          <AnimatePresence mode="wait">
            {selectedImage !== null && (
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Navigation */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={() => navigateImage('prev')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
                  onClick={() => navigateImage('next')}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>

                {/* Image */}
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].title || ''}
                  className="w-full max-h-[80vh] object-contain"
                />

                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-end justify-between">
                    <div>
                      {images[selectedImage].title && (
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {images[selectedImage].title}
                        </h3>
                      )}
                      {images[selectedImage].description && (
                        <p className="text-white/70">{images[selectedImage].description}</p>
                      )}
                      <p className="text-white/50 text-sm mt-2">
                        {selectedImage + 1} / {images.length}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`text-white rounded-full ${likedImages.has(selectedImage) ? 'bg-red-500 hover:bg-red-600' : 'hover:bg-white/20'}`}
                        onClick={() => toggleLike(selectedImage)}
                      >
                        <Heart className={`h-5 w-5 ${likedImages.has(selectedImage) ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default InteractiveGallerySection;
