import { useState, useEffect } from "react";
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
import { Loader2, Store, Package, Settings, ExternalLink, LogOut, Plus, Trash2, Edit2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  
  const { data: store, isLoading: storeLoading, refetch: refetchStore } = useMyStore(user?.id);
  const { data: products, isLoading: productsLoading, refetch: refetchProducts } = useStoreProducts(store?.id);
  const createStore = useCreateStore();
  const updateStore = useUpdateStore();

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
  const [isSaving, setIsSaving] = useState(false);

  // Product form state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productOriginalPrice, setProductOriginalPrice] = useState("");
  const [productImage, setProductImage] = useState("");
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
          <Tabs defaultValue="products" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" />
                Productos
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Configuración
              </TabsTrigger>
            </TabsList>

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
                      <div className="space-y-2">
                        <Label>URL de imagen *</Label>
                        <Input
                          value={productImage}
                          onChange={(e) => setProductImage(e.target.value)}
                          placeholder="https://..."
                        />
                        {productImage && (
                          <img src={productImage} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                        )}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={storePhone}
                        onChange={(e) => setStorePhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={storeEmail}
                        onChange={(e) => setStoreEmail(e.target.value)}
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
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
