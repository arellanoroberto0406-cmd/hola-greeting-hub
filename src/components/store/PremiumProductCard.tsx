import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart, Star, Sparkles, Zap, Check, Plus } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useCallback, useState } from "react";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumProductCardProps {
  product: Product;
  store: Store;
  planTier: PlanTier;
  index?: number;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: boolean;
  showBadges?: boolean;
  showPrice?: boolean;
}

export const PremiumProductCard = ({
  product, store, planTier, index = 0,
  onProductClick, onAddToCart, onToggleWishlist, isInWishlist,
  showBadges = true, showPrice = true,
}: PremiumProductCardProps) => {
  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";
  const [isHovered, setIsHovered] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt (Enterprise)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnterprise || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [isEnterprise, mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!isEnterprise) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [isEnterprise, mouseX, mouseY]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    onAddToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  }, [onAddToCart, product]);

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        ...(isEnterprise && {
          rotateX,
          rotateY,
          transformPerspective: 1000,
          transformStyle: "preserve-3d" as const,
        }),
      }}
      className={cn(
        "group relative bg-card rounded-2xl overflow-hidden transition-all duration-500",
        "border border-border/40 hover:border-border/80",
        isEnterprise && "hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.15)]",
        isProfessional && "hover:shadow-xl hover:-translate-y-1",
        isBasic && "hover:shadow-md"
      )}
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => onProductClick(product)}>
        {/* Main image with smooth zoom */}
        <img
          src={product.image}
          alt={product.name}
          loading={index < 4 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={index < 2 ? "high" : "auto"}
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 ease-out",
            isHovered && "scale-110"
          )}
        />

        {/* Secondary image fade (Enterprise) */}
        {isEnterprise && product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {/* Gradient overlay */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isHovered ? "opacity-100" : "opacity-0"
        )} style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)"
        }} />

        {/* Badges */}
        {showBadges && (
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isNew && (
              <Badge className="shadow-lg text-[11px] font-bold px-2.5 py-0.5 rounded-lg" style={{ 
                background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)`,
                boxShadow: `0 2px 8px ${store.primary_color}40`
              }}>
                {!isBasic && <Sparkles className="h-3 w-3 mr-1" />}
                NUEVO
              </Badge>
            )}
            {product.isOnSale && product.originalPrice && (
              <Badge className="bg-gradient-to-r from-red-500 to-rose-500 shadow-lg text-[11px] font-bold px-2.5 py-0.5 rounded-lg">
                <Zap className="h-3 w-3 mr-0.5" />
                -{discountPercent}%
              </Badge>
            )}
            {!isBasic && product.stock <= 5 && product.stock > 0 && (
              <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-orange-600 border-orange-200/80 text-[11px] font-semibold rounded-lg shadow-sm">
                ¡Últimas {product.stock}!
              </Badge>
            )}
          </div>
        )}

        {/* Wishlist button - top right */}
        <motion.div
          className={cn(
            "absolute top-3 right-3 z-10 transition-all duration-300",
            !isBasic && !isHovered && !isInWishlist && "opacity-0 translate-y-1"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <button
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
              isInWishlist 
                ? "bg-red-50 shadow-lg" 
                : "bg-white/90 backdrop-blur-sm shadow-md hover:bg-white"
            )}
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          >
            <Heart className={cn(
              "h-[18px] w-[18px] transition-all",
              isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
            )} />
          </button>
        </motion.div>

        {/* Photo count */}
        {product.images && product.images.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/50 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
            <Eye className="h-3 w-3" />
            {1 + product.images.length}
          </div>
        )}

        {/* Quick Add button - bottom right (Professional+) */}
        {!isBasic && (
          <motion.div
            className={cn(
              "absolute bottom-3 right-3 z-10 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <button
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 text-white shadow-xl",
                addedToCart && "!bg-green-500"
              )}
              style={!addedToCart ? { 
                background: `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}cc)`,
                boxShadow: `0 4px 15px ${store.primary_color}40`
              } : undefined}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {addedToCart ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </button>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Rating */}
        {!isBasic && product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(product.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Product name */}
        <h3 className={cn(
          "font-semibold leading-snug transition-colors line-clamp-2",
          isEnterprise && "text-[15px]",
          isProfessional && "text-sm",
          isBasic && "text-sm"
        )}>
          {product.name}
        </h3>

        {/* Description (Enterprise) */}
        {isEnterprise && product.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Price */}
        {showPrice && (
          <div className="flex items-baseline gap-2 flex-wrap pt-1">
            <span
              className={cn("font-bold", isEnterprise ? "text-xl" : "text-lg")}
              style={{ color: store.primary_color }}
            >
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice.toLocaleString()}
                </span>
                {!isBasic && (
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                    -{discountPercent}%
                  </span>
                )}
              </>
            )}
          </div>
        )}

        {/* Colors preview (Professional+) */}
        {!isBasic && product.colors && product.colors.length > 1 && (
          <div className="flex items-center gap-1 pt-0.5">
            {product.colors.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="h-4 w-4 rounded-full border border-border/60 shadow-sm transition-transform hover:scale-125"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.colors.length > 5 && (
              <span className="text-[11px] text-muted-foreground font-medium ml-0.5">
                +{product.colors.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Add to cart - full width */}
        <Button
          className={cn(
            "w-full transition-all duration-300 rounded-xl font-semibold",
            isEnterprise && "h-11 text-sm",
            isProfessional && "h-10 text-sm",
            isBasic && "h-9 text-xs"
          )}
          style={product.stock > 0 ? {
            background: addedToCart 
              ? "linear-gradient(135deg, #22c55e, #16a34a)" 
              : `linear-gradient(135deg, ${store.primary_color}, ${store.primary_color}dd)`,
            boxShadow: addedToCart ? undefined : `0 2px 10px ${store.primary_color}25`,
          } : undefined}
          variant={product.stock === 0 ? "secondary" : "default"}
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? (
            "Agotado"
          ) : addedToCart ? (
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> ¡Agregado!</span>
          ) : (
            <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Agregar</span>
          )}
        </Button>

        {/* Benefits (Enterprise) */}
        {isEnterprise && product.stock > 0 && (
          <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" /> Envío gratis +$999
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" /> Garantía 30d
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PremiumProductCard;
