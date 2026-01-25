import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart, ArrowRight, Sparkles, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FeaturedProductsSectionProps {
  section: StoreSection;
  store: Store;
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  planTier?: "basic" | "professional" | "enterprise";
}

export const FeaturedProductsSection = ({
  section,
  store,
  products,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  planTier = "basic",
}: FeaturedProductsSectionProps) => {
  const { limit = 8, showPrice = true, showBadges = true, columns = 4, layout = "grid" } = section.settings;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  // Get featured products (new or on sale products first)
  const featuredProducts = products
    .filter(p => p.isNew || p.isOnSale)
    .concat(products.filter(p => !p.isNew && !p.isOnSale))
    .slice(0, limit);

  if (featuredProducts.length === 0) return null;

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth / (isEnterprise ? 3 : 2);
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Calculate discount percentage
  const getDiscount = (product: Product) => {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  };

  // Enhanced product card component
  const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const discount = getDiscount(product);
    
    const cardAnim = isEnterprise 
      ? { initial: { opacity: 0, y: 40, scale: 0.95 }, whileInView: { opacity: 1, y: 0, scale: 1 }, whileHover: { y: -12, scale: 1.02 } }
      : isProfessional 
        ? { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, whileHover: { y: -8 } }
        : { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, whileHover: { y: -4 } };

    return (
      <motion.div
        initial={cardAnim.initial}
        whileInView={cardAnim.whileInView}
        whileHover={cardAnim.whileHover}
        viewport={{ once: true }}
        transition={{ duration: isEnterprise ? 0.6 : 0.4, delay: index * 0.08 }}
        className={cn(
          "group relative bg-card overflow-hidden border transition-all duration-300",
          isEnterprise && "hover:shadow-2xl hover:border-primary/30",
          isProfessional && "hover:shadow-xl",
          isBasic && "hover:shadow-lg"
        )}
        style={{
          borderRadius: 'var(--store-radius, 12px)',
          boxShadow: 'var(--store-card-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
        }}
      >
        {/* Enterprise glow effect */}
        {isEnterprise && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style={{
              background: `radial-gradient(400px circle at 50% 50%, ${store.primary_color}15, transparent 60%)`,
            }}
          />
        )}

        {/* Image container */}
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          onClick={() => onProductClick(product)}
        >
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-transform",
              isEnterprise && "duration-700 group-hover:scale-110",
              isProfessional && "duration-500 group-hover:scale-105",
              isBasic && "duration-300 group-hover:scale-102"
            )}
          />

          {/* Secondary image on hover (Enterprise only) */}
          {isEnterprise && product.images && product.images.length > 0 && (
            <img
              src={product.images[0]}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            />
          )}

          {/* Overlay gradient */}
          {!isBasic && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}

          {/* Photo count badge */}
          {product.images && product.images.length > 0 && (
            <div className={cn(
              "absolute bottom-2 left-2 backdrop-blur-md text-xs px-2 py-1 rounded-full flex items-center gap-1",
              isEnterprise && "bg-white/90 text-foreground shadow-lg",
              isProfessional && "bg-background/80 shadow",
              isBasic && "bg-background/70"
            )}>
              <Eye className="h-3 w-3" />
              {1 + product.images.length} fotos
            </div>
          )}

          {/* Wishlist button */}
          <motion.div
            className={cn(
              "absolute top-2 right-2 z-10",
              !isBasic && "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            )}
            whileHover={!isBasic ? { scale: 1.1 } : {}}
            whileTap={!isBasic ? { scale: 0.9 } : {}}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full",
                isEnterprise && "bg-white/95 shadow-xl hover:bg-white hover:scale-110",
                isProfessional && "bg-background/80 backdrop-blur-sm shadow-lg",
                isBasic && "bg-background/70"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product);
              }}
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-all duration-300",
                  isInWishlist(product.id) && "fill-red-500 text-red-500",
                  isEnterprise && isInWishlist(product.id) && "animate-pulse"
                )}
              />
            </Button>
          </motion.div>

          {/* Badges */}
          {showBadges && (
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {product.isNew && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge
                    className={cn(
                      "flex items-center gap-1",
                      isEnterprise && "shadow-lg"
                    )}
                    style={{ backgroundColor: store.primary_color }}
                  >
                    {isEnterprise && <Sparkles className="h-3 w-3" />}
                    Nuevo
                  </Badge>
                </motion.div>
              )}
              {product.isOnSale && discount > 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge className={cn("bg-red-500", isEnterprise && "shadow-lg")}>
                    -{discount}%
                  </Badge>
                </motion.div>
              )}
              {!isBasic && product.stock <= 5 && product.stock > 0 && (
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-orange-600 border-orange-200">
                  ¡Últimas {product.stock}!
                </Badge>
              )}
            </div>
          )}

          {/* Quick add button (Enterprise only) */}
          {isEnterprise && (
            <motion.div
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 z-10"
              initial={false}
              animate={{ y: 10 }}
              whileInView={{ y: 0 }}
            >
              <Button
                size="sm"
                className="rounded-full shadow-xl"
                style={{ backgroundColor: store.primary_color }}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className={cn("p-4 space-y-3", isEnterprise && "p-5")}>
          {/* Rating (Professional+) */}
          {!isBasic && product.rating > 0 && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Product name */}
          <h3 
            className={cn(
              "font-medium transition-colors cursor-pointer",
              isEnterprise && "text-base group-hover:text-primary line-clamp-2",
              isProfessional && "text-sm line-clamp-2",
              isBasic && "text-sm truncate"
            )}
            onClick={() => onProductClick(product)}
          >
            {product.name}
          </h3>

          {/* Description (Enterprise only) */}
          {isEnterprise && product.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          {showPrice && (
            <div className={cn("flex items-baseline gap-2 flex-wrap", isEnterprise && "pt-1")}>
              <span
                className={cn(
                  "font-bold",
                  isEnterprise && "text-xl",
                  isProfessional && "text-lg",
                  isBasic && "text-base"
                )}
                style={{ color: store.primary_color }}
              >
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
                  {!isBasic && (
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      Ahorras ${(product.originalPrice - product.price).toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>
          )}

          {/* Colors preview (Professional+) */}
          {!isBasic && product.colors && product.colors.length > 1 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="h-4 w-4 rounded-full border shadow-sm"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Add to cart button */}
          <Button
            className={cn(
              "w-full transition-all",
              isEnterprise && "h-11 text-base font-medium shadow-lg hover:shadow-xl",
              isProfessional && "h-10",
              isBasic && "h-9"
            )}
            style={{ backgroundColor: product.stock === 0 ? undefined : store.primary_color }}
            variant={product.stock === 0 ? "secondary" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? (
              "Agotado"
            ) : isEnterprise ? (
              <span className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Agregar al Carrito
              </span>
            ) : (
              "Agregar al Carrito"
            )}
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "flex items-center justify-between mb-8",
          isEnterprise && "mb-10"
        )}
      >
        <div className="space-y-2">
          {isEnterprise && (
            <Badge 
              variant="outline" 
              className="mb-2"
              style={{ borderColor: store.primary_color, color: store.primary_color }}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Selección especial
            </Badge>
          )}
          <h2 
            className={cn(
              "font-bold",
              isEnterprise && "text-3xl md:text-4xl",
              isProfessional && "text-2xl md:text-3xl",
              isBasic && "text-2xl md:text-3xl"
            )}
            style={{ 
              color: store.primary_color,
              fontFamily: 'var(--store-heading-font, inherit)'
            }}
          >
            {section.title}
          </h2>
          {section.settings.subtitle && (
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              {section.settings.subtitle}
            </p>
          )}
        </div>

        {/* Navigation arrows for carousel mode */}
        {layout === "carousel" && (
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleScroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => handleScroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* View all button */}
        {layout !== "carousel" && products.length > limit && (
          <Button 
            variant="ghost" 
            className="hidden sm:flex items-center gap-1 group"
            style={{ color: store.primary_color }}
          >
            Ver todos
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </motion.div>

      {/* Products Grid or Carousel */}
      {layout === "carousel" ? (
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id} 
                className={cn(
                  "flex-shrink-0 snap-start",
                  isEnterprise && "w-[300px] md:w-[350px]",
                  isProfessional && "w-[280px] md:w-[320px]",
                  isBasic && "w-[260px] md:w-[300px]"
                )}
              >
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={cn("grid gap-4 md:gap-6", gridCols[columns as keyof typeof gridCols] || gridCols[4])}>
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      )}

      {/* Mobile view all button */}
      {products.length > limit && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 text-center sm:hidden"
        >
          <Button 
            variant="outline" 
            className="w-full max-w-xs"
            style={{ borderColor: store.primary_color, color: store.primary_color }}
          >
            Ver todos los productos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </motion.div>
      )}
    </section>
  );
};
