import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Search } from "lucide-react";
import { motion } from "framer-motion";
import ProductFilters, { FilterState } from "@/components/ProductFilters";

interface ProductsGridSectionProps {
  section: StoreSection;
  store: Store;
  products: Product[];
  allProducts: Product[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  collections: string[];
  maxPrice: number;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const ProductsGridSection = ({
  section,
  store,
  products,
  allProducts,
  filters,
  onFiltersChange,
  collections,
  maxPrice,
  onProductClick,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
}: ProductsGridSectionProps) => {
  const { showFilters = true, columns = 4, showPrice = true, showBadges = true } = section.settings;

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
        className="mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold font-heading mb-6" style={{ color: store.primary_color }}>
          {section.title}
        </h2>

        {showFilters && allProducts.length > 0 && (
          <ProductFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            collections={collections}
            maxPrice={maxPrice}
            primaryColor={store.primary_color}
            totalProducts={allProducts.length}
            filteredCount={products.length}
          />
        )}
      </motion.div>

      {products.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg text-muted-foreground">No se encontraron productos</p>
          <Button
            variant="outline"
            onClick={() => onFiltersChange({
              search: "",
              collection: "all",
              sortBy: "default",
              priceRange: [0, maxPrice],
              showOnSale: false,
              showNew: false,
              showInStock: false,
            })}
          >
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-6`}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
              className="group bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-300"
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
      )}
    </section>
  );
};
