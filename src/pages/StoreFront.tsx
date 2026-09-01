import { useParams, useNavigate } from "react-router-dom";
import { useStore, useStoreProducts } from "@/hooks/useStores";
import { useStoreLayout } from "@/hooks/useStoreLayout";
import { useStoreDarkMode } from "@/hooks/useStoreDarkMode";
import { useStoreAccentSync } from "@/hooks/useStoreAccentSync";

import StoreDarkModeToggle from "@/components/store/StoreDarkModeToggle";

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
  PremiumHeroSection,
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
  PremiumTestimonialsSection,
  PremiumBannerSection,
  PremiumCategoriesSection,
  PremiumFooterSection,
  BrandLogosSection,
} from "@/components/store/sections";
import PremiumStoreHeader from "@/components/store/PremiumStoreHeader";
import { PremiumProductsGridSection } from "@/components/store/sections/PremiumProductsGridSection";
import { PremiumProductModal } from "@/components/store/PremiumProductModal";
import SectionWrapper from "@/components/store/SectionWrapper";
import SEOHead from "@/components/SEOHead";
import TrustBar from "@/components/store/TrustBar";
import SafePurchaseSection from "@/components/store/SafePurchaseSection";
import PurchaseFAQSection from "@/components/store/PurchaseFAQSection";
import MobileCartBar from "@/components/store/MobileCartBar";

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
  const { mode: storeDarkMode, isDark: isStoreDark, cycle: cycleStoreDark } = useStoreDarkMode();

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <motion.div
              className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Store className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.div
              className="absolute -inset-3 rounded-3xl border-2 border-primary/20"
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <div className="space-y-2 text-center">
            <motion.div className="h-4 w-32 bg-muted rounded-full mx-auto" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.div className="h-3 w-48 bg-muted/60 rounded-full mx-auto" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-md px-6"
        >
          <motion.div
            className="mx-auto h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Store className="h-10 w-10 text-destructive/60" />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Tienda no encontrada</h1>
            <p className="text-muted-foreground text-lg">La tienda que buscas no existe o no está disponible en este momento.</p>
          </div>
          <Button size="lg" className="rounded-xl shadow-lg" onClick={() => navigate("/")}>
            <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
            Volver al inicio
          </Button>
        </motion.div>
      </div>
    );
  }

  const shippingCost = store.shipping_cost || 99;
  const freeShippingThreshold = store.free_shipping_threshold || 999;

  // Generate store URL for sharing
  const storeUrl = `${window.location.origin}/tienda/${slug}`;

  return (
    <div 
      data-store-accent={globalStyles.accentPalette || 'champagne'}
      className={`min-h-screen bg-background transition-colors duration-500 ${isStoreDark ? 'store-dark' : ''}`}
      data-btn-anim={globalStyles.buttonAnimation || 'lift'}
      style={{ 
        fontFamily: 'var(--store-body-font, inherit)',
      }}
    >
      <StoreDarkModeToggle
        mode={storeDarkMode}
        isDark={isStoreDark}
        onCycle={cycleStoreDark}
        className="fixed bottom-6 right-6 z-50"
      />

      {/* Dynamic SEO for store */}
      <SEOHead
        title={`${store.name} - Tienda Online`}
        description={store.description || `Visita ${store.name} y descubre nuestros productos exclusivos.`}
        image={store.logo_url || store.banner_url || "/og-image.png"}
        url={storeUrl}
        type="website"
      />
      {/* Premium Store Header */}
      <PremiumStoreHeader
        store={store}
        slug={slug || ""}
        planTier={planTier}
        onSearchChange={(search) => setFilters(prev => ({ ...prev, search }))}
        searchValue={filters.search}
        showSearch={true}
        collections={collections}
        onCollectionSelect={(collection) => setFilters(prev => ({ ...prev, collection }))}
        selectedCollection={filters.collection}
      />

      {/* Trust signals - boosts conversion */}
      <TrustBar
        primaryColor={store.primary_color}
        freeShippingThreshold={freeShippingThreshold}
      />


      {/* Dynamic Sections */}
      <div className="relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        
        <div className="container mx-auto px-4 py-8 relative">
          {productsLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${store.primary_color}15` }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-6 h-6" style={{ color: store.primary_color }} />
                </motion.div>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl bg-muted/40 aspect-[3/4]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: [0.3, 0.6, 0.3], y: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
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
                      <PremiumHeroSection
                        section={section}
                        store={store}
                        planTier={planTier}
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
                      <PremiumBannerSection
                        section={section}
                        store={store}
                        planTier={planTier}
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
                      <PremiumTestimonialsSection
                        section={section}
                        store={store}
                        planTier={planTier}
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

                case 'brand_logos':
                  return (
                    <SectionWrapper key={section.id} section={section} primaryColor={store.primary_color}>
                      <BrandLogosSection
                        planTier={planTier}
                        title={section.settings?.title || "Marcas que confían en nosotros"}
                        subtitle={section.settings?.subtitle || "Colaboramos con las mejores marcas del mercado"}
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
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="mx-auto h-24 w-24 rounded-3xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${store.primary_color}10` }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Package className="h-12 w-12" style={{ color: `${store.primary_color}60` }} />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Próximamente</h3>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Estamos preparando productos increíbles para ti. ¡Vuelve pronto!
                </p>
              </motion.div>
            )}
          </div>
        )}
        </div>
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

      {/* WhatsApp Button — context-aware */}
      {(store as any).whatsapp_number && (
        <WhatsAppButton 
          phone={(store as any).whatsapp_number} 
          storeName={store.name}
          primaryColor={store.primary_color}
          message={
            selectedProduct
              ? `¡Hola! Estoy viendo el producto "${selectedProduct.name}" ($${selectedProduct.price.toLocaleString()}) en ${store.name} y me gustaría más información.`
              : undefined
          }
          productName={selectedProduct?.name}
        />
      )}

      {/* Compra Segura - garantías de confianza */}
      <SafePurchaseSection primaryColor={store.primary_color} storeName={store.name} />

      {/* FAQ - reduce dudas antes de pagar */}
      <PurchaseFAQSection
        primaryColor={store.primary_color}
        storeName={store.name}
        policies={{
          faq_returns: (store as any).faq_returns,
          faq_shipping: (store as any).faq_shipping,
          faq_refunds: (store as any).faq_refunds,
          faq_payments: (store as any).faq_payments,
          faq_support: (store as any).faq_support,
        }}
      />

      {/* Premium Footer */}
      <PremiumFooterSection store={store} planTier={planTier} />

      {/* Mobile sticky cart bar - conversion booster */}
      <MobileCartBar
        slug={slug || ""}
        primaryColor={store.primary_color}
        freeShippingThreshold={freeShippingThreshold}
      />
    </div>
  );
};

export default StoreFront;
