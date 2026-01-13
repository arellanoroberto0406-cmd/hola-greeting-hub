import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal, Grid3X3, LayoutGrid, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { PremiumProductCard } from "@/components/store/PremiumProductCard";
import { cn } from "@/lib/utils";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumProductsGridSectionProps {
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
  planTier?: PlanTier;
}

export const PremiumProductsGridSection = ({
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
  planTier = "basic",
}: PremiumProductsGridSectionProps) => {
  const { showFilters = true, columns = 4, showPrice = true, showBadges = true } = section.settings;

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  // Count active filters
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.collection !== "all" ? 1 : 0,
    filters.showOnSale ? 1 : 0,
    filters.showNew ? 1 : 0,
    filters.showInStock ? 1 : 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      collection: "all",
      sortBy: "default",
      priceRange: [0, maxPrice],
      showOnSale: false,
      showNew: false,
      showInStock: false,
    });
  };

  return (
    <section className={cn(
      "py-12",
      isEnterprise && "py-16"
    )}>
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        {/* Title with decoration based on plan */}
        <div className={cn(
          "flex items-center justify-between mb-6 flex-wrap gap-4",
          isEnterprise && "mb-8"
        )}>
          <div className="flex items-center gap-3">
            {isEnterprise && (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-8 w-8" style={{ color: store.primary_color }} />
              </motion.div>
            )}
            <h2
              className={cn(
                "font-bold font-heading",
                isEnterprise && "text-3xl md:text-4xl",
                isProfessional && "text-2xl md:text-3xl",
                isBasic && "text-2xl md:text-3xl"
              )}
              style={{ color: store.primary_color }}
            >
              {section.title}
            </h2>
          </div>

          {/* Results count & active filters badge */}
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && !isBasic && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 cursor-pointer hover:bg-secondary/80"
                onClick={clearAllFilters}
              >
                <Filter className="h-3 w-3" />
                {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
                <span className="text-muted-foreground">×</span>
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {products.length} de {allProducts.length} productos
            </span>
          </div>
        </div>

        {/* Filters */}
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

      {/* Products Grid or Empty State */}
      <AnimatePresence mode="wait">
        {products.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "text-center py-16 space-y-6 rounded-2xl border-2 border-dashed",
              isEnterprise && "py-20 bg-muted/20"
            )}
          >
            <motion.div
              animate={isEnterprise ? { 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search 
                className={cn(
                  "mx-auto text-muted-foreground",
                  isEnterprise && "h-16 w-16",
                  isProfessional && "h-14 w-14",
                  isBasic && "h-12 w-12"
                )} 
              />
            </motion.div>
            <div className="space-y-2">
              <p className={cn(
                "font-medium",
                isEnterprise && "text-xl",
                isProfessional && "text-lg"
              )}>
                No se encontraron productos
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {activeFilterCount > 0 
                  ? "Intenta ajustar los filtros para ver más resultados"
                  : "No hay productos disponibles en este momento"
                }
              </p>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant={isEnterprise ? "default" : "outline"}
                onClick={clearAllFilters}
                className={cn(
                  isEnterprise && "shadow-lg"
                )}
                style={isEnterprise ? { backgroundColor: store.primary_color } : {}}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Limpiar todos los filtros
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "grid grid-cols-1 gap-6",
              gridCols[columns as keyof typeof gridCols] || gridCols[4],
              isEnterprise && "gap-8"
            )}
          >
            {products.map((product, index) => (
              <PremiumProductCard
                key={product.id}
                product={product}
                store={store}
                planTier={planTier}
                index={index}
                onProductClick={onProductClick}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={isInWishlist(product.id)}
                showBadges={showBadges}
                showPrice={showPrice}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load more hint for enterprise */}
      {isEnterprise && products.length >= 12 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">
            Mostrando {products.length} productos
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: store.primary_color }}
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PremiumProductsGridSection;
