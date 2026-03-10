import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Store, 
  ShoppingBag, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Package,
  TrendingUp,
  LayoutDashboard,
  MessageCircle,
  Zap,
  Shield,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Rocket,
  BarChart3,
  Palette,
  Smartphone,
  X,
  Eye,
  MousePointerClick,
  Layers,
  Globe,
  Play
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({ 
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
  })
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(true);
  const [activeStore, setActiveStore] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-80px" });

  const stepsRef = useRef(null);
  const stepsInView = useInView(stepsRef, { once: true, margin: "-80px" });

  const storesRef = useRef(null);
  const storesInView = useInView(storesRef, { once: true, margin: "-80px" });

  const features = [
    { icon: ShoppingBag, title: "Gestión de Pedidos", description: "Control total con seguimiento en tiempo real y notificaciones automáticas a tus clientes.", size: "large" },
    { icon: MessageCircle, title: "WhatsApp Business", description: "Conecta directamente con clientes y recibe pedidos por WhatsApp.", size: "small" },
    { icon: BarChart3, title: "Analytics Pro", description: "Métricas detalladas de ventas, productos estrella y comportamiento.", size: "small" },
    { icon: CreditCard, title: "Pagos Múltiples", description: "Acepta PayPal, MercadoPago, transferencias bancarias y efectivo contra entrega.", size: "large" },
    { icon: Palette, title: "Personalización Total", description: "Diseña tu tienda con colores, secciones drag & drop y plantillas únicas.", size: "small" },
    { icon: Smartphone, title: "100% Responsive", description: "Tu tienda perfecta en cualquier dispositivo, optimizada para móvil.", size: "small" },
  ];

  const steps = [
    { icon: MousePointerClick, title: "Regístrate gratis", description: "Crea tu cuenta en segundos. Sin tarjeta de crédito.", color: "from-blue-500 to-cyan-500" },
    { icon: Palette, title: "Personaliza tu tienda", description: "Elige colores, sube tu logo y configura tus secciones.", color: "from-primary to-orange-500" },
    { icon: Package, title: "Agrega productos", description: "Sube fotos, precios y descripciones en minutos.", color: "from-emerald-500 to-green-500" },
    { icon: Rocket, title: "¡Empieza a vender!", description: "Comparte tu link y recibe pedidos al instante.", color: "from-violet-500 to-purple-500" },
  ];

  const stats = [
    { value: "500+", label: "Tiendas Activas", icon: Store },
    { value: "50K+", label: "Productos", icon: Package },
    { value: "100K+", label: "Ventas", icon: TrendingUp },
    { value: "99.9%", label: "Uptime", icon: Shield }
  ];

  const demoStores = [
    {
      name: "TechWorld", tagline: "Lo último en tecnología", icon: "🚀",
      gradient: "from-blue-500/20 via-cyan-400/10 to-violet-500/20",
      logoGradient: "from-blue-500 to-violet-500",
      categories: [{ name: "Smartphones", icon: "📱" }, { name: "Audio", icon: "🎧" }, { name: "Wearables", icon: "⌚" }, { name: "Gaming", icon: "🎮" }],
      products: [
        { name: "iPhone 16 Pro", price: "$1,199", originalPrice: "$1,399", badge: "Oferta", image: "📱" },
        { name: "AirPods Max", price: "$549", badge: "Popular", image: "🎧" },
        { name: "Apple Watch Ultra", price: "$799", badge: "Nuevo", image: "⌚" },
        { name: "Steam Deck OLED", price: "$649", originalPrice: "$799", badge: "Oferta", image: "🎮" },
        { name: "MacBook Air M3", price: "$1,099", badge: "Trending", image: "💻" },
        { name: "iPad Pro M4", price: "$999", badge: "Exclusivo", image: "📲" },
      ]
    },
    {
      name: "Moda Urbana", tagline: "Tu estilo, tu identidad", icon: "✨",
      gradient: "from-pink-500/20 via-rose-400/10 to-orange-500/20",
      logoGradient: "from-pink-500 to-orange-500",
      categories: [{ name: "Ropa", icon: "👕" }, { name: "Calzado", icon: "👟" }, { name: "Accesorios", icon: "💎" }, { name: "Bolsos", icon: "👜" }],
      products: [
        { name: "Hoodie Premium", price: "$89", originalPrice: "$120", badge: "Oferta", image: "🧥" },
        { name: "Sneakers Limited", price: "$199", badge: "Exclusivo", image: "👟" },
        { name: "Gafas Aviador", price: "$159", badge: "Trending", image: "🕶️" },
        { name: "Bolso Cuero", price: "$249", badge: "Popular", image: "👜" },
        { name: "Vestido Elegante", price: "$129", originalPrice: "$179", badge: "Oferta", image: "👗" },
        { name: "Jeans Slim Fit", price: "$75", badge: "Nuevo", image: "👖" },
      ]
    }
  ];

  const testimonials = [
    { name: "María García", role: "Fundadora de ModaLatam", avatar: "👩‍💼", quote: "En solo 2 semanas pasé de vender por Instagram a tener una tienda profesional con pagos integrados.", rating: 5, metric: "+340% ventas" },
    { name: "Carlos Rodríguez", role: "CEO de TechStore MX", avatar: "👨‍💻", quote: "La mejor plataforma de e-commerce. El soporte es increíble y las funcionalidades superan a competidores más caros.", rating: 5, metric: "50K+ pedidos" },
    { name: "Ana Martínez", role: "Artesanías Oaxaca", avatar: "👩‍🎨", quote: "Sin saber programar pude crear una tienda hermosa. Mis clientes me felicitan por lo profesional que se ve.", rating: 5, metric: "4.9★ rating" },
    { name: "Diego López", role: "Co-fundador de FitShop", avatar: "🧑‍🏋️", quote: "De 0 a 1,000 pedidos mensuales en 3 meses. La integración con WhatsApp es un game changer.", rating: 5, metric: "1K/mes" },
    { name: "Lucía Fernández", role: "Directora de BellezaPura", avatar: "👩‍🔬", quote: "Los analytics me ayudan a entender qué productos venden más. Las métricas son claras y accionables.", rating: 5, metric: "+200% conversión" },
    { name: "Roberto Sánchez", role: "Fundador de GourmetBox", avatar: "👨‍🍳", quote: "MercadoPago integrado fue clave. Recibimos pagos al instante y la gestión de pedidos es súper intuitiva.", rating: 5, metric: "99.9% uptime" },
  ];

  const store = demoStores[activeStore];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating CTA Banner */}
      <AnimatePresence>
        {!user && showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ delay: 3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <div className="relative rounded-2xl border border-primary/20 bg-background/90 backdrop-blur-xl p-4 shadow-2xl shadow-primary/10">
              <button onClick={() => setShowBanner(false)} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors">
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">¡Crea tu tienda gratis!</p>
                    <p className="text-xs text-muted-foreground">Empieza a vender en minutos</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => navigate("/auth")} className="gap-2 rounded-xl shrink-0">
                  <Rocket className="h-4 w-4" />
                  <span className="hidden sm:inline">Comenzar</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl"
      >
        <div className="rounded-2xl border border-border/40 bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/5">
          <div className="flex items-center justify-between px-6 py-3.5">
            <motion.div className="flex items-center gap-3 cursor-pointer" whileHover={{ scale: 1.02 }} onClick={() => navigate("/")}>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Store className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="font-heading text-lg font-bold tracking-tight">MiTienda</span>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8">
              {["Características", "Cómo funciona", "Tiendas", "Testimonios"].map((item, i) => (
                <a key={item} href={`#${["features", "steps", "tiendas", "testimonials"][i]}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary rounded-full transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {user ? (
                <Button onClick={() => navigate("/dashboard")} className="gap-2 rounded-xl" size="sm">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex rounded-xl" size="sm">Iniciar Sesión</Button>
                  <Button onClick={() => navigate("/auth")} className="gap-2 rounded-xl" size="sm">
                    <Rocket className="h-4 w-4" />
                    <span className="hidden sm:inline">Comenzar Gratis</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* ==================== HERO ==================== */}
      <motion.section ref={heroRef} className="relative min-h-screen flex items-center pt-28 pb-20" style={{ opacity: heroOpacity }}>
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_100%,hsl(var(--gold)/0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          
          {/* Subtle animated orbs */}
          <motion.div 
            className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px]"
            animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[150px]"
            animate={{ x: [0, -40, 0], y: [0, -30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <motion.div className="container mx-auto px-4 md:px-8 relative z-10" style={{ y: heroY }}>
          <div className="max-w-5xl mx-auto">
            <motion.div className="text-center space-y-8" initial="hidden" animate="visible" variants={stagger}>
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent font-semibold">
                    Plataforma #1 de E-commerce en LATAM
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                </span>
              </motion.div>

              {/* Title */}
              <motion.div variants={fadeUp} custom={1} className="space-y-3">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading leading-[0.95] tracking-tight">
                  <span className="block">Crea tu tienda</span>
                  <span className="block bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">
                    en minutos
                  </span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Todo lo que necesitas para <span className="text-foreground font-medium">vender online</span>. 
                Gestiona productos, pedidos, pagos y conecta con clientes por WhatsApp.
              </motion.p>

              {/* CTA */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.98 }} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-orange-400 to-gold rounded-2xl blur-lg opacity-40 group-hover:opacity-70 transition-opacity" />
                  <Button 
                    size="lg" 
                    className="relative text-base px-10 py-7 gap-3 rounded-xl shadow-2xl shadow-primary/20 font-semibold"
                    onClick={() => navigate("/auth")}
                  >
                    <Zap className="h-5 w-5" />
                    Crear Tienda Gratis
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" variant="outline"
                    className="text-base px-10 py-7 rounded-xl border-2 hover:bg-primary/5 hover:border-primary/40 transition-all backdrop-blur-sm gap-2"
                    onClick={() => document.getElementById('tiendas')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Eye className="h-5 w-5" />
                    Ver Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap justify-center gap-3">
                {["Sin código necesario", "Configuración en 5 min", "Soporte 24/7", "14 días gratis"].map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/40 backdrop-blur-sm text-sm text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    {b}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Stats Row */}
            <motion.div 
              initial="hidden" animate="visible" variants={stagger}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
            >
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i + 5} whileHover={{ y: -4 }} className="group">
                  <div className="relative p-6 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm text-center hover:border-primary/30 transition-all duration-300 overflow-hidden">
                    <motion.div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <stat.icon className="h-5 w-5 text-primary mx-auto mb-3 relative z-10" />
                    <p className="text-3xl md:text-4xl font-bold font-heading relative z-10">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wide relative z-10">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <motion.div 
            className="flex flex-col items-center gap-2 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Explorar</span>
            <div className="w-5 h-9 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <motion.div className="w-1 h-2.5 rounded-full bg-muted-foreground/40" animate={{ y: [0, 6, 0], opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ==================== FEATURES - BENTO GRID ==================== */}
      <section id="features" className="py-24 md:py-32 relative" ref={featuresRef}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-transparent" />
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="text-center mb-16"
            initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full"><Zap className="h-3.5 w-3.5 mr-2" />Características</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
              Todo lo que necesitas
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas profesionales para hacer crecer tu negocio online
            </motion.p>
          </motion.div>
          
          {/* Bento Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
            initial="hidden" animate={featuresInView ? "visible" : "hidden"} variants={stagger}
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={feature.size === "large" ? "lg:col-span-2" : ""}
              >
                <Card className="group h-full border-border/30 bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:bg-card/70 transition-all duration-500 overflow-hidden relative">
                  <motion.div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className={`p-8 ${feature.size === "large" ? "flex items-start gap-6" : ""}`}>
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300 shrink-0">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="steps" className="py-24 md:py-32 relative" ref={stepsRef}>
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)/0.06),transparent_60%)]" />
        </div>
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div className="text-center mb-16" initial="hidden" animate={stepsInView ? "visible" : "hidden"} variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full"><Layers className="h-3.5 w-3.5 mr-2" />Cómo Funciona</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
              4 pasos para empezar
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              De la idea a tu primera venta en menos de 10 minutos
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto"
            initial="hidden" animate={stepsInView ? "visible" : "hidden"} variants={stagger}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8 }}
                onHoverStart={() => setActiveStep(i)}
                className="relative group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
                )}
                <div className="relative p-8 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 text-center overflow-hidden">
                  <motion.div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Step number */}
                  <div className="absolute top-4 right-4 text-xs font-mono text-muted-foreground/40 font-bold">
                    0{i + 1}
                  </div>
                  
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10`}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-base mb-2 relative z-10">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA after steps */}
          <motion.div 
            className="text-center mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button size="lg" onClick={() => navigate("/auth")} className="gap-3 rounded-xl px-10 py-6 text-base shadow-lg shadow-primary/15">
                <Rocket className="h-5 w-5" />
                Empezar Ahora — Es Gratis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== STORE PREVIEW ==================== */}
      <section id="tiendas" className="py-24 md:py-32 relative" ref={storesRef}>
        <div className="container mx-auto px-4 md:px-8">
          <motion.div className="text-center mb-16" initial="hidden" animate={storesInView ? "visible" : "hidden"} variants={stagger}>
            <motion.div variants={fadeUp} custom={0}>
              <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full"><Palette className="h-3.5 w-3.5 mr-2" />Vista Previa</Badge>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
              Así lucirá tu tienda
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Explora dos estilos completamente diferentes — cada una 100% personalizable
            </motion.p>

            {/* Store Switcher */}
            <motion.div variants={fadeUp} custom={3} className="flex justify-center gap-3">
              {demoStores.map((s, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActiveStore(i)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
                    activeStore === i 
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10" 
                      : "border-border/40 bg-card/30 hover:border-primary/30"
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <span className={`font-heading font-semibold text-sm ${activeStore === i ? "text-primary" : "text-muted-foreground"}`}>{s.name}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
          
          {/* Store Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStore}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-5xl mx-auto"
            >
              {/* Store Header */}
              <Card className="overflow-hidden border-border/30 bg-card/40 backdrop-blur-sm mb-6">
                <div className={`relative h-40 md:h-56 bg-gradient-to-br ${store.gradient}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-end gap-4">
                    <motion.div 
                      className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br ${store.logoGradient} flex items-center justify-center border-4 border-card shadow-xl text-2xl md:text-3xl`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    >
                      {store.icon}
                    </motion.div>
                    <div className="pb-1">
                      <h3 className="text-xl md:text-2xl font-heading font-bold">{store.name}</h3>
                      <p className="text-sm text-muted-foreground">{store.tagline}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Categories */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {store.categories.map((cat, i) => (
                  <motion.div key={cat.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }}>
                    <Badge variant={i === 0 ? "default" : "outline"} className="px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      <span className="mr-1.5">{cat.icon}</span>{cat.name}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              {/* Products Grid */}
              <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5" initial="hidden" animate="visible" variants={stagger}>
                {store.products.map((product, i) => (
                  <motion.div key={`${activeStore}-${i}`} variants={fadeUp} custom={i} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card className="group h-full overflow-hidden border-border/30 bg-card/40 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                      <div className="relative aspect-square bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
                        <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">{product.image}</span>
                        <Badge className="absolute top-2 left-2 rounded-full text-[10px]" variant="secondary">{product.badge}</Badge>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-primary">{product.price}</span>
                          {product.originalPrice && <span className="text-xs text-muted-foreground line-through">{product.originalPrice}</span>}
                        </div>
                        <div className="flex items-center gap-0.5 mt-1.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-3 w-3 ${j < 4 + (i % 2) ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA below store */}
              <motion.div className="text-center mt-10 space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="flex flex-wrap justify-center gap-2">
                  {["Personaliza colores", "Agrega productos", "Recibe pagos", "Conecta WhatsApp"].map((item, i) => (
                    <Badge key={i} variant="outline" className="px-3 py-1.5 rounded-full gap-1.5 text-xs">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />{item}
                    </Badge>
                  ))}
                </div>
                <Button onClick={() => navigate("/auth")} size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/15">
                  <Rocket className="h-5 w-5" />Crear Mi Tienda Ahora<ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section id="testimonials" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_20%_50%,hsl(var(--primary)/0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_50%,hsl(var(--gold)/0.04),transparent_60%)]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full">
              <Star className="h-3.5 w-3.5 mr-2 fill-yellow-400 text-yellow-400" />Testimonios
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4">
              Lo que dicen nuestros
              <span className="block mt-2 bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">clientes felices</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Miles de emprendedores confían en MiTienda para hacer crecer su negocio
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
              >
                <Card className="h-full border-border/30 bg-card/40 backdrop-blur-sm hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden group">
                  <CardContent className="p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(t.rating)].map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-[10px] rounded-full bg-green-500/10 text-green-600 border-green-500/20">
                        {t.metric}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-5 text-sm">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/15 to-gold/15 flex items-center justify-center text-xl border border-primary/10">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-10 md:gap-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {[
              { value: "4.9/5", label: "Calificación promedio" },
              { value: "2,500+", label: "Reseñas verificadas" },
              { value: "98%", label: "Recomiendan MiTienda" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold font-heading bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[200px]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-8 relative">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-primary/15 bg-card/50 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-10 md:p-16 text-center space-y-7">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-green-500/30 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />14 días gratis
                </Badge>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading">
                  ¿Listo para
                  <span className="block mt-2 bg-gradient-to-r from-primary via-orange-400 to-gold bg-clip-text text-transparent">empezar a vender?</span>
                </h2>
                
                <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                  Crea tu tienda en minutos y comienza a recibir pedidos hoy. Sin tarjeta, sin compromisos.
                </p>
                
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="text-base px-10 py-6 gap-3 rounded-xl shadow-lg shadow-primary/20 group" onClick={() => navigate("/auth")}>
                    <Rocket className="h-5 w-5" />
                    Crear Mi Tienda Gratis
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm text-muted-foreground">
                  {["Sin código", "5 min setup", "Soporte 24/7"].map((item, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />{item}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="relative border-t border-border/20 bg-gradient-to-b from-background to-muted/5 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gold/3 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <Store className="h-4.5 w-4.5 text-primary-foreground" />
                </div>
                <span className="font-heading text-lg font-bold tracking-tight">APP TIENDA</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                La plataforma #1 de e-commerce en LATAM. Crea tu tienda online profesional en minutos.
              </p>
              <div className="flex items-center gap-2.5">
                {["𝕏", "📷", "📘", "💬"].map((icon, i) => (
                  <a key={i} href="#" className="h-8 w-8 rounded-lg border border-border/30 bg-card/30 flex items-center justify-center text-sm hover:border-primary/30 hover:bg-primary/5 transition-all">
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Producto", links: ["Características", "Precios", "Tiendas", "Testimonios", "Integraciones"] },
              { title: "Recursos", links: ["Centro de Ayuda", "Guía de Inicio", "Blog", "API Docs", "Estado del Servicio"] },
              { title: "Empresa", links: ["Sobre Nosotros", "Contacto", "Términos", "Privacidad", "Afiliados"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-heading font-semibold text-xs uppercase tracking-wider mb-4 text-muted-foreground">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group">
                        {link}
                        <ChevronRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="py-6 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Recibe tips de e-commerce y novedades</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input type="email" placeholder="tu@email.com" className="flex-1 md:w-56 h-9 rounded-xl border border-border/40 bg-card/30 px-4 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors" />
              <Button size="sm" className="rounded-xl px-4 gap-1.5 text-xs">Suscribirse<ArrowRight className="h-3 w-3" /></Button>
            </div>
          </div>

          <div className="py-5 border-t border-border/15 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} APP TIENDA. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />Todos los sistemas operativos
              </span>
              <span className="mx-2">•</span>
              <span>Hecho con 💜 en LATAM</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
