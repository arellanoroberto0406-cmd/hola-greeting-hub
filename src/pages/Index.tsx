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
  Package,
  TrendingUp,
  Loader2,
  Plus,
  LayoutDashboard,
  MessageCircle,
  Zap,
  Shield,
  Globe,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Rocket
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stores, isLoading } = useAllStores();

  const features = [
    {
      icon: ShoppingBag,
      title: "Gestión de Pedidos",
      description: "Administra pedidos en tiempo real con seguimiento completo",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integrado",
      description: "Conecta con clientes directamente desde tu tienda",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Analytics Avanzados",
      description: "Visualiza ventas, tendencias y productos estrella",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Acepta pagos con múltiples métodos de pago",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Tu Dominio",
      description: "Tienda personalizada con tu propia URL única",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Protección de datos y transacciones seguras",
      color: "from-teal-500 to-green-500"
    }
  ];

  const stats = [
    { value: "500+", label: "Tiendas Activas" },
    { value: "50K+", label: "Productos" },
    { value: "100K+", label: "Ventas" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full" />
                <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Store className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <span className="font-heading text-xl md:text-2xl font-bold tracking-tight">MiTienda</span>
                <span className="hidden md:inline text-primary font-bold">.</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#tiendas" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tiendas
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="gap-2 rounded-xl px-6">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex">
                    Iniciar Sesión
                  </Button>
                  <Button onClick={() => navigate("/auth")} className="gap-2 rounded-xl px-6 hover-shine">
                    <Rocket className="h-4 w-4" />
                    <span>Comenzar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-float" />
          <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[128px] animate-float animation-delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex animate-fade-in-up">
              <Badge variant="outline" className="px-5 py-2.5 rounded-full border-primary/30 bg-primary/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2 text-primary animate-bounce-soft" />
                <span className="text-sm font-medium">Plataforma #1 de E-commerce en LATAM</span>
              </Badge>
            </div>
            
            {/* Title */}
            <div className="space-y-4 animate-fade-in-up animation-delay-200">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading leading-[0.9] tracking-tight">
                Crea tu tienda
                <span className="block gradient-text">en minutos</span>
              </h1>
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
              Todo lo que necesitas para vender online. Gestiona productos, pedidos, pagos y conecta con clientes por WhatsApp. 
              <span className="text-foreground font-medium"> Sin código, sin complicaciones.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in-up animation-delay-400">
              <Button 
                size="lg" 
                className="text-lg px-8 py-7 gap-3 rounded-2xl hover-shine shadow-lg shadow-primary/25 group"
                onClick={() => navigate("/auth")}
              >
                <Zap className="h-5 w-5" />
                Crear Tienda Gratis
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-7 rounded-2xl border-2 hover:bg-muted/50"
                onClick={() => document.getElementById('tiendas')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar Tiendas
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12 animate-fade-in-up animation-delay-500">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <p className="text-4xl md:text-5xl font-bold font-heading text-primary group-hover:scale-110 transition-transform">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-soft">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
              Características
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
              Todo lo que necesitas
              <span className="block text-muted-foreground text-3xl md:text-4xl lg:text-5xl mt-2">para vender online</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales diseñadas para hacer crecer tu negocio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover-lift"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <CardContent className="p-8 relative">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Section */}
      <section id="tiendas" className="py-24 md:py-32 relative">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 md:mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
              Tiendas Destacadas
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
              Conoce nuestras
              <span className="text-primary"> tiendas</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora las tiendas que ya están vendiendo en nuestra plataforma
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
              </div>
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stores.map((store, index) => (
                <Card 
                  key={store.id} 
                  className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 cursor-pointer hover-lift"
                  onClick={() => navigate(`/tienda/${store.slug}`)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Banner */}
                  <div className="relative h-48 overflow-hidden">
                    {store.banner_url ? (
                      <img 
                        src={store.banner_url} 
                        alt={store.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ 
                          background: `linear-gradient(135deg, ${store.primary_color || '#f97316'}40, ${store.secondary_color || '#fb923c'}20)` 
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                    
                    {/* Logo */}
                    {store.logo_url && (
                      <div className="absolute bottom-4 left-6 group-hover:scale-110 transition-transform duration-300">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl" />
                          <img 
                            src={store.logo_url} 
                            alt={store.name}
                            className="relative h-16 w-16 rounded-2xl object-cover bg-card shadow-2xl border-2 border-border/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 pt-4 space-y-4">
                    <div>
                      <h3 className="font-heading font-semibold text-xl group-hover:text-primary transition-colors">
                        {store.name}
                      </h3>
                      {store.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                          {store.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {store.phone && (
                        <Badge variant="secondary" className="gap-1.5 rounded-full px-3">
                          <MessageCircle className="h-3 w-3" />
                          WhatsApp
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1.5 rounded-full px-3">
                        <Package className="h-3 w-3" />
                        Productos
                      </Badge>
                    </div>
                    
                    <div className="pt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      >
                        Visitar Tienda
                        <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-muted/50 blur-3xl rounded-full" />
                <div className="relative h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Store className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-heading font-semibold">Aún no hay tiendas</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  ¡Sé el primero en crear tu tienda online y empieza a vender hoy!
                </p>
              </div>
              <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 rounded-xl px-8">
                <Plus className="h-5 w-5" />
                Crear Mi Tienda
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-gold/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[128px]" />
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-8 md:p-16 text-center space-y-8">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 bg-primary/10">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                  14 días gratis
                </Badge>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight">
                  ¿Listo para
                  <span className="gradient-text"> empezar?</span>
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Crea tu tienda en minutos y comienza a recibir pedidos hoy mismo. 
                  Sin tarjeta de crédito, sin compromisos.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 gap-3 rounded-2xl hover-shine shadow-lg shadow-primary/25 group"
                    onClick={() => navigate("/auth")}
                  >
                    <Rocket className="h-5 w-5" />
                    Crear Mi Tienda Gratis
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Sin código
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Configuración en 5 min
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Soporte 24/7
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 md:py-16 bg-muted/10">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">MiTienda</span>
            </div>
            
            <nav className="flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#tiendas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Tiendas
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Términos
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacidad
              </a>
            </nav>
            
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
