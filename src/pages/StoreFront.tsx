import { useParams, useNavigate } from "react-router-dom";
import { useStore, useStoreProducts } from "@/hooks/useStores";
import { useStoreLayout } from "@/hooks/useStoreLayout";
import { useStorePlanTier } from "@/hooks/useStorePlanTier";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ShoppingCart, Heart, Menu, Eye, Search, User, Package, LogOut, Store, ChevronRight } from "lucide-react";
import WhatsAppButton from "@/components/WhatsAppButton";
import LiveChatWidget from "@/components/store/LiveChatWidget";
import ProductFilters, { FilterState } from "@/components/ProductFilters";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect, useCallback } from "react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X, Truck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import { motion } from "framer-motion";
import { StoreSection, GlobalStyles, DEFAULT_SECTIONS, DEFAULT_GLOBAL_STYLES, FONT_OPTIONS } from "@/types/storeLayout";
import {
  HeroSection,
  FeaturedProductsSection,
  BannerSection,
  NewsletterSection,
  AboutSection,
  ContactSection,
  CategoriesSection,
  ProductsGridSection,
  TestimonialsSection,
  ImageSliderSection,
  VideoSection,
  FAQSection,
  PremiumVideoSection,
  ParallaxHeroSection,
  AnimatedStatsSection,
  InteractiveGallerySection,
} from "@/components/store/sections";
import { PremiumProductsGridSection } from "@/components/store/sections/PremiumProductsGridSection";
import { PremiumProductModal } from "@/components/store/PremiumProductModal";
import SectionWrapper from "@/components/store/SectionWrapper";
import SEOHead from "@/components/SEOHead";

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
  const { data: layout } = useStoreLayout(store?.id);
  const { planTier } = useStorePlanTier(store?.id);
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
    storeId,
    setStoreId,
  } = useCart();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleAddToCart = (product: Product, color?: string, variant?: any) => {
    if (!store?.id) return;

    // Asociar el carrito a la tienda actual (si venía de otra tienda, reiniciamos)
    if (storeId && storeId !== store.id) {
      clearCart();
    }
    setStoreId(store.id);
    addItem(product, color, variant);
  };

  // Get sections and global styles from layout or use defaults
  const sections = useMemo(() => {
    return layout?.sections?.filter(s => s.enabled) || DEFAULT_SECTIONS.filter(s => s.enabled);
  }, [layout]);

  const globalStyles = useMemo(() => {
    return layout?.globalStyles || DEFAULT_GLOBAL_STYLES;
  }, [layout]);

  // All products mapped
  const allProducts = useMemo(() => {
    return (productsData || []).map(mapDbProduct);
  }, [productsData]);

  // Calculate max price for filters
  const maxPrice = useMemo(() => {
    if (allProducts.length === 0) return 10000;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 100) * 100;
  }, [allProducts]);

  // Get unique collections
  const collections = useMemo(() => {
    const uniqueCollections = [...new Set(allProducts.map(p => p.collection).filter(Boolean))];
    return uniqueCollections.sort();
  }, [allProducts]);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    collection: "all",
    sortBy: "default",
    priceRange: [0, maxPrice],
    showOnSale: false,
    showNew: false,
    showInStock: false,
  });

  // Update price range when maxPrice changes
  useEffect(() => {
    if (filters.priceRange[1] === 10000 && maxPrice !== 10000) {
      setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }));
    }
  }, [maxPrice]);

  // Filtered and sorted products
  const products = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.collection?.toLowerCase().includes(searchLower)
      );
    }

    // Collection filter
    if (filters.collection !== "all") {
      filtered = filtered.filter(p => p.collection === filters.collection);
    }

    // Price range filter
    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Quick filters
    if (filters.showOnSale) {
      filtered = filtered.filter(p => p.isOnSale);
    }
    if (filters.showNew) {
      filtered = filtered.filter(p => p.isNew);
    }
    if (filters.showInStock) {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Sorting
    switch (filters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return filtered;
  }, [allProducts, filters]);

  // Apply store colors and global styles as CSS variables
  useEffect(() => {
    if (store) {
      document.documentElement.style.setProperty('--store-primary', store.primary_color);
      document.documentElement.style.setProperty('--store-secondary', store.secondary_color);
      document.documentElement.style.setProperty('--store-accent', store.accent_color);
    }
    
    // Apply global styles
    const headingFontName = FONT_OPTIONS.find(f => f.value === globalStyles.headingFont)?.label || 'Oswald';
    const bodyFontName = FONT_OPTIONS.find(f => f.value === globalStyles.bodyFont)?.label || 'Montserrat';
    
    document.documentElement.style.setProperty('--store-heading-font', `'${headingFontName}', sans-serif`);
    document.documentElement.style.setProperty('--store-body-font', `'${bodyFontName}', sans-serif`);
    
    // Border radius
    const radiusMap: Record<string, string> = {
      none: '0px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    };
    document.documentElement.style.setProperty('--store-radius', radiusMap[globalStyles.borderRadius] || '12px');
    
    // Section spacing
    const spacingMap: Record<string, string> = {
      compact: '2rem',
      normal: '4rem',
      relaxed: '6rem',
      spacious: '8rem',
    };
    document.documentElement.style.setProperty('--store-section-spacing', spacingMap[globalStyles.sectionSpacing] || '4rem');
    
    // Card shadow
    const shadowMap: Record<string, string> = {
      none: 'none',
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    };
    document.documentElement.style.setProperty('--store-card-shadow', shadowMap[globalStyles.cardShadow] || shadowMap.md);
    
    return () => {
      document.documentElement.style.removeProperty('--store-primary');
      document.documentElement.style.removeProperty('--store-secondary');
      document.documentElement.style.removeProperty('--store-accent');
      document.documentElement.style.removeProperty('--store-heading-font');
      document.documentElement.style.removeProperty('--store-body-font');
      document.documentElement.style.removeProperty('--store-radius');
      document.documentElement.style.removeProperty('--store-section-spacing');
      document.documentElement.style.removeProperty('--store-card-shadow');
    };
  }, [store, globalStyles]);

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

  // Generate store URL for sharing
  const storeUrl = `${window.location.origin}/tienda/${slug}`;

  return (
    <div 
      className="min-h-screen bg-background"
      style={{ 
        fontFamily: 'var(--store-body-font, inherit)',
      }}
    >
      {/* Dynamic SEO for store */}
      <SEOHead
        title={`${store.name} - Tienda Online`}
        description={store.description || `Visita ${store.name} y descubre nuestros productos exclusivos.`}
        image={store.logo_url || store.banner_url || "/og-image.png"}
        url={storeUrl}
        type="website"
      />
      {/* Announcement Bar */}
      {(store as any).announcement_active && (store as any).announcement_text && (
        <div 
          className="py-2 px-4 text-center text-sm font-medium"
          style={{ 
            backgroundColor: store.primary_color,
            color: 'white'
          }}
        >
          {(store as any).announcement_text}
        </div>
      )}

      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
        style={{ 
          backgroundColor: `${store.primary_color}08`,
          borderColor: `${store.primary_color}20`
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo / Store Name */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/tienda/${slug}`)}
            >
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="h-10 md:h-12 w-auto" />
              ) : (
                <div className="flex items-center gap-2">
                  <div 
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: store.primary_color }}
                  >
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span 
                    className="font-heading text-xl md:text-2xl font-bold"
                    style={{ color: store.primary_color }}
                  >
                    {store.name}
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              <button
                onClick={() => setFilters(prev => ({ ...prev, collection: "all" }))}
                className={`text-sm font-medium transition-colors ${filters.collection === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Todos
              </button>
              {collections.slice(0, 5).map((collection) => (
                <button
                  key={collection}
                  onClick={() => setFilters(prev => ({ ...prev, collection }))}
                  className={`text-sm font-medium transition-colors ${filters.collection === collection ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {collection}
                </button>
              ))}
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 bg-muted/50 border-transparent focus:border-primary/50"
                />
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 rounded-xl"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Account */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback 
                          style={{ backgroundColor: store.primary_color }}
                          className="text-white text-xs"
                        >
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">Mi cuenta</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                      <Package className="h-4 w-4 mr-2" />
                      Mis pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/tienda/${slug}/cuenta`)}>
                      <Heart className="h-4 w-4 mr-2" />
                      Lista de deseos
                      {wishlist.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">{wishlist.length}</Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl"
                  onClick={() => navigate("/auth")}
                >
                  <User className="h-5 w-5" />
                </Button>
              )}

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10 rounded-xl"
                onClick={() => navigate(`/tienda/${slug}/cuenta`)}
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


      {/* Dynamic Sections */}
      <div className="container mx-auto px-4 py-8">
        {productsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: store.primary_color }} />
          </div>
        ) : (
          <div 
            className="flex flex-col"
            style={{ gap: 'var(--store-section-spacing, 4rem)' }}
          >
            {sections.map((section) => {
              switch (section.type) {
                case 'hero':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <HeroSection
                        section={section}
                        store={store}
                        onAction={() => {
                          const productsSection = document.getElementById('products-section');
                          productsSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    </SectionWrapper>
                  );

                case 'categories':
                  return collections.length > 0 ? (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <CategoriesSection
                        section={section}
                        store={store}
                        collections={collections}
                        onCollectionSelect={(collection) => {
                          setFilters(prev => ({ ...prev, collection }));
                          const productsSection = document.getElementById('products-section');
                          productsSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    </SectionWrapper>
                  ) : null;

                case 'featured_products':
                  return allProducts.length > 0 ? (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <FeaturedProductsSection
                        section={section}
                        store={store}
                        products={allProducts}
                        onProductClick={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                        onToggleWishlist={toggleWishlist}
                        isInWishlist={isInWishlist}
                        planTier={planTier}
                      />
                    </SectionWrapper>
                  ) : null;

                case 'banner':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <BannerSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'products_grid':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <div id="products-section">
                        <PremiumProductsGridSection
                          section={section}
                          store={store}
                          products={products}
                          allProducts={allProducts}
                          filters={filters}
                          onFiltersChange={setFilters}
                          collections={collections}
                          maxPrice={maxPrice}
                          onProductClick={setSelectedProduct}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={toggleWishlist}
                          isInWishlist={isInWishlist}
                          planTier={planTier}
                        />
                      </div>
                    </SectionWrapper>
                  );

                case 'newsletter':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <NewsletterSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'about':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <AboutSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'contact':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <ContactSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'testimonials':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <TestimonialsSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'image_slider':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <ImageSliderSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'video':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <VideoSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'faq':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <FAQSection
                        section={section}
                        store={store}
                      />
                    </SectionWrapper>
                  );

                case 'premium_video':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <PremiumVideoSection
                        section={section}
                        store={store}
                        planTier={planTier}
                      />
                    </SectionWrapper>
                  );

                case 'parallax_hero':
                  return (
                    <ParallaxHeroSection
                      key={section.id}
                      section={section}
                      store={store}
                      planTier={planTier}
                    />
                  );

                case 'animated_stats':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <AnimatedStatsSection
                        section={section}
                        store={store}
                        planTier={planTier}
                      />
                    </SectionWrapper>
                  );

                case 'interactive_gallery':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <InteractiveGallerySection
                        section={section}
                        store={store}
                        planTier={planTier}
                      />
                    </SectionWrapper>
                  );

                default:
                  return null;
              }
            })}

            {/* Show products grid if no sections have it */}
            {!sections.some(s => s.type === 'products_grid') && allProducts.length > 0 && (
              <div id="products-section">
                <ProductsGridSection
                  section={{
                    id: 'default-products',
                    type: 'products_grid',
                    title: 'Productos',
                    enabled: true,
                    settings: { showFilters: true, columns: 4 }
                  }}
                  store={store}
                  products={products}
                  allProducts={allProducts}
                  filters={filters}
                  onFiltersChange={setFilters}
                  collections={collections}
                  maxPrice={maxPrice}
                  onProductClick={setSelectedProduct}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={toggleWishlist}
                  isInWishlist={isInWishlist}
                />
              </div>
            )}

            {/* Empty state */}
            {allProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">Esta tienda aún no tiene productos</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Premium Product Detail Modal */}
      <PremiumProductModal
        product={selectedProduct}
        store={store}
        planTier={planTier}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={toggleWishlist}
        isInWishlist={selectedProduct ? isInWishlist(selectedProduct.id) : false}
      />

      {/* Live Chat Widget */}
      <LiveChatWidget 
        storeId={store.id}
        storeName={store.name}
        primaryColor={store.primary_color}
      />

      {/* WhatsApp Button */}
      {(store as any).whatsapp_number && (
        <WhatsAppButton 
          phone={(store as any).whatsapp_number} 
          storeName={store.name}
          primaryColor={store.primary_color}
        />
      )}

      {/* Footer */}
      <footer 
        className="border-t py-12 mt-16"
        style={{ borderColor: `${store.primary_color}30` }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Store Info */}
            <div className="text-center md:text-left">
              <h3 className="font-heading font-bold text-lg mb-3" style={{ color: store.primary_color }}>
                {store.name}
              </h3>
              {store.description && (
                <p className="text-sm text-muted-foreground">{store.description}</p>
              )}
            </div>

            {/* Policies */}
            <div className="text-center md:text-left">
              {((store as any).shipping_info || (store as any).return_policy) && (
                <>
                  <h4 className="font-medium mb-3">Información</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {(store as any).shipping_info && (
                      <p><strong>Envíos:</strong> {(store as any).shipping_info.substring(0, 100)}{(store as any).shipping_info.length > 100 ? '...' : ''}</p>
                    )}
                    {(store as any).return_policy && (
                      <p><strong>Devoluciones:</strong> {(store as any).return_policy.substring(0, 100)}{(store as any).return_policy.length > 100 ? '...' : ''}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Social Links */}
            <div className="text-center md:text-right">
              <h4 className="font-medium mb-3">Síguenos</h4>
              <div className="flex justify-center md:justify-end gap-4 flex-wrap">
                {store.instagram_url && (
                  <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Instagram
                  </a>
                )}
                {store.facebook_url && (
                  <a href={store.facebook_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Facebook
                  </a>
                )}
                {store.twitter_url && (
                  <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Twitter
                  </a>
                )}
                {store.tiktok_url && (
                  <a href={store.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    TikTok
                  </a>
                )}
                {(store as any).website_url && (
                  <a href={(store as any).website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Web
                  </a>
                )}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                {store.email && (
                  <p>
                    📧 {store.email}
                  </p>
                )}
                {(store as any).whatsapp_number && (
                  <a 
                    href={`https://wa.me/${(store as any).whatsapp_number.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center md:justify-end gap-2 text-green-600 hover:text-green-700 transition-colors font-medium"
                  >
                    💬 WhatsApp: {(store as any).whatsapp_number}
                  </a>
                )}
                {store.phone && (
                  <p>
                    📞 {store.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-6 text-center" style={{ borderColor: `${store.primary_color}20` }}>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StoreFront;
