import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Store, 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Package,
  TrendingUp,
  Plus,
  LayoutDashboard,
  MessageCircle,
  Zap,
  Shield,
  Globe,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Rocket,
  Users,
  BarChart3,
  Palette,
  Smartphone,
  X
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const features = [
    {
      icon: ShoppingBag,
      title: "Gestión de Pedidos",
      description: "Control total de pedidos con seguimiento en tiempo real y notificaciones automáticas",
      gradient: "from-orange-500 to-amber-500"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Business",
      description: "Conecta directamente con clientes y recibe pedidos por WhatsApp",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: BarChart3,
      title: "Analytics Pro",
      description: "Métricas detalladas de ventas, productos estrella y comportamiento de clientes",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CreditCard,
      title: "Pagos Múltiples",
      description: "Acepta PayPal, MercadoPago, transferencias y efectivo",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: Palette,
      title: "Personalización Total",
      description: "Diseña tu tienda con colores, secciones y plantillas únicas",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: Smartphone,
      title: "100% Responsive",
      description: "Tu tienda perfecta en cualquier dispositivo",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { value: "500+", label: "Tiendas Activas", icon: Store },
    { value: "50K+", label: "Productos", icon: Package },
    { value: "100K+", label: "Ventas", icon: TrendingUp },
    { value: "99.9%", label: "Uptime", icon: Shield }
  ];

  const benefits = [
    "Sin código necesario",
    "Configuración en 5 minutos", 
    "Soporte 24/7",
    "14 días gratis"
  ];

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-50px" });
  
  const storesRef = useRef(null);
  const storesInView = useInView(storesRef, { once: true, margin: "-50px" });
  
  const ctaRef = useRef(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: "-50px" });

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating CTA Banner for non-authenticated users */}
      {!user && showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 25px 50px -12px hsl(var(--primary) / 0.15)",
              "0 25px 50px -12px hsl(var(--primary) / 0.3)",
              "0 25px 50px -12px hsl(var(--primary) / 0.15)"
            ]
          }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            y: { delay: 2, duration: 0.5 },
            opacity: { delay: 2, duration: 0.5 },
            scale: { delay: 2.5, duration: 2, repeat: Infinity, ease: "easeInOut" },
            boxShadow: { delay: 2.5, duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md md:max-w-lg rounded-2xl"
        >
          <motion.div 
            className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-gold/30 to-primary/40 rounded-2xl blur-lg"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-background/95 to-gold/10 backdrop-blur-xl p-4">
            {/* Close button */}
            <button
              onClick={() => setShowBanner(false)}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted/90 border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-gold flex items-center justify-center shrink-0"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <p className="font-semibold text-sm">¡Crea tu tienda gratis!</p>
                  <p className="text-xs text-muted-foreground">Empieza a vender en minutos</p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="sm" 
                  onClick={() => navigate("/auth")}
                  className="gap-2 rounded-xl shrink-0"
                >
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Comenzar</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl"
      >
        <div className="rounded-2xl border border-border/50 bg-background/70 backdrop-blur-xl shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between px-6 py-4">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-xl" />
                <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">MiTienda</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Características", href: "#features" },
                { name: "Tiendas", href: "#tiendas" },
                { name: "Precios", href: "#pricing" }
              ].map((item) => (
                <a 
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="gap-2 rounded-xl">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex rounded-xl">
                    Iniciar Sesión
                  </Button>
                  <Button onClick={() => navigate("/auth")} className="gap-2 rounded-xl">
                    <Rocket className="h-4 w-4" />
                    <span className="hidden sm:inline">Comenzar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-24 pb-20"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
          <motion.div 
            className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-48 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[150px]"
            animate={{ 
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px]" />
          
          {/* Floating Elements */}
          <motion.div 
            className="absolute top-1/4 right-1/4 w-4 h-4 rounded-full bg-primary/40"
            animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-gold/40"
            animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          />
          <motion.div 
            className="absolute bottom-1/3 right-1/3 w-2 h-2 rounded-full bg-primary/30"
            animate={{ y: [0, -15, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, delay: 2 }}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <Badge 
                variant="outline" 
                className="px-6 py-2.5 rounded-full border-primary/30 bg-primary/5 backdrop-blur-sm text-sm font-medium"
              >
                <Sparkles className="h-4 w-4 mr-2 text-primary" />
                Plataforma #1 de E-commerce en LATAM
              </Badge>
            </motion.div>
            
            {/* Title */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading leading-[0.95] tracking-tight">
                Crea tu tienda
                <span className="block mt-2 bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">
                  en minutos
                </span>
              </h1>
            </motion.div>
            
            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Todo lo que necesitas para vender online. Gestiona productos, pedidos, pagos 
              y conecta con clientes por WhatsApp. 
              <span className="text-foreground font-medium"> Sin código, sin complicaciones.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  className="text-base px-8 py-6 gap-3 rounded-xl shadow-lg shadow-primary/20 group"
                  onClick={() => navigate("/auth")}
                >
                  <Zap className="h-5 w-5" />
                  Crear Tienda Gratis
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-base px-8 py-6 rounded-xl border-2 hover:bg-muted/30"
                  onClick={() => document.getElementById('tiendas')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Tiendas Activas
                </Button>
              </motion.div>
            </motion.div>

            {/* Benefits Pills */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-3"
            >
              {benefits.map((benefit, index) => (
                <motion.span 
                  key={index}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {benefit}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={staggerContainer}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className="relative group"
                  variants={scaleIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
                    <stat.icon className="h-5 w-5 text-primary mb-3" />
                    <p className="text-3xl md:text-4xl font-bold font-heading text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
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
          transition={{ delay: 1.5 }}
        >
          <motion.div 
            className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 relative" ref={featuresRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/10 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
                <Zap className="h-3.5 w-3.5 mr-2" />
                Características
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4"
            >
              Todo lo que necesitas
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Herramientas profesionales para hacer crecer tu negocio online
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <Card className="group h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
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

      {/* Store Template Preview Section */}
      <section id="tiendas" className="py-24 md:py-32 relative" ref={storesRef}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate={storesInView ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
                <Palette className="h-3.5 w-3.5 mr-2" />
                Vista Previa
              </Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4"
            >
              Así lucirá tu tienda
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Una vista previa de cómo se verá tu tienda con productos de ejemplo
            </motion.p>
          </motion.div>
          
          {/* Demo Store Preview */}
          <motion.div 
            className="max-w-5xl mx-auto"
            initial="hidden"
            animate={storesInView ? "visible" : "hidden"}
            variants={fadeInUp}
          >
            {/* Store Header Preview */}
            <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm mb-8">
              <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/30 via-orange-400/20 to-gold/30">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6 flex items-end gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center border-4 border-card shadow-xl">
                    <Store className="h-10 w-10 text-white" />
                  </div>
                  <div className="pb-2">
                    <h3 className="text-2xl font-heading font-bold text-foreground">Tu Tienda Online</h3>
                    <p className="text-muted-foreground">Los mejores productos al mejor precio</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { name: "Electrónicos", icon: "⚡" },
                { name: "Ropa", icon: "👕" },
                { name: "Accesorios", icon: "💎" },
                { name: "Calzado", icon: "👟" },
              ].map((cat, i) => (
                <Badge 
                  key={i} 
                  variant={i === 0 ? "default" : "outline"} 
                  className="px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.name}
                </Badge>
              ))}
            </div>

            {/* Demo Products Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
              variants={staggerContainer}
            >
              {[
                // Electrónicos
                { name: "Smartphone Pro Max", price: "$899.00", originalPrice: "$1,099.00", badge: "Oferta", image: "📱", category: "Electrónicos" },
                { name: "Audífonos Wireless", price: "$149.00", badge: "Popular", image: "🎧", category: "Electrónicos" },
                { name: "Smartwatch Elite", price: "$349.00", badge: "Nuevo", image: "⌚", category: "Electrónicos" },
                { name: "Tablet Ultra", price: "$599.00", originalPrice: "$749.00", badge: "Oferta", image: "📲", category: "Electrónicos" },
                // Ropa
                { name: "Camiseta Premium", price: "$45.00", badge: "Nuevo", image: "👕", category: "Ropa" },
                { name: "Hoodie Urbano", price: "$89.00", originalPrice: "$120.00", badge: "Oferta", image: "🧥", category: "Ropa" },
                { name: "Jeans Classic Fit", price: "$75.00", badge: "Popular", image: "👖", category: "Ropa" },
                { name: "Vestido Elegante", price: "$129.00", badge: "Exclusivo", image: "👗", category: "Ropa" },
                // Accesorios
                { name: "Gafas de Sol", price: "$159.00", badge: "Trending", image: "🕶️", category: "Accesorios" },
                { name: "Bolso de Cuero", price: "$199.00", originalPrice: "$259.00", badge: "Oferta", image: "👜", category: "Accesorios" },
                { name: "Collar Dorado", price: "$79.00", badge: "Nuevo", image: "📿", category: "Accesorios" },
                { name: "Reloj Clásico", price: "$249.00", badge: "Exclusivo", image: "🕰️", category: "Accesorios" },
              ].map((product, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="group h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                    <div className="relative aspect-square bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center">
                      <span className="text-5xl md:text-6xl">{product.image}</span>
                      <Badge className="absolute top-2 left-2 rounded-full text-xs" variant="secondary">
                        {product.badge}
                      </Badge>
                      <Badge className="absolute top-2 right-2 rounded-full text-xs bg-background/80 text-foreground" variant="outline">
                        {product.category}
                      </Badge>
                      <motion.div 
                        className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={false}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-primary">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < 4 + (index % 2) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({(4.5 + Math.random() * 0.5).toFixed(1)})</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div 
              className="text-center mt-12 space-y-6"
              variants={fadeInUp}
            >
              <div className="flex flex-wrap justify-center gap-3">
                {["Personaliza colores", "Agrega tus productos", "Recibe pagos", "Conecta WhatsApp"].map((item, i) => (
                  <Badge key={i} variant="outline" className="px-4 py-2 rounded-full gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    {item}
                  </Badge>
                ))}
              </div>
              <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                <Rocket className="h-5 w-5" />
                Crear Mi Tienda Ahora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative overflow-hidden" ref={ctaRef}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={scaleIn}
          >
            <Card className="border-primary/20 bg-card/80 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-10 md:p-16 text-center space-y-8">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-green-500/30 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  14 días gratis
                </Badge>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading">
                  ¿Listo para
                  <span className="block mt-2 bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">
                    empezar a vender?
                  </span>
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Crea tu tienda en minutos y comienza a recibir pedidos hoy mismo. 
                  Sin tarjeta de crédito, sin compromisos.
                </p>
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="text-base px-10 py-6 gap-3 rounded-xl shadow-lg shadow-primary/20 group"
                    onClick={() => navigate("/auth")}
                  >
                    <Rocket className="h-5 w-5" />
                    Crear Mi Tienda Gratis
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                  {["Sin código", "Configuración en 5 min", "Soporte 24/7"].map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-muted/5">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Store className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold">MiTienda</span>
            </div>
            
            <nav className="flex items-center gap-6">
              {["Características", "Tiendas", "Términos", "Privacidad"].map((item) => (
                <a 
                  key={item}
                  href={item === "Características" ? "#features" : item === "Tiendas" ? "#tiendas" : "#"}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
            
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MiTienda
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
