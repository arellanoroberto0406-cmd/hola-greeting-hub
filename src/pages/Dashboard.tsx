import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMyStore, useCreateStore, useUpdateStore, useStoreProducts } from "@/hooks/useStores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, Settings, ExternalLink, LogOut, Plus, Trash2, Edit2, Save, Upload, ImageIcon, Image, ShoppingBag, BarChart3, Tag, MessageCircle, CreditCard, Layers, HelpCircle, Info, Link2, Wallet, PieChart, RotateCcw, MessagesSquare, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
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
import { TutorialOverlay, TutorialHelpButton } from "@/components/dashboard/TutorialOverlay";
import PaymentSettingsPanel from "@/components/dashboard/PaymentSettingsPanel";
import PaymentStatsPanel from "@/components/dashboard/PaymentStatsPanel";
import RefundsHistoryPanel from "@/components/dashboard/RefundsHistoryPanel";
import StoreUrlPanel from "@/components/dashboard/StoreUrlPanel";
import ChatPanel from "@/components/dashboard/ChatPanel";
import { useUnreadCount } from "@/hooks/useChat";
import { Badge } from "@/components/ui/badge";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PlanLimitsCard from "@/components/dashboard/PlanLimitsCard";
import { useStoreOrdersStats } from "@/hooks/useStoreOrders";
import { motion } from "framer-motion";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const { data: store, isLoading: storeLoading, refetch: refetchStore } = useMyStore(user?.id);
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useStoreProducts(store?.id);
  const { data: unreadCount = 0 } = useUnreadCount(store?.id);
  const { data: orderStats } = useStoreOrdersStats(store?.id);
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();
  const { uploadImage, uploading } = useImageUpload();
  const { uploadStoreAsset, uploading: uploadingAsset } = useStoreAssets();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
  
  // Check if tutorial should be shown on first visit
  useEffect(() => {
    if (store) {
      const tutorialSeen = localStorage.getItem('dashboard_tutorial_seen');
      if (!tutorialSeen) {
        // Small delay to let the dashboard render first
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un nombre para tu tienda",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createStore.mutateAsync({
        owner_id: user.id,
        name: storeName,
        slug: storeSlug || generateSlug(storeName),
        description: storeDescription,
        primary_color: storePrimaryColor,
        secondary_color: storeSecondaryColor,
        accent_color: "#2F1810",
        shipping_cost: storeShippingCost,
        free_shipping_threshold: storeFreeShippingThreshold,
        phone: storePhone,
        email: storeEmail,
        instagram_url: storeInstagram,
        facebook_url: storeFacebook,
        is_active: true,
      });
      toast({
        title: "¡Tienda creada!",
        description: "Tu tienda ha sido creada exitosamente.",
      });
      refetchStore();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message.includes("duplicate key") 
          ? "Este slug ya está en uso. Elige otro."
          : error.message,
      });
    }
    setIsSaving(false);
  };

  const handleUpdateStore = async () => {
    if (!store) return;

    setIsSaving(true);
    try {
      await updateStore.mutateAsync({
        id: store.id,
        name: storeName,
        slug: storeSlug,
        description: storeDescription,
        primary_color: storePrimaryColor,
        secondary_color: storeSecondaryColor,
        shipping_cost: storeShippingCost,
        free_shipping_threshold: storeFreeShippingThreshold,
        phone: storePhone,
        email: storeEmail,
        instagram_url: storeInstagram,
        facebook_url: storeFacebook,
        whatsapp_number: storeWhatsapp || null,
        logo_url: storeLogo || null,
        banner_url: storeBanner || null,
      });
      toast({
        title: "Cambios guardados",
        description: "Tu tienda ha sido actualizada.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setIsSaving(false);
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductName("");
    setProductPrice("");
    setProductOriginalPrice("");
    setProductImage("");
    setProductImages([]);
    setProductCollection("");
    setProductStock("10");
    setProductDescription("");
    setProductIsNew(false);
    setProductIsOnSale(false);
  };

  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductPrice(String(product.price));
    setProductOriginalPrice(product.original_price ? String(product.original_price) : "");
    setProductImage(product.image);
    setProductImages(product.images || []);
    setProductCollection(product.collection);
    setProductStock(String(product.stock));
    setProductDescription(product.description || "");
    setProductIsNew(product.is_new || false);
    setProductIsOnSale(product.is_on_sale || false);
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!store || !productName || !productPrice || !productImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa los campos requeridos",
      });
      return;
    }

    setIsSavingProduct(true);
    try {
      const productData = {
        store_id: store.id,
        name: productName,
        price: parseFloat(productPrice),
        original_price: productOriginalPrice ? parseFloat(productOriginalPrice) : null,
        image: productImage,
        images: productImages,
        collection: productCollection || "General",
        stock: parseInt(productStock) || 10,
        description: productDescription,
        is_new: productIsNew,
        is_on_sale: productIsOnSale,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Producto actualizado" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);
        if (error) throw error;
        toast({ title: "Producto creado" });
      }

      setIsProductDialogOpen(false);
      resetProductForm();
      refetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setIsSavingProduct(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      toast({ title: "Producto eliminado" });
      refetchProducts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (authLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground text-sm">Cargando dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {store ? (
        <DashboardHeader 
          storeName={store.name}
          storeSlug={store.slug}
          primaryColor={store.primary_color}
          onShowTutorial={() => setShowTutorial(true)}
          onSignOut={signOut}
          unreadCount={unreadCount}
        />
      ) : (
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="h-6 w-6 text-primary" />
              <h1 className="font-heading text-xl">Mi Tienda</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </header>
      )}

      <main className="container mx-auto px-4 py-6 md:py-8">
        {!store ? (
          // Create Store Form
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Crea tu Tienda</CardTitle>
              <CardDescription>
                Configura tu tienda para empezar a vender
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Nombre de la tienda *</Label>
                <Input
                  id="store-name"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (!storeSlug) setStoreSlug(generateSlug(e.target.value));
                  }}
                  placeholder="Mi Tienda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-slug">URL de la tienda</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">/tienda/</span>
                  <Input
                    id="store-slug"
                    value={storeSlug}
                    onChange={(e) => setStoreSlug(generateSlug(e.target.value))}
                    placeholder="mi-tienda"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="store-description">Descripción</Label>
                <Textarea
                  id="store-description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Describe tu tienda..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Color principal</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primary-color"
                      value={storePrimaryColor}
                      onChange={(e) => setStorePrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={storePrimaryColor}
                      onChange={(e) => setStorePrimaryColor(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Color secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondary-color"
                      value={storeSecondaryColor}
                      onChange={(e) => setStoreSecondaryColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={storeSecondaryColor}
                      onChange={(e) => setStoreSecondaryColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCreateStore} 
                className="w-full"
                disabled={isSaving || !storeName.trim()}
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Crear Tienda
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Store Dashboard
          <TooltipProvider delayDuration={300}>
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <DashboardStats 
              storeId={store.id} 
              primaryColor={store.primary_color}
              productsCount={products?.length || 0}
            />
          </motion.div>

          <Tabs defaultValue="orders" className="space-y-6">
            {/* Modern Tab Navigation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <TabsList className="flex flex-wrap gap-1 bg-muted/30 p-1.5 rounded-xl border border-border/50 h-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <ShoppingBag className="h-4 w-4" />
                      <span className="hidden sm:inline">Pedidos</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Gestión de Pedidos</p>
                    <p className="text-xs text-muted-foreground">Ve todos los pedidos, actualiza estados y gestiona envíos</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="url" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Link2 className="h-4 w-4" />
                      <span className="hidden sm:inline">URL</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">URL de Tienda</p>
                    <p className="text-xs text-muted-foreground">Personaliza y comparte el enlace de tu tienda con código QR</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="payments" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Wallet className="h-4 w-4" />
                      <span className="hidden sm:inline">Pagos</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Métodos de Pago</p>
                    <p className="text-xs text-muted-foreground">Configura tarjetas, transferencias, PayPal y MercadoPago</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="payment-stats" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <PieChart className="h-4 w-4" />
                      <span className="hidden sm:inline">Ventas</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Estadísticas de Ventas</p>
                    <p className="text-xs text-muted-foreground">Gráficas de ingresos y pedidos por método de pago</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="refunds" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">Reembolsos</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Historial de Reembolsos</p>
                    <p className="text-xs text-muted-foreground">Ve todos los reembolsos procesados con fechas y montos</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="analytics" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Analytics</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Estadísticas</p>
                    <p className="text-xs text-muted-foreground">Analiza ventas, productos más vendidos y tendencias</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="coupons" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Tag className="h-4 w-4" />
                      <span className="hidden sm:inline">Cupones</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Cupones de Descuento</p>
                    <p className="text-xs text-muted-foreground">Crea códigos promocionales con descuentos fijos o porcentuales</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="products" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Package className="h-4 w-4" />
                      <span className="hidden sm:inline">Productos</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Catálogo de Productos</p>
                    <p className="text-xs text-muted-foreground">Agrega, edita y organiza tus productos con imágenes y precios</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="editor" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Layers className="h-4 w-4" />
                      <span className="hidden sm:inline">Editor</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Editor Visual</p>
                    <p className="text-xs text-muted-foreground">Personaliza el diseño de tu tienda con secciones arrastrables y estilos</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="subscription" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Plan</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Suscripción</p>
                    <p className="text-xs text-muted-foreground">Gestiona tu plan, límites de productos y funcionalidades premium</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="settings" className="gap-2 rounded-lg data-[state=active]:shadow-sm">
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Config</span>
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Configuración</p>
                    <p className="text-xs text-muted-foreground">Ajusta datos de contacto, envíos, colores y redes sociales</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TabsTrigger value="chat" className="gap-2 relative rounded-lg data-[state=active]:shadow-sm">
                      <MessagesSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat</span>
                      {unreadCount > 0 && (
                        <Badge 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          style={{ backgroundColor: store?.primary_color }}
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <p className="font-medium">Chat en Vivo</p>
                    <p className="text-xs text-muted-foreground">Responde a tus clientes en tiempo real</p>
                  </TooltipContent>
                </Tooltip>
              </TabsList>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
            <TabsContent value="orders">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-heading">Pedidos</h2>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-sm">
                          <p className="font-medium mb-1">💡 Consejo</p>
                          <p className="text-xs">Haz clic en un pedido para ver los detalles completos. Puedes cambiar el estado entre: Pendiente, Confirmado, En proceso, Enviado y Entregado.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    {/* Low Stock Alert */}
                    {products && products.length > 0 && (
                      <LowStockAlert 
                        products={products.map(p => ({ id: p.id, name: p.name, stock: p.stock, image: p.image }))}
                        lowStockThreshold={5}
                        primaryColor={store.primary_color}
                      />
                    )}
                    
                    <OrdersPanel 
                      storeId={store.id} 
                      store={{
                        name: store.name,
                        email: store.email,
                        phone: store.phone,
                        address: store.address,
                        logo_url: store.logo_url,
                        primary_color: store.primary_color,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="url">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">URL de tu Tienda</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">🔗 Comparte tu tienda</p>
                      <p className="text-xs">Personaliza tu URL, copia el enlace o genera un código QR para compartir en redes sociales, tarjetas de presentación o WhatsApp.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <StoreUrlPanel 
                  storeId={store.id} 
                  currentSlug={store.slug} 
                  storeName={store.name}
                  primaryColor={store.primary_color}
                  onSlugUpdate={(newSlug) => {
                    refetchStore();
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Métodos de Pago</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">💳 Configura tus pagos</p>
                      <p className="text-xs">Activa o desactiva métodos de pago. Configura datos bancarios para transferencias, PayPal para pagos en línea, o instrucciones para pago en efectivo.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <PaymentSettingsPanel storeId={store.id} primaryColor={store.primary_color} />
              </div>
            </TabsContent>

            <TabsContent value="payment-stats">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Estadísticas de Ventas</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">📊 Ingresos por método de pago</p>
                      <p className="text-xs">Analiza tus ventas por método de pago: tarjeta, transferencia, efectivo, PayPal y MercadoPago. Compara el rendimiento semanal.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <PaymentStatsPanel storeId={store.id} primaryColor={store.primary_color} />
              </div>
            </TabsContent>

            <TabsContent value="refunds">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Historial de Reembolsos</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">💰 Reembolsos procesados</p>
                      <p className="text-xs">Consulta todos los reembolsos realizados a través de MercadoPago. Ve el monto total reembolsado y el historial completo.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RefundsHistoryPanel storeId={store.id} />
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Analytics</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">📊 Métricas importantes</p>
                      <p className="text-xs">Revisa tus ingresos totales, pedidos del mes, productos más vendidos y la distribución de estados. Los datos se actualizan en tiempo real.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <AnalyticsPanel storeId={store.id} />
              </div>
            </TabsContent>

            <TabsContent value="coupons">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Cupones</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">🎟️ Crea promociones</p>
                      <p className="text-xs">Puedes crear cupones con descuento fijo ($100 off) o porcentual (20% off). Configura mínimo de compra, límite de usos y fecha de expiración.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CouponsPanel storeId={store.id} />
              </div>
            </TabsContent>

            <TabsContent value="editor">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Editor de Tienda</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">🎨 Personaliza tu tienda</p>
                      <p className="text-xs">Arrastra secciones para reordenarlas, edita contenido haciendo clic en ⚙️, usa plantillas predefinidas y ajusta los estilos globales como colores y tipografía.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <StoreEditorPanel store={store} />
              </div>
            </TabsContent>

            <TabsContent value="subscription">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Mi Suscripción</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">💳 Planes disponibles</p>
                      <p className="text-xs">Compara los planes disponibles y sus beneficios. Los planes premium incluyen más productos, analytics avanzados, cupones y dominio personalizado.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                
                {/* Plan Limits Card */}
                <PlanLimitsCard
                  storeId={store.id}
                  productCount={products?.length || 0}
                  orderCount={orderStats?.thisMonthOrders || 0}
                  primaryColor={store.primary_color}
                  onUpgrade={() => {
                    // Scroll to plans section
                    const plansSection = document.querySelector('[data-plans-section]');
                    if (plansSection) {
                      plansSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
                
                {/* Plans Section */}
                <div data-plans-section>
                  <SubscriptionPanel storeId={store.id} primaryColor={store.primary_color} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Productos</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">📦 Gestión de productos</p>
                      <p className="text-xs">Agrega productos con múltiples imágenes, configura precios originales para mostrar descuentos, organiza por colecciones y marca como "Nuevo" o "En oferta".</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre *</Label>
                          <Input
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            placeholder="Nombre del producto"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Colección</Label>
                          <Input
                            value={productCollection}
                            onChange={(e) => setProductCollection(e.target.value)}
                            placeholder="General"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Precio *</Label>
                          <Input
                            type="number"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Precio original</Label>
                          <Input
                            type="number"
                            value={productOriginalPrice}
                            onChange={(e) => setProductOriginalPrice(e.target.value)}
                            placeholder="Opcional"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stock</Label>
                          <Input
                            type="number"
                            value={productStock}
                            onChange={(e) => setProductStock(e.target.value)}
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Imágenes del producto *</Label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="hidden"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files && user) {
                              for (const file of Array.from(files)) {
                                const url = await uploadImage(file, user.id);
                                if (url) {
                                  if (!productImage) {
                                    setProductImage(url);
                                  } else {
                                    setProductImages(prev => [...prev, url]);
                                  }
                                }
                              }
                            }
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {uploading ? "Subiendo..." : "Subir imágenes"}
                        </Button>
                        
                        {/* Image gallery preview */}
                        <div className="grid grid-cols-4 gap-2">
                          {/* Main image */}
                          {productImage ? (
                            <div className="relative aspect-square group">
                              <img 
                                src={productImage} 
                                alt="Principal" 
                                className="w-full h-full object-cover rounded-lg border-2 border-primary"
                              />
                              <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                                Principal
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  if (productImages.length > 0) {
                                    setProductImage(productImages[0]);
                                    setProductImages(prev => prev.slice(1));
                                  } else {
                                    setProductImage("");
                                  }
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-6 w-6" />
                            </div>
                          )}
                          
                          {/* Additional images */}
                          {productImages.map((img, index) => (
                            <div key={index} className="relative aspect-square group">
                              <img 
                                src={img} 
                                alt={`Imagen ${index + 2}`} 
                                className="w-full h-full object-cover rounded-lg border"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setProductImages(prev => prev.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute bottom-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Hacer principal"
                                onClick={() => {
                                  const newMain = productImages[index];
                                  const newImages = [...productImages];
                                  newImages[index] = productImage;
                                  setProductImage(newMain);
                                  setProductImages(newImages);
                                }}
                              >
                                ★
                              </Button>
                            </div>
                          ))}
                          
                          {/* Add more button */}
                          {(productImage || productImages.length > 0) && productImages.length < 7 && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                            >
                              <Plus className="h-6 w-6" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Sube hasta 8 imágenes. La primera será la imagen principal.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          placeholder="Descripción del producto..."
                        />
                      </div>
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={productIsNew}
                            onCheckedChange={setProductIsNew}
                          />
                          <Label>Nuevo</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={productIsOnSale}
                            onCheckedChange={setProductIsOnSale}
                          />
                          <Label>En oferta</Label>
                        </div>
                      </div>
                      <Button 
                        onClick={handleSaveProduct} 
                        className="w-full"
                        disabled={isSavingProduct}
                      >
                        {isSavingProduct && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        <Save className="h-4 w-4 mr-2" />
                        {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product: any) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="aspect-square relative">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-primary font-bold">${product.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openEditProduct(product)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No tienes productos</h3>
                  <p className="text-muted-foreground mb-4">
                    Agrega tu primer producto para empezar a vender
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>Configuración de la Tienda</CardTitle>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <p className="font-medium mb-1">⚙️ Ajustes generales</p>
                        <p className="text-xs">Configura el logo, banner, colores de marca, datos de contacto, redes sociales y políticas de envío. Los cambios se guardan al hacer clic en "Guardar cambios".</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <CardDescription>
                    Personaliza tu tienda a tu gusto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo and Banner Section */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Identidad Visual</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo Upload */}
                      <div className="space-y-3">
                        <Label>Logo de la tienda</Label>
                        <input
                          type="file"
                          ref={logoInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && store) {
                              const url = await uploadStoreAsset(file, store.id, 'logo');
                              if (url) setStoreLogo(url);
                            }
                            if (logoInputRef.current) logoInputRef.current.value = "";
                          }}
                        />
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => logoInputRef.current?.click()}
                          >
                            {storeLogo ? (
                              <img src={storeLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                              <Image className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={uploadingAsset}
                            >
                              {uploadingAsset ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Upload className="h-4 w-4 mr-2" />
                              )}
                              Subir logo
                            </Button>
                            {storeLogo && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => setStoreLogo("")}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </Button>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Recomendado: 200x200px, PNG o SVG
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Banner Upload */}
                      <div className="space-y-3">
                        <Label>Banner de la tienda</Label>
                        <input
                          type="file"
                          ref={bannerInputRef}
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && store) {
                              const url = await uploadStoreAsset(file, store.id, 'banner');
                              if (url) setStoreBanner(url);
                            }
                            if (bannerInputRef.current) bannerInputRef.current.value = "";
                          }}
                        />
                        <div 
                          className="w-full h-32 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors"
                          onClick={() => bannerInputRef.current?.click()}
                        >
                          {storeBanner ? (
                            <img src={storeBanner} alt="Banner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center space-y-2">
                              <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click para subir banner</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={uploadingAsset}
                          >
                            {uploadingAsset ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="h-4 w-4 mr-2" />
                            )}
                            Subir banner
                          </Button>
                          {storeBanner && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => setStoreBanner("")}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Recomendado: 1920x400px, JPG o PNG
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium text-lg mb-4">Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nombre de la tienda</Label>
                        <Input
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-sm">/tienda/</span>
                          <Input
                            value={storeSlug}
                            onChange={(e) => setStoreSlug(generateSlug(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={storeDescription}
                      onChange={(e) => setStoreDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color principal</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={storePrimaryColor}
                          onChange={(e) => setStorePrimaryColor(e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={storePrimaryColor}
                          onChange={(e) => setStorePrimaryColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Color secundario</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={storeSecondaryColor}
                          onChange={(e) => setStoreSecondaryColor(e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={storeSecondaryColor}
                          onChange={(e) => setStoreSecondaryColor(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Costo de envío</Label>
                      <Input
                        type="number"
                        value={storeShippingCost}
                        onChange={(e) => setStoreShippingCost(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Envío gratis desde</Label>
                      <Input
                        type="number"
                        value={storeFreeShippingThreshold}
                        onChange={(e) => setStoreFreeShippingThreshold(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium text-lg mb-4 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-green-500" />
                      Contacto y Redes Sociales
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Añade tu información de contacto y redes sociales para que tus clientes puedan encontrarte fácilmente y tengan más confianza en tu tienda.
                    </p>
                    
                    {/* WhatsApp - Destacado */}
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        <Label className="font-medium text-green-700 dark:text-green-400">WhatsApp Business</Label>
                      </div>
                      <Input
                        value={storeWhatsapp}
                        onChange={(e) => setStoreWhatsapp(e.target.value)}
                        placeholder="+52 55 1234 5678"
                        className="bg-white dark:bg-background"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Aparecerá como botón flotante en tu tienda. Incluye el código de país (+52 México, +1 USA, +34 España).
                      </p>
                      {storeWhatsapp && (
                        <div className="flex items-center gap-2 mt-3 text-green-700 dark:text-green-400">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm font-medium">Botón de WhatsApp activo</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>Teléfono de contacto</Label>
                        <Input
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email de contacto</Label>
                        <Input
                          value={storeEmail}
                          onChange={(e) => setStoreEmail(e.target.value)}
                          placeholder="tienda@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          Instagram
                        </Label>
                        <Input
                          value={storeInstagram}
                          onChange={(e) => setStoreInstagram(e.target.value)}
                          placeholder="https://instagram.com/tutienda"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </Label>
                        <Input
                          value={storeFacebook}
                          onChange={(e) => setStoreFacebook(e.target.value)}
                          placeholder="https://facebook.com/tutienda"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Puedes configurar Twitter, TikTok y tu sitio web en la sección de "Configuración Avanzada" más abajo.
                    </p>
                  </div>

                  <Button 
                    onClick={handleUpdateStore} 
                    className="w-full"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <div className="mt-6">
                <AdvancedSettingsPanel 
                  storeId={store.id}
                  initialSettings={{
                    accent_color: store.accent_color || "#2F1810",
                    welcome_message: (store as any).welcome_message || "",
                    announcement_text: (store as any).announcement_text || "",
                    announcement_active: (store as any).announcement_active || false,
                    show_reviews: (store as any).show_reviews ?? true,
                    show_stock: (store as any).show_stock ?? true,
                    currency: (store as any).currency || "MXN",
                    tax_rate: (store as any).tax_rate || 0,
                    min_order_amount: (store as any).min_order_amount || 0,
                    twitter_url: (store as any).twitter_url || "",
                    tiktok_url: (store as any).tiktok_url || "",
                    website_url: (store as any).website_url || "",
                    return_policy: (store as any).return_policy || "",
                    shipping_info: (store as any).shipping_info || "",
                  }}
                  primaryColor={store.primary_color}
                />
              </div>
            </TabsContent>

            <TabsContent value="chat">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-heading">Chat en Vivo</h2>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm">
                      <p className="font-medium mb-1">💬 Chat con clientes</p>
                      <p className="text-xs">Responde a tus clientes en tiempo real. Los mensajes se actualizan automáticamente.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <ChatPanel storeId={store.id} primaryColor={store.primary_color} />
              </div>
            </TabsContent>
            </motion.div>
          </Tabs>
          </TooltipProvider>
        )}
      </main>

      {/* Tutorial Overlay */}
      {store && (
        <TutorialOverlay
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          primaryColor={store.primary_color}
        />
      )}
    </div>
  );
};

export default Dashboard;
