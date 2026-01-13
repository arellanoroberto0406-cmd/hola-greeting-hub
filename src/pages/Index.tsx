import { useNavigate } from "react-router-dom";
import { useAllStores } from "@/hooks/useAllStores";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Users,
  Package,
  TrendingUp,
  Loader2,
  Plus,
  LayoutDashboard,
  MessageCircle
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stores, isLoading } = useAllStores();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">MiTienda</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate("/dashboard")} className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Mi Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/auth")}>
                  Iniciar Sesión
                </Button>
                <Button onClick={() => navigate("/auth")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Tienda
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Plataforma de E-commerce
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight">
              Crea tu tienda online
              <span className="block text-primary">en minutos</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Vende tus productos, gestiona pedidos, analiza ventas y conecta con tus clientes por WhatsApp. Todo en un solo lugar.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="text-lg px-8 py-6 gap-2" onClick={() => navigate("/auth")}>
                Comenzar Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => {
                document.getElementById('tiendas')?.scrollIntoView({ behavior: 'smooth' });
              }}>
                Ver Tiendas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Todo lo que necesitas para vender
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Herramientas profesionales para hacer crecer tu negocio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Gestión de Pedidos</h3>
                <p className="text-sm text-muted-foreground">
                  Administra todos tus pedidos en tiempo real con actualizaciones de estado
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">WhatsApp Integrado</h3>
                <p className="text-sm text-muted-foreground">
                  Tus clientes pueden contactarte directamente desde tu tienda
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Analytics de Ventas</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza tus ingresos, productos más vendidos y tendencias
                </p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <CardContent className="p-6 text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Star className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">Reseñas de Productos</h3>
                <p className="text-sm text-muted-foreground">
                  Los clientes pueden dejar opiniones y calificaciones
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section id="tiendas" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
              Tiendas Destacadas
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explora las tiendas que ya están vendiendo en nuestra plataforma
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stores.map((store) => (
                <Card 
                  key={store.id} 
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/30"
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                >
                  <div className="relative h-40 overflow-hidden">
                    {store.banner_url ? (
                      <img 
                        src={store.banner_url} 
                        alt={store.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${store.primary_color || '#8B4513'}40, ${store.secondary_color || '#D4A574'}40)` 
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                    
                    {store.logo_url && (
                      <div className="absolute bottom-4 left-4">
                        <img 
                          src={store.logo_url} 
                          alt={store.name}
                          className="h-12 w-12 rounded-xl object-cover bg-background shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {store.name}
                        </h3>
                        {store.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {store.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2">
                      {store.phone && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1 text-xs">
                        <Package className="h-3 w-3" />
                        Productos
                      </Badge>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      Visitar Tienda
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-6">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Store className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Aún no hay tiendas</h3>
                <p className="text-muted-foreground mb-6">
                  ¡Sé el primero en crear tu tienda online!
                </p>
                <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Crear Mi Tienda
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              ¿Listo para empezar a vender?
            </h2>
            <p className="text-lg text-muted-foreground">
              Crea tu tienda en minutos y comienza a recibir pedidos hoy mismo
            </p>
            <Button size="lg" className="text-lg px-10 py-6 gap-2" onClick={() => navigate("/auth")}>
              Crear Mi Tienda Gratis
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-semibold">MiTienda</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MiTienda. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
