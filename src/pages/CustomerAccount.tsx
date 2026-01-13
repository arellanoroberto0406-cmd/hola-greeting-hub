import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "@/hooks/useStores";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Package,
  Heart,
  User,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingCart,
  Star,
  Trash2,
  Eye,
  Loader2,
  LogOut,
  MapPin,
  Calendar,
  CreditCard,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const CustomerAccount = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: store, isLoading: storeLoading } = useStore(slug || "");
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("orders");

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["customer-orders", user?.id, store?.id],
    queryFn: async () => {
      if (!user?.id || !store?.id) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("user_id", user.id)
        .eq("store_id", store.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!store?.id,
  });

  // Fetch user profile
  const { data: profile } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      processing: "En proceso",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

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
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Inicia sesión para continuar</CardTitle>
            <CardDescription>
              Necesitas una cuenta para ver tu historial de pedidos y lista de deseos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              style={{ backgroundColor: store.primary_color }}
              onClick={() => navigate("/auth")}
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/tienda/${slug}`)}
            >
              Volver a la tienda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{ 
          backgroundColor: `${store.primary_color}10`,
          borderColor: `${store.primary_color}30`
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(`/tienda/${slug}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a la tienda
            </Button>
            <h1 className="font-heading font-bold text-lg" style={{ color: store.primary_color }}>
              Mi Cuenta
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
          {/* Sidebar - Profile Info */}
          <motion.div variants={fadeInUp} className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback style={{ backgroundColor: store.primary_color }}>
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-heading font-bold text-xl">
                  {profile?.full_name || "Cliente"}
                </h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>

                <Separator className="my-6" />

                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Pedidos</span>
                    <Badge variant="secondary">{orders?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Favoritos</span>
                    <Badge variant="secondary">{wishlist.length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={fadeInUp} className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="orders" className="gap-2">
                  <Package className="h-4 w-4" />
                  Mis Pedidos
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Favoritos
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-4">
                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: store.primary_color }} />
                  </div>
                ) : orders && orders.length > 0 ? (
                  <motion.div variants={staggerContainer} className="space-y-4">
                    {orders.map((order: any) => (
                      <motion.div key={order.id} variants={fadeInUp}>
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <CardHeader className="bg-muted/30 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm text-muted-foreground">
                                    #{order.id.substring(0, 8).toUpperCase()}
                                  </span>
                                  <Badge className={getStatusColor(order.status)}>
                                    <span className="flex items-center gap-1">
                                      {getStatusIcon(order.status)}
                                      {getStatusLabel(order.status)}
                                    </span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(new Date(order.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <CreditCard className="h-3.5 w-3.5" />
                                    {order.payment_method === "cash" ? "Efectivo" : 
                                     order.payment_method === "card" ? "Tarjeta" : 
                                     order.payment_method === "transfer" ? "Transferencia" : 
                                     order.payment_method}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold" style={{ color: store.primary_color }}>
                                  ${order.total.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {order.order_items?.length || 0} productos
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Delivery Address */}
                              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>
                                  {order.address}, {order.city}, {order.state} {order.zip_code}
                                </span>
                              </div>
                              
                              {/* Order Items Preview */}
                              <Separator />
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {order.order_items?.slice(0, 4).map((item: any) => (
                                  <div 
                                    key={item.id} 
                                    className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border bg-muted"
                                  >
                                    <img 
                                      src={item.product_image} 
                                      alt={item.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                                {order.order_items?.length > 4 && (
                                  <div className="shrink-0 w-16 h-16 rounded-lg border bg-muted flex items-center justify-center">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      +{order.order_items.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <Card className="py-16">
                    <CardContent className="text-center space-y-4">
                      <Package className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-heading font-bold text-xl">No tienes pedidos aún</h3>
                        <p className="text-muted-foreground mt-1">
                          Explora la tienda y haz tu primera compra
                        </p>
                      </div>
                      <Button 
                        style={{ backgroundColor: store.primary_color }}
                        onClick={() => navigate(`/tienda/${slug}`)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Ir a comprar
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-4">
                {wishlist.length > 0 ? (
                  <motion.div 
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    {wishlist.map((product) => (
                      <motion.div key={product.id} variants={fadeInUp}>
                        <Card className="overflow-hidden group hover:shadow-lg transition-all">
                          <div className="flex gap-4 p-4">
                            <div 
                              className="w-24 h-24 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                              onClick={() => navigate(`/tienda/${slug}`)}
                            >
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.collection}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-bold" style={{ color: store.primary_color }}>
                                  ${product.price.toLocaleString()}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ${product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  style={{ backgroundColor: store.primary_color }}
                                  onClick={() => addItem(product)}
                                  disabled={product.stock === 0}
                                >
                                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                  {product.stock === 0 ? "Agotado" : "Agregar"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeFromWishlist(product.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <Card className="py-16">
                    <CardContent className="text-center space-y-4">
                      <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-heading font-bold text-xl">Tu lista de deseos está vacía</h3>
                        <p className="text-muted-foreground mt-1">
                          Guarda los productos que te gusten para comprarlos después
                        </p>
                      </div>
                      <Button 
                        style={{ backgroundColor: store.primary_color }}
                        onClick={() => navigate(`/tienda/${slug}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Explorar productos
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerAccount;
