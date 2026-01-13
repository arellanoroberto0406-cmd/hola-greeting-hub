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
import { Loader2, Store, Package, Settings, ExternalLink, LogOut, Plus, Trash2, Edit2, Save, Upload, ImageIcon, Image, ShoppingBag, BarChart3, Tag, MessageCircle, CreditCard, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useStoreAssets } from "@/hooks/useStoreAssets";
import OrdersPanel from "@/components/dashboard/OrdersPanel";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import CouponsPanel from "@/components/dashboard/CouponsPanel";
import AdvancedSettingsPanel from "@/components/dashboard/AdvancedSettingsPanel";
import SubscriptionPanel from "@/components/dashboard/SubscriptionPanel";
import StoreEditorPanel from "@/components/dashboard/StoreEditorPanel";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const { data: store, isLoading: storeLoading, refetch: refetchStore } = useMyStore(user?.id);
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useStoreProducts(store?.id);
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-xl">Mi Tienda</h1>
          </div>
          <div className="flex items-center gap-2">
            {store && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/tienda/${store.slug}`, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver tienda
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full max-w-5xl grid-cols-7">
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Cupones</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Productos</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Editor</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Plan</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <OrdersPanel storeId={store.id} />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsPanel storeId={store.id} />
            </TabsContent>

            <TabsContent value="coupons">
              <CouponsPanel storeId={store.id} />
            </TabsContent>

            <TabsContent value="editor">
              <StoreEditorPanel store={store} />
            </TabsContent>

            <TabsContent value="subscription">
              <SubscriptionPanel storeId={store.id} primaryColor={store.primary_color} />
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading">Productos</h2>
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
                  <CardTitle>Configuración de la Tienda</CardTitle>
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
                      WhatsApp para Clientes
                    </h3>
                    <div className="space-y-2">
                      <Label>Número de WhatsApp</Label>
                      <div className="flex gap-2">
                        <Input
                          value={storePhone}
                          onChange={(e) => setStorePhone(e.target.value)}
                          placeholder="+52 55 1234 5678"
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Este número aparecerá como botón flotante en tu tienda. Los clientes podrán contactarte directamente por WhatsApp. Incluye el código de país (ej: +52 para México, +1 para USA).
                      </p>
                      {storePhone && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-green-700 dark:text-green-400">
                            Vista previa: Botón de WhatsApp activo en tu tienda
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Instagram URL</Label>
                      <Input
                        value={storeInstagram}
                        onChange={(e) => setStoreInstagram(e.target.value)}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Facebook URL</Label>
                      <Input
                        value={storeFacebook}
                        onChange={(e) => setStoreFacebook(e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
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
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
