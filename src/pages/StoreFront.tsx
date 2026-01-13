import { useParams } from "react-router-dom";
import { useStore, useStoreProducts } from "@/hooks/useStores";
import { Loader2, ShoppingCart, Heart, Menu, Eye } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, X, Truck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";

const mapDbProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  image: dbProduct.image,
  images: dbProduct.images || [],
  colors: dbProduct.colors || [],
  collection: dbProduct.collection,
  stock: dbProduct.stock,
  description: dbProduct.description || "",
  isNew: dbProduct.is_new || false,
  isOnSale: dbProduct.is_on_sale || false,
  rating: Number(dbProduct.rating) || 0,
  reviewCount: dbProduct.review_count || 0,
  materials: dbProduct.materials || "",
  features: dbProduct.features || [],
});

const StoreFront = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: store, isLoading: storeLoading } = useStore(slug || "");
  const { data: productsData, isLoading: productsLoading } = useStoreProducts(store?.id);
  const { items, addItem, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products = useMemo(() => {
    return (productsData || []).map(mapDbProduct);
  }, [productsData]);

  // Apply store colors as CSS variables
  useEffect(() => {
    if (store) {
      document.documentElement.style.setProperty('--store-primary', store.primary_color);
      document.documentElement.style.setProperty('--store-secondary', store.secondary_color);
      document.documentElement.style.setProperty('--store-accent', store.accent_color);
    }
    return () => {
      document.documentElement.style.removeProperty('--store-primary');
      document.documentElement.style.removeProperty('--store-secondary');
      document.documentElement.style.removeProperty('--store-accent');
    };
  }, [store]);

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Tienda no encontrada</h1>
          <p className="text-muted-foreground">La tienda que buscas no existe o no está disponible.</p>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  const shippingCost = store.shipping_cost || 99;
  const freeShippingThreshold = store.free_shipping_threshold || 999;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300 shadow-lg"
        style={{ 
          backgroundColor: `${store.primary_color}15`,
          borderColor: `${store.primary_color}30`
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-10 w-auto" />
              ) : (
                <h1 
                  className="font-display text-2xl tracking-wider"
                  style={{ color: store.primary_color }}
                >
                  {store.name}
                </h1>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: store.primary_color }}
                  >
                    {wishlist.length}
                  </span>
                )}
              </Button>

              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl relative">
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        style={{ backgroundColor: store.primary_color }}
                      >
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg flex flex-col">
                  <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                      <span>Carrito ({totalItems})</span>
                      {items.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={clearCart}>
                          Vaciar
                        </Button>
                      )}
                    </SheetTitle>
                  </SheetHeader>

                  {items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground">Tu carrito está vacío</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ScrollArea className="flex-1 -mx-6 px-6">
                        <div className="space-y-4 py-4">
                          {items.map((item) => (
                            <div
                              key={`${item.id}-${item.selectedColor}`}
                              className="flex gap-4 border rounded-lg p-3"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-md"
                              />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-sm">{item.name}</h4>
                                    {item.selectedColor && (
                                      <p className="text-xs text-muted-foreground">
                                        Color: {item.selectedColor}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => removeItem(item.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium w-8 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={item.quantity >= item.stock}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <p className="font-bold" style={{ color: store.primary_color }}>
                                    ${(item.price * item.quantity).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-4 pt-4">
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal:</span>
                            <span>${totalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Truck className="h-4 w-4" />
                              Envío:
                            </span>
                            <span className={totalPrice >= freeShippingThreshold ? "text-green-500 font-semibold" : ""}>
                              {totalPrice >= freeShippingThreshold ? "GRATIS" : `$${shippingCost}`}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total:</span>
                            <span style={{ color: store.primary_color }} className="text-2xl">
                              ${(totalPrice + (totalPrice >= freeShippingThreshold ? 0 : shippingCost)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          size="lg"
                          style={{ backgroundColor: store.primary_color }}
                          onClick={() => {
                            setIsCartOpen(false);
                            navigate(`/tienda/${slug}/checkout`);
                          }}
                        >
                          Proceder al Pago
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Banner */}
      {store.banner_url && (
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img 
            src={store.banner_url} 
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      {/* Store Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 
            className="text-3xl md:text-5xl font-bold mb-4 font-heading"
            style={{ color: store.primary_color }}
          >
            {store.name}
          </h2>
          {store.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {store.description}
            </p>
          )}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: store.primary_color }} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">Esta tienda aún no tiene productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all duration-300"
              >
                <div 
                  className="relative aspect-square overflow-hidden cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Image count indicator */}
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
                      toggleWishlist(product);
                    }}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
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
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-medium truncate">{product.name}</h3>
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
                  <Button 
                    className="w-full"
                    style={{ backgroundColor: store.primary_color }}
                    onClick={() => addItem(product)}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedProduct && (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-6 bg-muted/30">
                <ProductGallery
                  mainImage={selectedProduct.image}
                  images={selectedProduct.images || []}
                  productName={selectedProduct.name}
                  primaryColor={store.primary_color}
                />
              </div>
              <div className="p-6 space-y-4">
                <div>
                  {selectedProduct.isNew && (
                    <Badge className="mb-2" style={{ backgroundColor: store.primary_color }}>
                      Nuevo
                    </Badge>
                  )}
                  {selectedProduct.isOnSale && selectedProduct.originalPrice && (
                    <Badge className="mb-2 ml-2 bg-red-500">
                      Oferta
                    </Badge>
                  )}
                  <h2 className="text-2xl font-heading font-bold mt-2">{selectedProduct.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedProduct.collection}</p>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold" style={{ color: store.primary_color }}>
                    ${selectedProduct.price.toLocaleString()}
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {selectedProduct.description && (
                  <p className="text-muted-foreground">{selectedProduct.description}</p>
                )}

                {selectedProduct.features && selectedProduct.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Características:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {selectedProduct.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className={selectedProduct.stock > 0 ? "text-green-600" : "text-red-500"}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} en stock` : "Agotado"}
                  </span>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    size="lg"
                    style={{ backgroundColor: store.primary_color }}
                    onClick={() => {
                      addItem(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    disabled={selectedProduct.stock === 0}
                  >
                    {selectedProduct.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => toggleWishlist(selectedProduct)}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isInWishlist(selectedProduct.id) ? 'fill-red-500 text-red-500' : ''}`}
                    />
                  </Button>
                </div>

                {/* Reviews Section */}
                <div className="border-t pt-6 mt-6">
                  <ProductReviews productId={selectedProduct.id} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WhatsApp Button */}
      {store.phone && (
        <WhatsAppButton 
          phone={store.phone} 
          storeName={store.name}
          primaryColor={store.primary_color}
        />
      )}

      {/* Footer */}
      <footer 
        className="border-t py-8 mt-16"
        style={{ borderColor: `${store.primary_color}30` }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
          </p>
          {(store.instagram_url || store.facebook_url) && (
            <div className="flex justify-center gap-4 mt-4">
              {store.instagram_url && (
                <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Instagram
                </a>
              )}
              {store.facebook_url && (
                <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;
