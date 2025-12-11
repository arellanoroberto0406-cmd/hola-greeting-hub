import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { products, collections, allColors } from "@/data/products";
import { Product } from "@/types/product";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from "@/context/CartContext";
import { Rating } from "./Rating";

const ProductGrid = () => {
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addItem } = useCart();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const colorMatch = selectedColors.length === 0 ||
        product.colors.some(color => selectedColors.includes(color));
      const collectionMatch = selectedCollections.length === 0 ||
        selectedCollections.includes(product.collection);
      return colorMatch && collectionMatch;
    });
  }, [selectedColors, selectedCollections]);

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleCollectionChange = (collection: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collection) ? prev.filter((c) => c !== collection) : [...prev, collection]
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedCollections([]);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Colecciones</h4>
        <div className="space-y-3">
          {collections.map((collection) => (
            <div key={collection} className="flex items-center space-x-2">
              <Checkbox
                id={collection}
                checked={selectedCollections.includes(collection)}
                onCheckedChange={() => handleCollectionChange(collection)}
              />
              <Label htmlFor={collection} className="text-sm cursor-pointer">
                {collection}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-heading text-sm uppercase tracking-wider mb-4">Colores</h4>
        <div className="space-y-3">
          {allColors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={color}
                checked={selectedColors.includes(color)}
                onCheckedChange={() => handleColorChange(color)}
              />
              <Label htmlFor={color} className="text-sm cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {(selectedColors.length > 0 || selectedCollections.length > 0) && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <section id="productos" className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container px-4 md:px-8">
        <div className="mb-12 text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-heading">
            Todo lo Disponible
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestra colección completa. Cada gorra está diseñada con atención al detalle y fabricada con los mejores materiales.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="h-1 w-20 bg-primary rounded-full" />
            <div className="h-1 w-10 bg-primary/50 rounded-full" />
            <div className="h-1 w-5 bg-primary/25 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-6 rounded-2xl bg-card border border-border/50">
              <h3 className="font-heading text-lg mb-6">Filtros</h3>
              <FilterContent />
            </div>
          </aside>

          {/* Filtros Mobile */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros {(selectedColors.length + selectedCollections.length) > 0 && `(${selectedColors.length + selectedCollections.length})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">No se encontraron productos con estos filtros</p>
                <Button onClick={clearFilters} className="mt-4">
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                    priority={index < 6}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-3xl">
          {quickViewProduct && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square overflow-hidden rounded-xl">
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Badge className="mb-2">{quickViewProduct.collection}</Badge>
                  <h2 className="font-heading text-2xl">{quickViewProduct.name}</h2>
                  {quickViewProduct.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <Rating rating={quickViewProduct.rating} />
                      <span className="text-sm text-muted-foreground">
                        ({quickViewProduct.reviewCount} reseñas)
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl text-primary">
                    ${quickViewProduct.price}
                  </span>
                  {quickViewProduct.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${quickViewProduct.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{quickViewProduct.description}</p>
                {quickViewProduct.features && (
                  <div>
                    <h4 className="font-medium mb-2">Características:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {quickViewProduct.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    addItem(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                >
                  Agregar al Carrito
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProductGrid;
