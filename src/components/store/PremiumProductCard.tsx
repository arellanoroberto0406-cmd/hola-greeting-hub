import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, ShoppingCart, Star, Sparkles, Zap, Check } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useCallback } from "react";

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
  product,
  store,
  planTier,
  index = 0,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  showBadges = true,
  showPrice = true,
}: PremiumProductCardProps) => {
  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  const cardRef = useRef<HTMLDivElement>(null);

  // 3D tilt motion values (Enterprise)
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 });
  const shineX = useTransform(mouseX, [0, 1], [0, 100]);
  const shineY = useTransform(mouseY, [0, 1], [0, 100]);
  const shineBackground = useTransform(
    [shineX, shineY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x}% ${y}%, ${store.primary_color}18, transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)`
  );
  const glowOpacity = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnterprise || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    glowOpacity.set(1);
  }, [isEnterprise, mouseX, mouseY, glowOpacity]);

  const handleMouseLeave = useCallback(() => {
    if (!isEnterprise) return;
    mouseX.set(0.5);
    mouseY.set(0.5);
    glowOpacity.set(0);
  }, [isEnterprise, mouseX, mouseY, glowOpacity]);

  // Animation configurations based on plan tier
  const enterpriseAnim = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.6, delay: (index % 8) * 0.08, ease: "easeOut" as const },
  };

  const professionalAnim = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    whileHover: { y: -8 },
    transition: { duration: 0.5, delay: (index % 8) * 0.06 },
  };

  const basicAnim = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    whileHover: {},
    transition: { duration: 0.3, delay: (index % 8) * 0.03 },
  };

  const animConfig = isEnterprise ? enterpriseAnim : isProfessional ? professionalAnim : basicAnim;

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      ref={cardRef}
      initial={animConfig.initial}
      whileInView={animConfig.whileInView}
      whileHover={!isEnterprise ? (animConfig as any).whileHover : undefined}
      viewport={{ once: true }}
      transition={animConfig.transition}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...(isEnterprise && {
          rotateX,
          rotateY,
          transformPerspective: 800,
          transformStyle: "preserve-3d" as const,
        }),
      }}
      className={cn(
        "group relative bg-card rounded-xl overflow-hidden border transition-all duration-300",
        isEnterprise && "hover:shadow-2xl hover:border-primary/30",
        isProfessional && "hover:shadow-xl",
        isBasic && "hover:shadow-md"
      )}
    >
      {/* Enterprise 3D shine overlay */}
      {isEnterprise && (
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none rounded-xl"
          style={{
            opacity: glowOpacity,
            background: shineBackground,
          }}
        />
      )}

      {/* Enterprise border glow on hover */}
      {isEnterprise && (
        <motion.div
          className="absolute -inset-px rounded-xl pointer-events-none z-10"
          style={{
            opacity: glowOpacity,
            background: `linear-gradient(135deg, ${store.primary_color}40, transparent 50%, ${store.primary_color}20)`,
          }}
        />
      )}

      {/* Image container */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        {/* Main image */}
        <motion.img
          src={product.image}
          alt={product.name}
          className={cn(
            "w-full h-full object-cover transition-transform",
            isEnterprise && "duration-700 group-hover:scale-110",
            isProfessional && "duration-500 group-hover:scale-105",
            isBasic && "duration-300"
          )}
          style={isEnterprise ? { translateZ: 20 } : undefined}
        />

        {/* Secondary image on hover (Enterprise only) */}
        {isEnterprise && product.images && product.images.length > 0 && (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Image overlay gradient (Professional+) */}
        {!isBasic && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}

        {/* Photo count badge */}
        {product.images && product.images.length > 0 && (
          <motion.div
            initial={false}
            animate={{ opacity: 1 }}
            className={cn(
              "absolute bottom-2 left-2 backdrop-blur-md text-xs px-2 py-1 rounded-full flex items-center gap-1",
              isEnterprise && "bg-white/90 text-foreground shadow-lg",
              isProfessional && "bg-background/80 shadow",
              isBasic && "bg-background/70"
            )}
          >
            <Eye className="h-3 w-3" />
            {1 + product.images.length} fotos
          </motion.div>
        )}

        {/* Wishlist button */}
        <motion.div
          className={cn(
            "absolute top-2 right-2",
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
                isInWishlist && "fill-red-500 text-red-500",
                isEnterprise && isInWishlist && "animate-pulse"
              )}
            />
          </Button>
        </motion.div>

        {/* Badges */}
        {showBadges && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
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
            {product.isOnSale && product.originalPrice && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Badge
                  className={cn(
                    "bg-red-500 flex items-center gap-1",
                    isEnterprise && "shadow-lg"
                  )}
                >
                  {isEnterprise && <Zap className="h-3 w-3" />}
                  -{discountPercent}%
                </Badge>
              </motion.div>
            )}
            {product.stock <= 5 && product.stock > 0 && !isBasic && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge variant="outline" className="bg-background/90 backdrop-blur-sm text-orange-600 border-orange-200">
                  ¡Últimas {product.stock}!
                </Badge>
              </motion.div>
            )}
          </div>
        )}

        {/* Quick add button (Enterprise only) */}
        {isEnterprise && (
          <motion.div
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100"
            initial={{ y: 10, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              size="sm"
              className="rounded-full shadow-xl backdrop-blur-sm"
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
      <motion.div
        className={cn(
          "p-4 space-y-3",
          isEnterprise && "p-5"
        )}
        style={isEnterprise ? { translateZ: 30 } : undefined}
      >
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
        <h3 className={cn(
          "font-medium transition-colors",
          isEnterprise && "text-base group-hover:text-primary line-clamp-2",
          isProfessional && "text-sm line-clamp-2",
          isBasic && "text-sm truncate"
        )}>
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
          <div className={cn(
            "flex items-baseline gap-2 flex-wrap",
            isEnterprise && "pt-1"
          )}>
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

        {/* Stock indicator (Professional+) */}
        {!isBasic && product.stock > 0 && product.stock <= 10 && (
          <div className="flex items-center gap-1 text-xs text-orange-600">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            Solo {product.stock} disponibles
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
          onClick={() => onAddToCart(product)}
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

        {/* Benefits (Enterprise only) */}
        {isEnterprise && product.stock > 0 && (
          <div className="pt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-green-500" />
              Envío gratis en pedidos +$999
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-green-500" />
              Garantía de devolución 30 días
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PremiumProductCard;
