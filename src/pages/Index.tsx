import { useNavigate } from "react-router-dom";
import { useAllStores } from "@/hooks/useAllStores";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
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

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const AnimatedSection = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.7, delay, ease: "easeOut" as const }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

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

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  
  const storesRef = useRef(null);
  const storesInView = useInView(storesRef, { once: true, margin: "-100px" });
  
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
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
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8">
              {["Características", "Tiendas", "Precios"].map((item, index) => (
                <motion.a 
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>

            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
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
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"
            animate={{ 
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[128px]"
            animate={{ 
              y: [0, -30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-8"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex">
              <Badge variant="outline" className="px-5 py-2.5 rounded-full border-primary/30 bg-primary/10 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-2 text-primary animate-bounce-soft" />
                <span className="text-sm font-medium">Plataforma #1 de E-commerce en LATAM</span>
              </Badge>
            </motion.div>
            
            {/* Title */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading leading-[0.9] tracking-tight">
                Crea tu tienda
                <motion.span 
                  className="block gradient-text"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  en minutos
                </motion.span>
              </h1>
            </motion.div>
            
            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Todo lo que necesitas para vender online. Gestiona productos, pedidos, pagos y conecta con clientes por WhatsApp. 
              <span className="text-foreground font-medium"> Sin código, sin complicaciones.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-7 gap-3 rounded-2xl hover-shine shadow-lg shadow-primary/25 group"
                  onClick={() => navigate("/auth")}
                >
                  <Zap className="h-5 w-5" />
                  Crear Tienda Gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-8 py-7 rounded-2xl border-2 hover:bg-muted/50"
                  onClick={() => document.getElementById('tiendas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explorar Tiendas
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={staggerContainer}
              className="flex flex-wrap justify-center gap-8 md:gap-16 pt-12"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="text-center group"
                  variants={scaleIn}
                  whileHover={{ scale: 1.1 }}
                >
                  <p className="text-4xl md:text-5xl font-bold font-heading text-primary transition-transform">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div 
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative" ref={featuresRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
                Características
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6"
            >
              Todo lo que necesitas
              <span className="block text-muted-foreground text-3xl md:text-4xl lg:text-5xl mt-2">para vender online</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Herramientas profesionales diseñadas para hacer crecer tu negocio
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card 
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 h-full"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <CardContent className="p-8 relative">
                    <motion.div 
                      className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <feature.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="font-heading font-semibold text-xl mb-3 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stores Section */}
      <section id="tiendas" className="py-24 md:py-32 relative" ref={storesRef}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-16 md:mb-20"
            initial="hidden"
            animate={storesInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
                Tiendas Destacadas
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6"
            >
              Conoce nuestras
              <span className="text-primary"> tiendas</span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              Explora las tiendas que ya están vendiendo en nuestra plataforma
            </motion.p>
          </motion.div>
          
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
              </div>
            </div>
          ) : stores && stores.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate={storesInView ? "visible" : "hidden"}
              variants={staggerContainer}
            >
              {stores.map((store, index) => (
                <motion.div
                  key={store.id}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card 
                    className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 cursor-pointer h-full"
                    onClick={() => navigate(`/tienda/${store.slug}`)}
                  >
                    {/* Banner */}
                    <div className="relative h-48 overflow-hidden">
                      {store.banner_url ? (
                        <motion.img 
                          src={store.banner_url} 
                          alt={store.name}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
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
                        <motion.div 
                          className="absolute bottom-4 left-6"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-primary/30 blur-xl rounded-xl" />
                            <img 
                              src={store.logo_url} 
                              alt={store.name}
                              className="relative h-16 w-16 rounded-2xl object-cover bg-card shadow-2xl border-2 border-border/50"
                            />
                          </div>
                        </motion.div>
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
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-20 space-y-8"
              initial="hidden"
              animate={storesInView ? "visible" : "hidden"}
              variants={fadeInUp}
            >
              <motion.div 
                className="relative inline-block"
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute inset-0 bg-muted/50 blur-3xl rounded-full" />
                <div className="relative h-24 w-24 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Store className="h-12 w-12 text-muted-foreground" />
                </div>
              </motion.div>
              <div className="space-y-3">
                <h3 className="text-2xl font-heading font-semibold">Aún no hay tiendas</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  ¡Sé el primero en crear tu tienda online y empieza a vender hoy!
                </p>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 rounded-xl px-8">
                  <Plus className="h-5 w-5" />
                  Crear Mi Tienda
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-gold/5" />
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[128px]"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={scaleIn}
          >
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-8 md:p-16 text-center space-y-8">
                <motion.div variants={fadeInUp}>
                  <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/30 bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />
                    14 días gratis
                  </Badge>
                </motion.div>
                
                <motion.h2 
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight"
                >
                  ¿Listo para
                  <span className="gradient-text"> empezar?</span>
                </motion.h2>
                
                <motion.p 
                  variants={fadeInUp}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                >
                  Crea tu tienda en minutos y comienza a recibir pedidos hoy mismo. 
                  Sin tarjeta de crédito, sin compromisos.
                </motion.p>
                
                <motion.div 
                  variants={fadeInUp}
                  className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      className="text-lg px-10 py-7 gap-3 rounded-2xl hover-shine shadow-lg shadow-primary/25 group"
                      onClick={() => navigate("/auth")}
                    >
                      <Rocket className="h-5 w-5" />
                      Crear Mi Tienda Gratis
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div 
                  variants={staggerContainer}
                  className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground"
                >
                  {[
                    { text: "Sin código", icon: CheckCircle2 },
                    { text: "Configuración en 5 min", icon: CheckCircle2 },
                    { text: "Soporte 24/7", icon: CheckCircle2 }
                  ].map((item, index) => (
                    <motion.span 
                      key={index}
                      className="flex items-center gap-2"
                      variants={fadeIn}
                    >
                      <item.icon className="h-4 w-4 text-green-500" />
                      {item.text}
                    </motion.span>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        className="border-t border-border/40 py-12 md:py-16 bg-muted/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Store className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">MiTienda</span>
            </motion.div>
            
            <nav className="flex items-center gap-8">
              {["Características", "Tiendas", "Términos", "Privacidad"].map((item, index) => (
                <motion.a 
                  key={item}
                  href={item === "Características" ? "#features" : item === "Tiendas" ? "#tiendas" : "#"}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ y: -2 }}
                >
                  {item}
                </motion.a>
              ))}
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MiTienda. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
