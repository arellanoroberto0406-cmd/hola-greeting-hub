import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMyStore, useCreateStore, useUpdateStore, useStoreProducts } from "@/hooks/useStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, Plus, Trash2, Edit2, Save, Upload, ImageIcon, Image, ShoppingBag, BarChart3, Tag, MessageCircle, Info, Link2, Wallet, PieChart, RotateCcw, MessagesSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useStoreAssets } from "@/hooks/useStoreAssets";
import OrdersPanel from "@/components/dashboard/OrdersPanel";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import CouponsPanel from "@/components/dashboard/CouponsPanel";
import AdvancedSettingsPanel from "@/components/dashboard/AdvancedSettingsPanel";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";
import StoreEditorPanel from "@/components/dashboard/StoreEditorPanel";
import { TutorialOverlay } from "@/components/dashboard/TutorialOverlay";
import PaymentSettingsPanel from "@/components/dashboard/PaymentSettingsPanel";
import PaymentStatsPanel from "@/components/dashboard/PaymentStatsPanel";
import RefundsHistoryPanel from "@/components/dashboard/RefundsHistoryPanel";
import StoreUrlPanel from "@/components/dashboard/StoreUrlPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import { useUnreadCount } from "@/hooks/useChat";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PlanLimitsCard from "@/components/dashboard/PlanLimitsCard";
import SubscriptionExpiryBanner from "@/components/dashboard/SubscriptionExpiryBanner";
import { useStoreOrdersStats } from "@/hooks/useStoreOrders";
import { useStorePlanTier } from "@/hooks/useStorePlanTier";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const { data: store, isLoading: storeLoading, refetch: refetchStore } = useMyStore(user?.id);
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useStoreProducts(store?.id);
  const { data: unreadCount = 0 } = useUnreadCount(store?.id);
  const { data: orderStats } = useStoreOrdersStats(store?.id);
  const { planTier } = useStorePlanTier(store?.id);
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const { uploadImage, uploading } = useImageUpload();
  const { uploadStoreAsset, uploading: uploadingAsset } = useStoreAssets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Active tab state (replaces Tabs component)
  const [activeTab, setActiveTab] = useState("orders");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Store form state
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storePrimaryColor, setStorePrimaryColor] = useState("#8B4513");
  const [storeSecondaryColor, setStoreSecondaryColor] = useState("#D4A574");
  const [storeShippingCost, setStoreShippingCost] = useState(99);
  const [storeFreeShippingThreshold, setStoreFreeShippingThreshold] = useState(999);
  const [storePhone, setStorePhone] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeFacebook, setStoreFacebook] = useState("");
  const [storeWhatsapp, setStoreWhatsapp] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [storeBanner, setStoreBanner] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Product form state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOriginalPrice, setProductOriginalPrice] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [productCollection, setProductCollection] = useState("");
  const [productStock, setProductStock] = useState("10");
  const [productDescription, setProductDescription] = useState("");
  const [productIsNew, setProductIsNew] = useState(false);
  const [productIsOnSale, setProductIsOnSale] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  
  useEffect(() => {
    if (store) {
      const tutorialSeen = localStorage.getItem('dashboard_tutorial_seen');
      if (!tutorialSeen) {
        const timer = setTimeout(() => setShowTutorial(true), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [store]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (store) {
      setStoreName(store.name);
      setStoreSlug(store.slug);
      setStoreDescription(store.description || "");
      setStorePrimaryColor(store.primary_color);
      setStoreSecondaryColor(store.secondary_color);
      setStoreShippingCost(store.shipping_cost);
      setStoreFreeShippingThreshold(store.free_shipping_threshold);
      setStorePhone(store.phone || "");
      setStoreEmail(store.email || "");
      setStoreInstagram(store.instagram_url || "");
      setStoreFacebook(store.facebook_url || "");
      setStoreWhatsapp(store.whatsapp_number || "");
      setStoreLogo(store.logo_url || "");
      setStoreBanner(store.banner_url || "");
    }
  }, [store]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleCreateStore = async () => {
    if (!user || !storeName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Por favor ingresa un nombre para tu tienda" });
      return;
    }
    setIsSaving(true);
    try {
      await createStore.mutateAsync({
        owner_id: user.id, name: storeName, slug: storeSlug || generateSlug(storeName),
        description: storeDescription, primary_color: storePrimaryColor, secondary_color: storeSecondaryColor,
        accent_color: "#2F1810", shipping_cost: storeShippingCost, free_shipping_threshold: storeFreeShippingThreshold,
        phone: storePhone, email: storeEmail, instagram_url: storeInstagram, facebook_url: storeFacebook, is_active: true,
      });
      toast({ title: "¡Tienda creada!", description: "Tu tienda ha sido creada exitosamente." });
      refetchStore();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message.includes("duplicate key") ? "Este slug ya está en uso." : error.message });
    }
    setIsSaving(false);
  };

  const handleUpdateStore = async () => {
    if (!store) return;
    setIsSaving(true);
    try {
      await updateStore.mutateAsync({
        id: store.id, name: storeName, slug: storeSlug, description: storeDescription,
        primary_color: storePrimaryColor, secondary_color: storeSecondaryColor,
        shipping_cost: storeShippingCost, free_shipping_threshold: storeFreeShippingThreshold,
        phone: storePhone, email: storeEmail, instagram_url: storeInstagram, facebook_url: storeFacebook,
        whatsapp_number: storeWhatsapp || null, logo_url: storeLogo || null, banner_url: storeBanner || null,
      });
      toast({ title: "Cambios guardados", description: "Tu tienda ha sido actualizada." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
    setIsSaving(false);
  };

  const resetProductForm = () => {
    setEditingProduct(null); setProductName(""); setProductPrice(""); setProductOriginalPrice("");
    setProductImage(""); setProductImages([]); setProductCollection(""); setProductStock("10");
    setProductDescription(""); setProductIsNew(false); setProductIsOnSale(false);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product); setProductName(product.name); setProductPrice(String(product.price));
    setProductOriginalPrice(product.original_price ? String(product.original_price) : "");
    setProductImage(product.image); setProductImages(product.images || []); setProductCollection(product.collection);
    setProductStock(String(product.stock)); setProductDescription(product.description || "");
    setProductIsNew(product.is_new || false); setProductIsOnSale(product.is_on_sale || false);
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!store || !productName || !productPrice || !productImage) {
      toast({ variant: "destructive", title: "Error", description: "Por favor completa los campos requeridos" });
      return;
    }
    setIsSavingProduct(true);
    try {
      const productData = {
        store_id: store.id, name: productName, price: parseFloat(productPrice),
        original_price: productOriginalPrice ? parseFloat(productOriginalPrice) : null,
        image: productImage, images: productImages, collection: productCollection || "General",
        stock: parseInt(productStock) || 10, description: productDescription, is_new: productIsNew, is_on_sale: productIsOnSale,
      };
      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Producto actualizado" });
      } else {
        const { error } = await supabase.from("products").insert([productData]);
        if (error) throw error;
        toast({ title: "Producto creado" });
      }
      setIsProductDialogOpen(false); resetProductForm(); refetchProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
    setIsSavingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;
      toast({ title: "Producto eliminado" }); refetchProducts();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const handleNavigateToSubscription = () => {
    setActiveTab("subscription");
  };

  // Render active panel content
  const renderPanel = () => {
    if (!store) return null;

    switch (activeTab) {
      case "orders":
        return (
          <div className="space-y-4">
            <SectionHeader title="Pedidos" tip="Haz clic en un pedido para ver los detalles. Cambia el estado entre: Pendiente, Confirmado, En proceso, Enviado y Entregado." />
            {products && products.length > 0 && (
              <LowStockAlert products={products.map(p => ({ id: p.id, name: p.name, stock: p.stock, image: p.image }))} lowStockThreshold={5} primaryColor={store.primary_color} />
            )}
            <OrdersPanel storeId={store.id} store={{ name: store.name, email: store.email, phone: store.phone, address: store.address, logo_url: store.logo_url, primary_color: store.primary_color }} />
          </div>
        );
      case "url":
        return (
          <div className="space-y-4">
            <SectionHeader title="URL de tu Tienda" tip="Personaliza tu URL, copia el enlace o genera un código QR para compartir." />
            <StoreUrlPanel storeId={store.id} currentSlug={store.slug} storeName={store.name} primaryColor={store.primary_color} onSlugUpdate={() => refetchStore()} />
          </div>
        );
      case "payments":
        return (
          <div className="space-y-4">
            <SectionHeader title="Métodos de Pago" tip="Activa o desactiva métodos de pago. Configura datos bancarios, PayPal o instrucciones de efectivo." />
            <PaymentSettingsPanel storeId={store.id} primaryColor={store.primary_color} />
          </div>
        );
      case "payment-stats":
        return (
          <div className="space-y-4">
            <SectionHeader title="Estadísticas de Ventas" tip="Analiza tus ventas por método de pago y compara el rendimiento semanal." />
            <PaymentStatsPanel storeId={store.id} primaryColor={store.primary_color} />
          </div>
        );
      case "refunds":
        return (
          <div className="space-y-4">
            <SectionHeader title="Historial de Reembolsos" tip="Consulta todos los reembolsos procesados con fechas y montos." />
            <RefundsHistoryPanel storeId={store.id} />
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-4">
            <SectionHeader title="Analytics" tip="Revisa ingresos, pedidos del mes, productos más vendidos y distribución de estados." />
            <AnalyticsPanel storeId={store.id} />
          </div>
        );
      case "coupons":
        return (
          <div className="space-y-4">
            <SectionHeader title="Cupones" tip="Crea cupones con descuento fijo o porcentual. Configura mínimo de compra y límite de usos." />
            <CouponsPanel storeId={store.id} />
          </div>
        );
      case "editor":
        return (
          <div className="space-y-4">
            <SectionHeader title="Editor de Tienda" tip="Arrastra secciones para reordenarlas, edita contenido y usa plantillas predefinidas." />
            <StoreEditorPanel store={store} />
          </div>
        );
      case "subscription":
        return (
          <div className="space-y-6">
            <SectionHeader title="Mi Suscripción" tip="Compara los planes y sus beneficios. Los planes premium incluyen más productos, analytics y cupones." />
            <PlanLimitsCard storeId={store.id} productCount={products?.length || 0} orderCount={orderStats?.thisMonthOrders || 0} primaryColor={store.primary_color} onUpgrade={() => {
              const plansSection = document.querySelector('[data-plans-section]');
              if (plansSection) plansSection.scrollIntoView({ behavior: 'smooth' });
            }} />
            <div data-plans-section><SubscriptionPanel storeId={store.id} primaryColor={store.primary_color} /></div>
          </div>
        );
      case "products":
        return renderProductsPanel();
      case "settings":
        return renderSettingsPanel();
      case "chat":
        return (
          <div className="space-y-4">
            <SectionHeader title="Chat en Vivo" tip="Responde a tus clientes en tiempo real. Los mensajes se actualizan automáticamente." />
            <ChatPanel storeId={store.id} primaryColor={store.primary_color} />
          </div>
        );
      default:
        return null;
    }
  };

  const renderProductsPanel = () => {
    if (!store) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Productos" tip="Agrega productos con múltiples imágenes, precios, colecciones y marca como Nuevo o En oferta." />
          <Dialog open={isProductDialogOpen} onOpenChange={(open) => { setIsProductDialogOpen(open); if (!open) resetProductForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" style={{ backgroundColor: store.primary_color }}>
                <Plus className="h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Nombre *</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Nombre del producto" /></div>
                  <div className="space-y-2"><Label>Colección</Label><Input value={productCollection} onChange={(e) => setProductCollection(e.target.value)} placeholder="General" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Precio *</Label><Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} placeholder="0" /></div>
                  <div className="space-y-2"><Label>Precio original</Label><Input type="number" value={productOriginalPrice} onChange={(e) => setProductOriginalPrice(e.target.value)} placeholder="Opcional" /></div>
                  <div className="space-y-2"><Label>Stock</Label><Input type="number" value={productStock} onChange={(e) => setProductStock(e.target.value)} placeholder="10" /></div>
                </div>
                <div className="space-y-3">
                  <Label>Imágenes del producto *</Label>
                  <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden"
                    onChange={async (e) => {
                      const files = e.target.files;
                      if (files && user) {
                        for (const file of Array.from(files)) {
                          const url = await uploadImage(file, user.id);
                          if (url) { if (!productImage) { setProductImage(url); } else { setProductImages(prev => [...prev, url]); } }
                        }
                      }
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploading ? "Subiendo..." : "Subir imágenes"}
                  </Button>
                  <div className="grid grid-cols-4 gap-2">
                    {productImage ? (
                      <div className="relative aspect-square group">
                        <img src={productImage} alt="Principal" className="w-full h-full object-cover rounded-lg border-2 border-primary" />
                        <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">Principal</div>
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { if (productImages.length > 0) { setProductImage(productImages[0]); setProductImages(prev => prev.slice(1)); } else { setProductImage(""); } }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground"><ImageIcon className="h-6 w-6" /></div>
                    )}
                    {productImages.map((img, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img src={img} alt={`Imagen ${index + 2}`} className="w-full h-full object-cover rounded-lg border" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))}><Trash2 className="h-3 w-3" /></Button>
                        <Button type="button" variant="secondary" size="icon" className="absolute bottom-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" title="Hacer principal"
                          onClick={() => { const newMain = productImages[index]; const newImages = [...productImages]; newImages[index] = productImage; setProductImage(newMain); setProductImages(newImages); }}>★</Button>
                      </div>
                    ))}
                    {(productImage || productImages.length > 0) && productImages.length < 7 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"><Plus className="h-6 w-6" /></button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Sube hasta 8 imágenes. La primera será la imagen principal.</p>
                </div>
                <div className="space-y-2"><Label>Descripción</Label><Textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} placeholder="Descripción del producto..." /></div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2"><Switch checked={productIsNew} onCheckedChange={setProductIsNew} /><Label>Nuevo</Label></div>
                  <div className="flex items-center gap-2"><Switch checked={productIsOnSale} onCheckedChange={setProductIsOnSale} /><Label>En oferta</Label></div>
                </div>
                <Button onClick={handleSaveProduct} className="w-full" disabled={isSavingProduct}>
                  {isSavingProduct && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {productsLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map((product: any) => (
              <Card key={product.id} className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
                <div className="aspect-square relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  {product.is_new && <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Nuevo</span>}
                  {product.is_on_sale && <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">Oferta</span>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-primary font-bold">${product.price}</p>
                    {product.original_price && <p className="text-sm text-muted-foreground line-through">${product.original_price}</p>}
                  </div>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditProduct(product)}>
                      <Edit2 className="h-4 w-4 mr-1" />Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-border/50">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-2">No tienes productos</h3>
            <p className="text-muted-foreground mb-4">Agrega tu primer producto para empezar a vender</p>
          </Card>
        )}
      </div>
    );
  };

  const renderSettingsPanel = () => {
    if (!store) return null;
    return (
      <div className="space-y-6">
        <SectionHeader title="Configuración" tip="Ajusta logo, banner, colores, datos de contacto y redes sociales." />
        
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Identidad Visual</CardTitle>
            <CardDescription>Logo, banner y colores de tu marca</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Logo de la tienda</Label>
                <input type="file" ref={logoInputRef} accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" className="hidden"
                  onChange={async (e) => { const file = e.target.files?.[0]; if (file && store) { const url = await uploadStoreAsset(file, store.id, 'logo'); if (url) setStoreLogo(url); } if (logoInputRef.current) logoInputRef.current.value = ""; }} />
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors" onClick={() => logoInputRef.current?.click()}>
                    {storeLogo ? <img src={storeLogo} alt="Logo" className="w-full h-full object-contain p-2" /> : <Image className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()} disabled={uploadingAsset}>
                      {uploadingAsset ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}Subir logo
                    </Button>
                    {storeLogo && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setStoreLogo("")}><Trash2 className="h-4 w-4 mr-2" />Eliminar</Button>}
                    <p className="text-xs text-muted-foreground">200x200px, PNG o SVG</p>
                  </div>
                </div>
              </div>
              {/* Banner Upload */}
              <div className="space-y-3">
                <Label>Banner de la tienda</Label>
                <input type="file" ref={bannerInputRef} accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={async (e) => { const file = e.target.files?.[0]; if (file && store) { const url = await uploadStoreAsset(file, store.id, 'banner'); if (url) setStoreBanner(url); } if (bannerInputRef.current) bannerInputRef.current.value = ""; }} />
                <div className="w-full h-28 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors" onClick={() => bannerInputRef.current?.click()}>
                  {storeBanner ? <img src={storeBanner} alt="Banner" className="w-full h-full object-cover" /> : <div className="text-center space-y-1"><ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" /><p className="text-xs text-muted-foreground">Click para subir</p></div>}
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => bannerInputRef.current?.click()} disabled={uploadingAsset}>
                    {uploadingAsset ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}Subir banner
                  </Button>
                  {storeBanner && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setStoreBanner("")}><Trash2 className="h-4 w-4 mr-2" />Eliminar</Button>}
                </div>
                <p className="text-xs text-muted-foreground">1920x400px, JPG o PNG</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-lg">Información General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nombre de la tienda</Label><Input value={storeName} onChange={(e) => setStoreName(e.target.value)} /></div>
              <div className="space-y-2"><Label>URL</Label><div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">/tienda/</span><Input value={storeSlug} onChange={(e) => setStoreSlug(generateSlug(e.target.value))} /></div></div>
            </div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Color principal</Label><div className="flex gap-2"><Input type="color" value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} /></div></div>
              <div className="space-y-2"><Label>Color secundario</Label><div className="flex gap-2"><Input type="color" value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Costo de envío</Label><Input type="number" value={storeShippingCost} onChange={(e) => setStoreShippingCost(Number(e.target.value))} /></div>
              <div className="space-y-2"><Label>Envío gratis desde</Label><Input type="number" value={storeFreeShippingThreshold} onChange={(e) => setStoreFreeShippingThreshold(Number(e.target.value))} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Contacto y Redes Sociales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <Label className="font-medium text-green-700 dark:text-green-400">WhatsApp Business</Label>
              </div>
              <Input value={storeWhatsapp} onChange={(e) => setStoreWhatsapp(e.target.value)} placeholder="+52 55 1234 5678" className="bg-white dark:bg-background" />
              <p className="text-xs text-muted-foreground mt-2">Incluye el código de país (+52 México, +1 USA).</p>
              {storeWhatsapp && (
                <div className="flex items-center gap-2 mt-3 text-green-700 dark:text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /><span className="text-sm font-medium">Botón de WhatsApp activo</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Teléfono</Label><Input value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="+52 55 1234 5678" /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} placeholder="tienda@ejemplo.com" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Instagram</Label><Input value={storeInstagram} onChange={(e) => setStoreInstagram(e.target.value)} placeholder="https://instagram.com/tutienda" /></div>
              <div className="space-y-2"><Label>Facebook</Label><Input value={storeFacebook} onChange={(e) => setStoreFacebook(e.target.value)} placeholder="https://facebook.com/tutienda" /></div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleUpdateStore} className="w-full" disabled={isSaving} style={{ backgroundColor: store.primary_color }}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>

        <AdvancedSettingsPanel storeId={store.id} initialSettings={{
          accent_color: store.accent_color || "#2F1810", welcome_message: (store as any).welcome_message || "",
          announcement_text: (store as any).announcement_text || "", announcement_active: (store as any).announcement_active || false,
          show_reviews: (store as any).show_reviews ?? true, show_stock: (store as any).show_stock ?? true,
          currency: (store as any).currency || "MXN", tax_rate: (store as any).tax_rate || 0,
          min_order_amount: (store as any).min_order_amount || 0, twitter_url: (store as any).twitter_url || "",
          tiktok_url: (store as any).tiktok_url || "", website_url: (store as any).website_url || "",
          return_policy: (store as any).return_policy || "", shipping_info: (store as any).shipping_info || "",
        }} primaryColor={store.primary_color} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {store && <SubscriptionExpiryBanner storeId={store.id} primaryColor={store.primary_color} onUpgrade={handleNavigateToSubscription} />}
      
      {store ? (
        <DashboardHeader 
          storeName={store.name} storeSlug={store.slug} primaryColor={store.primary_color}
          onShowTutorial={() => setShowTutorial(true)} onSignOut={signOut}
          unreadCount={unreadCount} planTier={planTier}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />
      ) : (
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><Store className="h-6 w-6 text-primary" /><h1 className="font-heading text-xl">Mi Tienda</h1></div>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Salir</Button>
          </div>
        </header>
      )}

      {!store ? (
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto border-border/50">
            <CardHeader>
              <CardTitle>Crea tu Tienda</CardTitle>
              <CardDescription>Configura tu tienda para empezar a vender</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="store-name">Nombre de la tienda *</Label><Input id="store-name" value={storeName} onChange={(e) => { setStoreName(e.target.value); if (!storeSlug) setStoreSlug(generateSlug(e.target.value)); }} placeholder="Mi Tienda" /></div>
              <div className="space-y-2"><Label htmlFor="store-slug">URL de la tienda</Label><div className="flex items-center gap-2"><span className="text-muted-foreground text-sm">/tienda/</span><Input id="store-slug" value={storeSlug} onChange={(e) => setStoreSlug(generateSlug(e.target.value))} placeholder="mi-tienda" /></div></div>
              <div className="space-y-2"><Label htmlFor="store-description">Descripción</Label><Textarea id="store-description" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} placeholder="Describe tu tienda..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Color principal</Label><div className="flex gap-2"><Input type="color" value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} /></div></div>
                <div className="space-y-2"><Label>Color secundario</Label><div className="flex gap-2"><Input type="color" value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} className="w-12 h-10 p-1" /><Input value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} /></div></div>
              </div>
              <Button onClick={handleCreateStore} className="w-full" disabled={isSaving || !storeName.trim()}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Crear Tienda
              </Button>
            </CardContent>
          </Card>
        </main>
      ) : (
        <div className="flex w-full">
          <TooltipProvider delayDuration={300}>
            <DashboardSidebar 
              activeTab={activeTab} onTabChange={setActiveTab} primaryColor={store.primary_color}
              unreadCount={unreadCount} planTier={planTier}
              isMobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)}
            />
          </TooltipProvider>

          <main className="flex-1 min-w-0 overflow-x-hidden">
            <div className="p-4 md:p-6 lg:p-8 max-w-6xl">
              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
                <DashboardStats storeId={store.id} primaryColor={store.primary_color} productsCount={products?.length || 0} />
              </motion.div>

              {/* Active Panel */}
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                {renderPanel()}
              </motion.div>
            </div>
          </main>
        </div>
      )}

      {store && <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} primaryColor={store.primary_color} />}
    </div>
  );
};

// Helper component for section headers
const SectionHeader = ({ title, tip }: { title: string; tip: string }) => (
  <div className="flex items-center gap-2">
    <h2 className="text-xl font-heading font-bold">{title}</h2>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Info className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-sm">
        <p className="text-xs">{tip}</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

export default Dashboard;