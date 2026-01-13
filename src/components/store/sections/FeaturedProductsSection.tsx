import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturedProductsSectionProps {
  section: StoreSection;
  store: Store;
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const FeaturedProductsSection = ({
  section,
  store,
  products,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: FeaturedProductsSectionProps) => {
  const { limit = 8, showPrice = true, showBadges = true, columns = 4 } = section.settings;

  // Get featured products (new or on sale products first)
  const featuredProducts = products
    .filter(p => p.isNew || p.isOnSale)
    .concat(products.filter(p => !p.isNew && !p.isOnSale))
    .slice(0, limit);

  if (featuredProducts.length === 0) return null;

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 
          className="text-2xl md:text-3xl font-bold" 
          style={{ 
            color: store.primary_color,
            fontFamily: 'var(--store-heading-font, inherit)'
          }}
        >
          {section.title}
        </h2>
      </motion.div>

      <div className={`grid grid-cols-1 ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-6`}>
        {featuredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group bg-card overflow-hidden border hover:shadow-lg transition-all duration-300"
            style={{
              borderRadius: 'var(--store-radius, 12px)',
              boxShadow: 'var(--store-card-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1))',
            }}
          >
            <div
              className="relative aspect-square overflow-hidden cursor-pointer"
              onClick={() => onProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {product.images && product.images.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {1 + product.images.length} fotos
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(product);
                }}
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
              {showBadges && (
                <>
                  {product.isNew && (
                    <Badge className="absolute top-2 left-2" style={{ backgroundColor: store.primary_color }}>
                      Nuevo
                    </Badge>
                  )}
                  {product.isOnSale && product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      Oferta
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-medium truncate">{product.name}</h3>
              {showPrice && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg" style={{ color: store.primary_color }}>
                    ${product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              )}
              <Button
                className="w-full"
                style={{ backgroundColor: store.primary_color }}
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
