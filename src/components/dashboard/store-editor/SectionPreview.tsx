import { StoreSection } from "@/types/storeLayout";
import { cn } from "@/lib/utils";
import { 
  Layout, 
  Grid3X3, 
  Image, 
  MessageSquare, 
  Mail, 
  Star, 
  Video, 
  HelpCircle,
  Sparkles,
  BarChart3,
  Images,
  Play,
  ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";

interface SectionPreviewProps {
  section: StoreSection;
  primaryColor?: string;
}

export const SectionPreview = ({ section, primaryColor = "#8B4513" }: SectionPreviewProps) => {
  const { type, settings, title } = section;

  // Mock product cards for grid/carousel preview
  const ProductCardMock = ({ index, size = "normal" }: { index: number; size?: "small" | "normal" }) => (
    <div 
      className={cn(
        "rounded-lg border bg-card overflow-hidden",
        size === "small" ? "w-16" : "flex-1"
      )}
    >
      <div 
        className={cn(
          "bg-muted",
          size === "small" ? "h-12" : "h-16"
        )} 
        style={{ backgroundColor: `${primaryColor}20` }}
      />
      <div className={cn("p-2 space-y-1", size === "small" && "p-1")}>
        <div className="h-2 bg-muted rounded w-3/4" />
        <div className="h-2 rounded w-1/2" style={{ backgroundColor: `${primaryColor}40` }} />
      </div>
    </div>
  );

  const renderPreview = () => {
    switch (type) {
      case 'hero':
        return (
          <div 
            className="rounded-lg overflow-hidden h-32"
            style={{ 
              background: settings.backgroundType === 'gradient' 
                ? `linear-gradient(135deg, ${primaryColor}40, ${primaryColor}20)` 
                : settings.backgroundType === 'solid' 
                  ? `${primaryColor}30`
                  : 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--muted)/0.5))'
            }}
          >
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
              <div className="h-3 bg-foreground/80 rounded w-32 mb-2" />
              <div className="h-2 bg-muted-foreground/50 rounded w-24 mb-3" />
              {settings.showButton && (
                <div 
                  className="h-6 rounded-md w-20"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </div>
          </div>
        );

      case 'featured_products':
        const layout = settings.layout || 'grid';
        const columns = settings.columns || 4;
        const limit = settings.limit || 8;
        
        return (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-3 bg-foreground/70 rounded w-24" />
                {settings.subtitle && (
                  <div className="h-2 bg-muted-foreground/40 rounded w-32" />
                )}
              </div>
              {layout === 'carousel' && (
                <div className="flex gap-1">
                  <div className="w-5 h-5 rounded-full border" />
                  <div className="w-5 h-5 rounded-full border" />
                </div>
              )}
            </div>
            
            {/* Products */}
            {layout === 'carousel' ? (
              <div className="relative">
                <div className="flex gap-2 overflow-hidden">
                  {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex-shrink-0 w-20"
                    >
                      <ProductCardMock index={i} size="small" />
                    </motion.div>
                  ))}
                  <div className="flex-shrink-0 w-8 flex items-center justify-center text-muted-foreground">
                    <span className="text-xs">...</span>
                  </div>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className={cn(
                "grid gap-2",
                columns === 2 && "grid-cols-2",
                columns === 3 && "grid-cols-3",
                columns === 4 && "grid-cols-4"
              )}>
                {Array.from({ length: Math.min(columns, limit) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <ProductCardMock index={i} size="small" />
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Layout indicator */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t">
              {layout === 'carousel' ? (
                <>
                  <Play className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Carrusel horizontal</span>
                </>
              ) : (
                <>
                  <Grid3X3 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Cuadrícula {columns} columnas</span>
                </>
              )}
            </div>
          </div>
        );

      case 'products_grid':
        return (
          <div className="space-y-3">
            {settings.showFilters && (
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
                <div className="h-6 bg-muted rounded w-14" />
              </div>
            )}
            <div className={cn(
              "grid gap-2",
              settings.columns === 2 && "grid-cols-2",
              settings.columns === 3 && "grid-cols-3",
              (!settings.columns || settings.columns === 4) && "grid-cols-4"
            )}>
              {Array.from({ length: Math.min(settings.columns || 4, 8) }).map((_, i) => (
                <ProductCardMock key={i} index={i} size="small" />
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className={cn(
            "grid gap-2",
            settings.columns === 2 && "grid-cols-2",
            settings.columns === 3 && "grid-cols-3",
            settings.columns === 6 && "grid-cols-6",
            (!settings.columns || settings.columns === 4) && "grid-cols-4"
          )}>
            {Array.from({ length: settings.columns || 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border overflow-hidden">
                <div className="h-10 bg-muted" style={{ backgroundColor: `${primaryColor}15` }} />
                <div className="p-2">
                  <div className="h-2 bg-muted rounded w-3/4 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        );

      case 'banner':
        return (
          <div 
            className="rounded-lg p-4 text-center"
            style={{ 
              backgroundColor: settings.backgroundColor === 'primary' ? primaryColor 
                : settings.backgroundColor === 'dark' ? '#1f2937' 
                : `${primaryColor}80`
            }}
          >
            <div className="h-2 bg-white/80 rounded w-3/4 mx-auto" />
          </div>
        );

      case 'newsletter':
        return (
          <div className="rounded-lg border p-4 text-center space-y-2" style={{ backgroundColor: `${primaryColor}10` }}>
            <Mail className="h-6 w-6 mx-auto text-muted-foreground" />
            <div className="h-3 bg-foreground/70 rounded w-32 mx-auto" />
            <div className="h-2 bg-muted-foreground/50 rounded w-24 mx-auto" />
            <div className="flex gap-2 justify-center mt-2">
              <div className="h-6 bg-muted rounded flex-1 max-w-24" />
              <div className="h-6 rounded w-16" style={{ backgroundColor: primaryColor }} />
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-2">
            <div className="text-center space-y-1">
              <div className="h-3 bg-foreground/70 rounded w-24 mx-auto" />
              <div className="h-2 bg-muted-foreground/40 rounded w-32 mx-auto" />
            </div>
            <div className={cn(
              "grid gap-2",
              settings.columns === 2 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {Array.from({ length: settings.columns || 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-2 space-y-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'video':
      case 'premium_video':
        const layoutStyle = settings.layoutStyle || 'fullwidth';
        return (
          <div className="space-y-2">
            <div 
              className={cn(
                "rounded-lg overflow-hidden flex items-center justify-center",
                layoutStyle === 'cinematic' && "h-24",
                layoutStyle === 'split' && "h-20",
                layoutStyle === 'floating' && "h-20",
                layoutStyle === 'grid' && "h-16",
                (!layoutStyle || layoutStyle === 'fullwidth') && "h-20"
              )}
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              {layoutStyle === 'split' ? (
                <div className="flex w-full h-full">
                  <div className="flex-1 flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex-1 p-2 flex flex-col justify-center">
                    <div className="h-2 bg-foreground/70 rounded w-3/4 mb-1" />
                    <div className="h-2 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ) : layoutStyle === 'grid' ? (
                <div className="grid grid-cols-3 gap-1 p-2 w-full">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="aspect-video bg-muted rounded flex items-center justify-center">
                      <Play className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <Video className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            {type === 'premium_video' && (
              <div className="flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" style={{ color: primaryColor }} />
                <span className="text-xs text-muted-foreground">{layoutStyle}</span>
              </div>
            )}
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-2">
            <div className="text-center space-y-1">
              <div className="h-3 bg-foreground/70 rounded w-24 mx-auto" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded border p-2 flex items-center justify-between">
                <div className="h-2 bg-muted rounded w-32" />
                <HelpCircle className="h-3 w-3 text-muted-foreground" />
              </div>
            ))}
          </div>
        );

      case 'parallax_hero':
        return (
          <div 
            className="rounded-lg overflow-hidden h-28 relative"
            style={{ background: `linear-gradient(135deg, ${primaryColor}50, ${primaryColor}20)` }}
          >
            <motion.div 
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {settings.badge && (
                <div className="h-4 rounded-full px-2 mb-2 flex items-center" style={{ backgroundColor: primaryColor }}>
                  <span className="text-[8px] text-white">{settings.badge}</span>
                </div>
              )}
              <div className="h-4 bg-foreground/80 rounded w-28 mb-1" />
              <div className="h-2 bg-muted-foreground/50 rounded w-20" />
            </motion.div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/50"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        );

      case 'animated_stats':
        const statLayout = settings.layoutStyle || 'cards';
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="h-3 bg-foreground/70 rounded w-20 mx-auto" />
            </div>
            <div className={cn(
              "gap-2",
              statLayout === 'banner' ? "flex justify-around" : "grid grid-cols-4"
            )}>
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "text-center",
                    statLayout === 'cards' && "rounded border p-2",
                    statLayout === 'circular' && "flex flex-col items-center"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {statLayout === 'circular' && (
                    <div className="w-8 h-8 rounded-full border-2 mb-1" style={{ borderColor: primaryColor }} />
                  )}
                  <div className="h-3 rounded w-8 mx-auto mb-1" style={{ backgroundColor: primaryColor }} />
                  <div className="h-2 bg-muted rounded w-10 mx-auto" />
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1">
              <BarChart3 className="h-3 w-3" style={{ color: primaryColor }} />
              <span className="text-xs text-muted-foreground">{statLayout}</span>
            </div>
          </div>
        );

      case 'interactive_gallery':
        const galleryLayout = settings.layoutStyle || 'masonry';
        return (
          <div className="space-y-2">
            <div className="text-center">
              <div className="h-3 bg-foreground/70 rounded w-16 mx-auto" />
            </div>
            <div className={cn(
              "gap-1",
              galleryLayout === 'masonry' && "columns-3",
              galleryLayout === 'grid' && "grid grid-cols-3",
              galleryLayout === 'carousel' && "flex overflow-hidden",
              galleryLayout === 'featured' && "grid grid-cols-3"
            )}>
              {Array.from({ length: galleryLayout === 'featured' ? 5 : 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "rounded overflow-hidden",
                    galleryLayout === 'masonry' && (i % 2 === 0 ? "h-10 mb-1" : "h-14 mb-1"),
                    galleryLayout === 'grid' && "aspect-square h-10",
                    galleryLayout === 'carousel' && "flex-shrink-0 w-12 h-10",
                    galleryLayout === 'featured' && (i === 0 ? "col-span-2 row-span-2 h-20" : "h-10")
                  )}
                  style={{ backgroundColor: `${primaryColor}${20 + i * 5}` }}
                  whileHover={{ scale: 1.05 }}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Images className="h-3 w-3" style={{ color: primaryColor }} />
              <span className="text-xs text-muted-foreground">{galleryLayout}</span>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="h-3 bg-foreground/70 rounded w-20" />
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded w-full" />
              <div className="h-2 bg-muted rounded w-5/6" />
              <div className="h-2 bg-muted rounded w-4/6" />
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="rounded-lg border p-4 space-y-2">
            <div className="h-3 bg-foreground/70 rounded w-16" />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-3/4" />
              </div>
              {settings.showMap && (
                <div className="h-16 bg-muted rounded" />
              )}
            </div>
          </div>
        );

      case 'image_slider':
        return (
          <div className="space-y-2">
            <div 
              className="rounded-lg h-20 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i === 0 ? "bg-foreground" : "bg-muted"
                  )}
                />
              ))}
            </div>
            {settings.autoplay && (
              <div className="text-xs text-center text-muted-foreground">
                Autoplay: {(settings.interval || 5000) / 1000}s
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="rounded-lg border p-8 flex flex-col items-center justify-center text-center">
            <Layout className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={cn(
          "rounded-lg border-2 border-dashed p-4 bg-background transition-all",
          settings.backgroundColor && settings.backgroundColor !== 'transparent' && "border-solid"
        )}
        style={{
          backgroundColor: settings.backgroundColor && settings.backgroundColor !== 'transparent' 
            ? settings.backgroundColor === 'primary' ? `${primaryColor}10` 
            : settings.backgroundColor === 'muted' ? 'hsl(var(--muted))' 
            : undefined
            : undefined
        }}
      >
        {renderPreview()}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Vista previa aproximada. El resultado final puede variar ligeramente.
      </p>
    </div>
  );
};