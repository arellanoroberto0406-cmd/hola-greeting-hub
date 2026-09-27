import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Heart, ShoppingCart, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

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
  product, planTier, index = 0, onProductClick, onAddToCart,
  onToggleWishlist, isInWishlist, showBadges = true, showPrice = true,
}: PremiumProductCardProps) => {
  const [addedToCart, setAddedToCart] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const addToCart = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (product.stock === 0) return;
    onAddToCart(product);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 1500);
  }, [onAddToCart, product]);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
      className="vc-product-card"
    >
      <div className="vc-product-image" onClick={() => onProductClick(product)}>
        <img src={product.image} alt={product.name} loading={index < 4 ? "eager" : "lazy"} />
        <div className="vc-product-shade" />

        {showBadges && (
          <div className="vc-product-badges">
            {product.isNew && <Badge className="vc-badge vc-badge-gold"><Sparkles /> Nuevo</Badge>}
            {product.isOnSale && product.originalPrice && <Badge className="vc-badge vc-badge-fire"><Zap /> -{discount}%</Badge>}
            {product.stock > 0 && product.stock <= 5 && <Badge className="vc-badge vc-badge-dark">Últimas {product.stock}</Badge>}
          </div>
        )}

        <Button
          size="icon"
          variant="ghost"
          className={cn("vc-wishlist", isInWishlist && "is-active")}
          aria-label={isInWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={(event) => { event.stopPropagation(); onToggleWishlist(product); }}
        >
          <Heart className={cn(isInWishlist && "fill-current")} />
        </Button>

        <Button variant="ghost" className="vc-quick-view" onClick={() => onProductClick(product)}>
          <Eye /> Ver producto
        </Button>
      </div>

      <div className="vc-product-content">
        <div className="vc-product-meta">
          <span>{product.collection || "Selección"}</span>
          {planTier !== "basic" && product.rating > 0 && <span><Star className="fill-current" /> {product.rating.toFixed(1)}</span>}
        </div>
        <h3 className="vc-heading">{product.name}</h3>
        {showPrice && (
          <div className="vc-price-row">
            <strong>${product.price.toLocaleString()}</strong>
            {product.originalPrice && <del>${product.originalPrice.toLocaleString()}</del>}
          </div>
        )}
        <Button
          className={cn("vc-btn-fire vc-add-cart", addedToCart && "is-added")}
          onClick={addToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Agotado" : addedToCart ? <><Check /> Agregado</> : <><ShoppingCart /> Agregar</>}
        </Button>
      </div>
    </motion.article>
  );
};

export default PremiumProductCard;