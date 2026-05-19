import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Heart, Search, Menu, ShieldCheck, Truck,
  RotateCcw, Headphones, Smartphone, Monitor, Package, CreditCard, CheckCircle2,
  MapPin, Tag, Lock, MessageCircle, BadgeCheck, Sparkles, ArrowLeft, Plus, Minus,
  Clock, Zap, Play, Pause, Eye, Flame, Gift, TrendingUp, Award, Bell, Users
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const demoProducts = [
  { name: "Gorra Premium NY", price: 599, original: 799, rating: 4.8, reviews: 128, tag: "Más vendido", color: "from-amber-500/20 to-orange-500/10", emoji: "🧢", stock: 7 },
  { name: "Sneakers Urban Pro", price: 1299, original: 1599, rating: 4.9, reviews: 84, tag: "Nuevo", color: "from-blue-500/20 to-cyan-500/10", emoji: "👟", stock: 3 },
  { name: "Hoodie Oversized", price: 899, original: 1099, rating: 4.7, reviews: 256, tag: "Oferta", color: "from-rose-500/20 to-pink-500/10", emoji: "🧥", stock: 12 },
  { name: "Mochila Street", price: 749, original: null, rating: 4.6, reviews: 62, tag: "Popular", color: "from-emerald-500/20 to-green-500/10", emoji: "🎒", stock: 18 },
];

const categories = ["Inicio", "Novedades", "Ofertas", "Hombre", "Mujer"];

const reviews = [
  { name: "Ana M.", rating: 5, text: "¡Calidad increíble, llegó en 24h!", avatar: "🧑‍🦰" },
  { name: "Luis R.", rating: 5, text: "Mejor de lo que esperaba, recomendado.", avatar: "👨" },
  { name: "Sofía P.", rating: 4, text: "Excelente atención al cliente.", avatar: "👩" },
];

const liveNotifications = [
  { icon: ShoppingCart, text: "María de CDMX compró hace 2 min", color: "bg-emerald-500" },
  { icon: Eye, text: "12 personas viendo este producto", color: "bg-blue-500" },
  { icon: Flame, text: "¡Quedan pocas unidades!", color: "bg-rose-500" },
  { icon: Award, text: "Carlos ganó 50 puntos de lealtad", color: "bg-amber-500" },
];

type Scene = "catalog" | "product" | "cart" | "checkout" | "confirmation";

const scenes: { id: Scene; label: string; icon: any }[] = [
  { id: "catalog", label: "Catálogo", icon: Search },
  { id: "product", label: "Producto", icon: Package },
  { id: "cart", label: "Carrito", icon: ShoppingCart },
  { id: "checkout", label: "Pago", icon: CreditCard },
  { id: "confirmation", label: "Listo", icon: CheckCircle2 },
];

interface StorePreviewMockupProps {
  viewMode?: "desktop" | "mobile";
  onViewModeChange?: (mode: "desktop" | "mobile") => void;
}

// Reusable focus-visible ring (use design tokens, never raw colors)
const focusRing =
  "focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const StorePreviewMockup = ({ viewMode = "desktop", onViewModeChange }: StorePreviewMockupProps) => {
  const isMobile = viewMode === "mobile";
  const [activeCategory, setActiveCategory] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [liked, setLiked] = useState<number[]>([0]);
  const [scene, setScene] = useState<Scene>("catalog");
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<"paypal" | "transfer">("paypal");
  const [autoplay, setAutoplay] = useState(true);
  const [notifIndex, setNotifIndex] = useState(0);
  const [stockTime, setStockTime] = useState({ h: 2, m: 47, s: 32 });
  const [viewers, setViewers] = useState(23);
  const sceneRef = useRef(scene);
  sceneRef.current = scene;
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const goToScene = (id: Scene) => { setScene(id); setAutoplay(false); };

  const onTabsKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const order = scenes.map(s => s.id);
    const idx = order.indexOf(scene);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % order.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + order.length) % order.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = order.length - 1;
    else return;
    e.preventDefault();
    goToScene(order[next]);
    tabRefs.current[next]?.focus();
  };

  // Autoplay scene cycle
  useEffect(() => {
    if (!autoplay) return;
    const order: Scene[] = ["catalog", "product", "cart", "checkout", "confirmation"];
    const interval = setInterval(() => {
      const idx = order.indexOf(sceneRef.current);
      const next = order[(idx + 1) % order.length];
      setScene(next);
      if (next === "cart") setCartCount(c => Math.min(c + 1, 5));
      if (next === "catalog") setCartCount(2);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoplay]);

  // Live notifications rotation
  useEffect(() => {
    const t = setInterval(() => setNotifIndex(i => (i + 1) % liveNotifications.length), 3200);
    return () => clearInterval(t);
  }, []);

  // Countdown
  useEffect(() => {
    const t = setInterval(() => {
      setStockTime(p => {
        let { h, m, s } = p;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 47; s = 32; }
        return { h, m, s };
      });
      setViewers(v => Math.max(15, Math.min(45, v + Math.floor(Math.random() * 5) - 2)));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const toggleLike = (i: number) => {
    setLiked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const addToCart = () => {
    setCartCount(c => c + 1);
    setScene("cart");
  };

  const fmt = (n: number) => `$${n.toLocaleString("es-MX")}`;
  const featured = demoProducts[1];
  const subtotal = featured.price * qty + demoProducts[0].price;
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min(100, (subtotal / 999) * 100);
  const loyaltyPoints = Math.floor(total / 10);
  const pad = (n: number) => n.toString().padStart(2, "0");

  const productColors = [
    { name: "Negro", hex: "#1a1a1a" },
    { name: "Blanco", hex: "#f5f5f5" },
    { name: "Rojo", hex: "#dc2626" },
    { name: "Azul", hex: "#2563eb" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
      role="region"
      aria-label="Vista previa interactiva de tienda demostrativa"
    >
      {/* Controls Row */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
        {/* View Mode Toggle */}
        <div
          className="inline-flex bg-muted/40 rounded-xl p-1 gap-1 border border-border/30"
          role="group"
          aria-label="Cambiar vista del dispositivo"
        >
          <button
            type="button"
            onClick={() => onViewModeChange?.("desktop")}
            aria-pressed={!isMobile}
            aria-label="Ver maqueta en escritorio"
            className={`${focusRing} flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isMobile ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Escritorio</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.("mobile")}
            aria-pressed={isMobile}
            aria-label="Ver maqueta en móvil"
            className={`${focusRing} flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isMobile ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Móvil</span>
          </button>
        </div>

        {/* Autoplay Toggle */}
        <button
          type="button"
          onClick={() => setAutoplay(a => !a)}
          aria-pressed={autoplay}
          aria-label={autoplay ? "Pausar recorrido automático" : "Reanudar recorrido automático"}
          className={`${focusRing} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            autoplay
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600"
              : "bg-muted/40 border-border/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          {autoplay ? <Pause className="h-3 w-3" aria-hidden="true" /> : <Play className="h-3 w-3" aria-hidden="true" />}
          {autoplay ? "Auto-tour" : "Pausado"}
          {autoplay && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />}
        </button>

        {/* Live viewers */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-600"
          role="status"
          aria-live="polite"
          aria-label={`${viewers} personas viendo la tienda en vivo`}
        >
          <Users className="h-3 w-3" aria-hidden="true" />
          <motion.span key={viewers} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{viewers}</motion.span>
          <span className="hidden sm:inline">en vivo</span>
        </div>
      </div>

      {/* Scene Selector */}
      <div className="flex justify-center mb-4 px-2">
        <div
          role="tablist"
          aria-label="Escenas del recorrido de compra"
          onKeyDown={onTabsKeyDown}
          className="inline-flex flex-wrap justify-center gap-1 bg-muted/30 rounded-xl p-1 border border-border/30 max-w-full"
        >
          {scenes.map((s, idx) => {
            const Icon = s.icon;
            const active = scene === s.id;
            return (
              <button
                key={s.id}
                ref={el => (tabRefs.current[idx] = el)}
                type="button"
                role="tab"
                id={`scene-tab-${s.id}`}
                aria-selected={active}
                aria-controls={`scene-panel-${s.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => goToScene(s.id)}
                className={`${focusRing} relative flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  active ? "bg-card text-foreground shadow-md ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] ${active ? "bg-primary text-primary-foreground" : "bg-muted-foreground/15"}`} aria-hidden="true">{idx + 1}</span>
                <Icon className={`h-3 w-3 ${active ? "text-primary" : ""}`} aria-hidden="true" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sr-only">Paso {idx + 1}: {s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Glow */}
      <div className={`absolute -inset-4 bg-gradient-to-r from-primary/20 via-orange-400/10 to-gold/20 rounded-[2.5rem] blur-2xl opacity-40 pointer-events-none ${isMobile ? 'top-12' : ''}`} aria-hidden="true" />

      {/* Device Frame */}
      <div className={`relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isMobile
          ? "max-w-[280px] rounded-[2.5rem] border-[6px] border-border/50 bg-card/80 shadow-2xl shadow-black/40 overflow-hidden"
          : "max-w-lg rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden"
      }`}>
        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="h-7 bg-gradient-to-b from-muted/50 to-transparent flex items-center justify-between px-6 pt-1 relative" aria-hidden="true">
            <span className="text-[10px] font-semibold text-muted-foreground">9:41</span>
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-16 h-3.5 rounded-full bg-black/80" />
            <div className="flex gap-1 items-center">
              <span className="text-[8px] text-muted-foreground/70">5G</span>
              <div className="w-4 h-2 rounded-sm border border-muted-foreground/40 relative">
                <div className="absolute inset-0.5 right-1 bg-emerald-500 rounded-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Browser Header (desktop only) */}
        {!isMobile && (
          <div className="px-4 py-3 border-b border-border/30 bg-muted/30 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 mx-2">
              <div className="h-7 rounded-lg bg-background/60 border border-border/20 flex items-center px-3 gap-2">
                <Lock className="w-2.5 h-2.5 text-green-500/80" />
                <span className="text-[10px] text-muted-foreground/60 font-mono truncate">mitienda.com/moda-urbana</span>
                <div className="ml-auto flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-emerald-600 font-semibold">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Persistent Store Header (hidden on confirmation) */}
        {scene !== "confirmation" && (
          <div className="px-3 pt-3">
            <div className={`rounded-2xl bg-gradient-to-r from-primary/90 via-primary/80 to-primary/70 p-3 text-primary-foreground shadow-lg relative overflow-hidden ${isMobile ? 'rounded-xl' : ''}`}>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.08)_50%,transparent_70%)] bg-[length:200%_200%] animate-shimmer pointer-events-none" />
              <div className="relative flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(scene === "product" || scene === "cart" || scene === "checkout") ? (
                    <button
                      type="button"
                      onClick={() => goToScene(scene === "product" ? "catalog" : scene === "cart" ? "product" : "cart")}
                      aria-label="Volver a la pantalla anterior"
                      className={`${focusRing} w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors`}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm" aria-hidden="true">M</div>
                  )}
                  <div>
                    <span className="font-bold text-sm leading-tight block">Moda Urbana</span>
                    <span className="text-[8px] text-white/70 flex items-center gap-1"><BadgeCheck className="h-2 w-2" aria-hidden="true" /> Tienda verificada</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Buscar productos"
                    className={`${focusRing} w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20`}
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Ver carrito, ${cartCount} artículos`}
                    className={`${focusRing} w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center relative hover:bg-white/20`}
                    onClick={() => goToScene("cart")}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 1.6, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      aria-hidden="true"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[9px] font-bold flex items-center justify-center text-black ring-2 ring-primary"
                    >
                      {cartCount}
                    </motion.span>
                  </button>
                  <button
                    type="button"
                    aria-label="Abrir menú"
                    className={`${focusRing} w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20`}
                  >
                    <Menu className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {scene === "catalog" && (
                <div
                  role="tablist"
                  aria-label="Categorías"
                  className={`flex gap-1 relative ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'}`}
                >
                  {categories.map((cat, i) => (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === i}
                      onClick={() => setActiveCategory(i)}
                      className={`${focusRing} px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
                        activeCategory === i ? "bg-white/20 backdrop-blur-sm" : "bg-transparent hover:bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Notification Toast */}
        {scene !== "confirmation" && (
          <div className="px-3 mt-2 h-7 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={notifIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-card/70 border border-border/30 backdrop-blur-sm shadow-sm"
              >
                <div className={`w-4 h-4 rounded-full ${liveNotifications[notifIndex].color} flex items-center justify-center shrink-0`}>
                  {(() => {
                    const Ic = liveNotifications[notifIndex].icon;
                    return <Ic className="h-2.5 w-2.5 text-white" />;
                  })()}
                </div>
                <span className="text-[9px] font-medium text-foreground/80 truncate">{liveNotifications[notifIndex].text}</span>
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Scene Content */}
        <div className={`p-3 space-y-3 overflow-hidden relative ${isMobile ? 'max-h-[480px]' : 'max-h-[500px]'}`}>
          <AnimatePresence mode="wait">
            {/* ============ CATALOG ============ */}
            {scene === "catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* Hero Banner with countdown */}
                <div className={`relative rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 flex items-center px-4 ${isMobile ? 'h-24' : 'h-28'}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                  <div className="relative z-10 flex-1">
                    <p className="text-[9px] uppercase tracking-wider text-primary/80 font-bold mb-0.5 flex items-center gap-1"><Flame className="h-2.5 w-2.5" /> Oferta flash</p>
                    <p className={`font-bold text-white leading-tight ${isMobile ? 'text-xs' : 'text-sm'}`}>Estilo Urbano -40%</p>
                    <div className="flex gap-1 mt-1">
                      {[{l:"H",v:stockTime.h},{l:"M",v:stockTime.m},{l:"S",v:stockTime.s}].map((t,i) => (
                        <div key={i} className="px-1.5 py-0.5 rounded bg-white/15 backdrop-blur-sm">
                          <span className="text-[10px] font-mono font-bold text-white">{pad(t.v)}</span>
                          <span className="text-[7px] text-white/60 ml-0.5">{t.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-gold/20 blur-md" />
                </div>

                {/* Trust Bar */}
                <div className="flex justify-between px-1">
                  {[
                    { icon: ShieldCheck, label: "Pago seguro" },
                    { icon: Truck, label: "Envío 24h" },
                    { icon: RotateCcw, label: "30 días" },
                    { icon: Headphones, label: "Soporte" },
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <t.icon className="h-3 w-3 text-primary/60" />
                      <span className="text-[8px] text-muted-foreground/60 font-medium">{t.label}</span>
                    </div>
                  ))}
                </div>

                {/* Products */}
                <div className="grid gap-2 grid-cols-2">
                  {demoProducts.map((product, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2 }}
                      onClick={() => { setAutoplay(false); setScene("product"); }}
                      className="rounded-xl border border-border/30 bg-card/50 p-2 space-y-1.5 cursor-pointer group"
                    >
                      <div className={`relative rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center overflow-hidden ${isMobile ? 'h-14' : 'h-16'}`}>
                        <div className="text-2xl opacity-50 select-none group-hover:scale-110 transition-transform duration-300">{product.emoji}</div>
                        <div className="absolute top-1.5 left-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/90 text-[8px] font-bold text-primary-foreground">{product.tag}</span>
                        </div>
                        {product.stock <= 5 && (
                          <div className="absolute bottom-1 left-1.5">
                            <span className="px-1 py-0.5 rounded bg-rose-500/95 text-[7px] font-bold text-white flex items-center gap-0.5">
                              <Flame className="h-2 w-2" /> ¡{product.stock}!
                            </span>
                          </div>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLike(i); }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Heart className={`h-2.5 w-2.5 ${liked.includes(i) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        <p className={`font-semibold leading-tight truncate group-hover:text-primary transition-colors ${isMobile ? 'text-[10px]' : 'text-[11px]'}`}>{product.name}</p>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                          <span className="text-[9px] font-medium">{product.rating}</span>
                          <span className="text-[9px] text-muted-foreground/50">({product.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-primary">{fmt(product.price)}</span>
                          {product.original && <span className="text-[9px] text-muted-foreground/40 line-through">{fmt(product.original)}</span>}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ============ PRODUCT DETAIL ============ */}
            {scene === "product" && (
              <motion.div
                key="product"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2.5"
              >
                <div className={`relative rounded-xl bg-gradient-to-br ${featured.color} flex items-center justify-center overflow-hidden ${isMobile ? 'h-32' : 'h-36'}`}>
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-5xl opacity-60"
                  >
                    {featured.emoji}
                  </motion.div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/95 text-[9px] font-bold text-white shadow-sm">-19%</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/95 text-[9px] font-bold text-primary-foreground shadow-sm">{featured.tag}</span>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
                    <Eye className="h-2.5 w-2.5 text-white" />
                    <span className="text-[9px] font-bold text-white">{viewers}</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                    {[0,1,2,3].map(i => <div key={i} className={`h-1 rounded-full transition-all ${i === 0 ? 'bg-primary w-4' : 'bg-white/40 w-1.5'}`} />)}
                  </div>
                </div>

                {/* Stock urgency */}
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3 w-3 text-rose-500" />
                    <span className="text-[9px] font-semibold text-rose-600">Solo {featured.stock} disponibles</span>
                  </div>
                  <div className="flex-1 mx-2 h-1 rounded-full bg-rose-500/15 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-600" style={{ width: '20%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm leading-tight">{featured.name}</h3>
                    <button onClick={() => toggleLike(1)} className="w-7 h-7 rounded-full bg-muted/40 flex items-center justify-center">
                      <Heart className={`h-3.5 w-3.5 ${liked.includes(1) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_,i) => <Star key={i} className="h-2.5 w-2.5 fill-gold text-gold" />)}
                    </div>
                    <span className="font-semibold">{featured.rating}</span>
                    <span className="text-muted-foreground/60">({featured.reviews} reseñas)</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">{fmt(featured.price)}</span>
                    <span className="text-[10px] text-muted-foreground/50 line-through">{fmt(featured.original!)}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[9px] font-bold">Ahorras {fmt(featured.original! - featured.price)}</span>
                  </div>
                </div>

                {/* Color selector */}
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold">Color:</p>
                  <div className="flex gap-1.5">
                    {productColors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(i)}
                        title={c.name}
                        className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === i ? "border-primary scale-110 ring-2 ring-primary/30" : "border-border/40"}`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground ml-auto">{productColors[selectedColor].name}</span>
                </div>

                {/* Size selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-semibold">Talla: <span className="text-primary">{selectedSize}</span></p>
                    <span className="text-[9px] text-primary underline cursor-pointer">Guía de tallas</span>
                  </div>
                  <div className="flex gap-1.5">
                    {["S", "M", "L", "XL"].map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${
                          selectedSize === s ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" : "bg-card border-border/40 hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reviews mini */}
                <div className="p-2 rounded-lg bg-muted/30 border border-border/20">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-bold flex items-center gap-1"><Star className="h-2.5 w-2.5 fill-gold text-gold" /> Reseñas verificadas</p>
                    <span className="text-[8px] text-muted-foreground">Ver todas</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-lg">{reviews[0].avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold">{reviews[0].name}</span>
                        <BadgeCheck className="h-2.5 w-2.5 text-emerald-500" />
                      </div>
                      <p className="text-[9px] text-muted-foreground truncate">"{reviews[0].text}"</p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30">
                    <Truck className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Envío gratis +$999</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30">
                    <RotateCcw className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Devolución 30 días</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={addToCart}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/30 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Agregar al carrito · {fmt(featured.price)}
                </motion.button>
              </motion.div>
            )}

            {/* ============ CART ============ */}
            {scene === "cart" && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2.5"
              >
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <ShoppingCart className="h-3.5 w-3.5 text-primary" /> Tu carrito ({cartCount})
                </h3>

                {/* Free shipping progress */}
                <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-semibold flex items-center gap-1">
                      <Truck className="h-2.5 w-2.5 text-emerald-600" />
                      {shipping === 0 ? "¡Envío gratis desbloqueado!" : `Te faltan ${fmt(999 - subtotal)} para envío gratis`}
                    </span>
                    {shipping === 0 && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                  </div>
                  <div className="h-1.5 rounded-full bg-emerald-500/15 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShippingProgress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                    />
                  </div>
                </div>

                {[featured, demoProducts[0]].map((p, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded-xl border border-border/30 bg-card/40">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                      <span className="text-xl">{p.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold truncate">{p.name}</p>
                      {i === 0 && <p className="text-[9px] text-muted-foreground">Talla: {selectedSize} · {productColors[selectedColor].name}</p>}
                      <p className="text-[11px] font-bold text-primary mt-0.5">{fmt(p.price)}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center gap-1 bg-muted/40 rounded-md p-0.5">
                        <button onClick={() => i === 0 && setQty(Math.max(1, qty - 1))} className="w-4 h-4 flex items-center justify-center hover:bg-card rounded">
                          <Minus className="h-2 w-2" />
                        </button>
                        <span className="text-[10px] font-bold w-4 text-center">{i === 0 ? qty : 1}</span>
                        <button onClick={() => i === 0 && setQty(qty + 1)} className="w-4 h-4 flex items-center justify-center hover:bg-card rounded">
                          <Plus className="h-2 w-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recommended */}
                <div className="space-y-1">
                  <p className="text-[10px] font-bold flex items-center gap-1"><TrendingUp className="h-2.5 w-2.5 text-primary" /> Te puede interesar</p>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {demoProducts.slice(2).map((p, i) => (
                      <div key={i} className="shrink-0 w-20 rounded-lg border border-border/30 bg-card/40 p-1.5">
                        <div className={`h-10 rounded-md bg-gradient-to-br ${p.color} flex items-center justify-center`}>
                          <span className="text-lg">{p.emoji}</span>
                        </div>
                        <p className="text-[8px] font-semibold truncate mt-1">{p.name}</p>
                        <p className="text-[9px] font-bold text-primary">{fmt(p.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon */}
                <div className="flex gap-1.5 items-center p-2 rounded-xl bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20">
                  <Tag className="h-3 w-3 text-primary shrink-0" />
                  <input
                    placeholder="Código de descuento"
                    className="flex-1 bg-transparent text-[10px] outline-none placeholder:text-muted-foreground/50"
                  />
                  <button className="px-2 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] font-bold">Aplicar</button>
                </div>

                {/* Summary */}
                <div className="p-2.5 rounded-xl bg-muted/30 space-y-1">
                  <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">Envío</span>
                    {shipping === 0 ? <span className="font-semibold text-emerald-600">GRATIS</span> : <span className="font-semibold">{fmt(shipping)}</span>}
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><Award className="h-2.5 w-2.5 text-gold" /> Ganarás</span>
                    <span className="font-semibold text-gold">+{loyaltyPoints} pts</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-border/30"><span>Total</span><span className="text-primary">{fmt(total)}</span></div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScene("checkout")}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/30"
                >
                  Continuar al pago <ArrowRightSmall />
                </motion.button>
              </motion.div>
            )}

            {/* ============ CHECKOUT ============ */}
            {scene === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" /> Checkout seguro
                  </h3>
                  <div className="flex items-center gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 rounded-full transition-all ${i <= 2 ? 'bg-primary w-4' : 'bg-muted-foreground/20 w-2'}`} />
                    ))}
                  </div>
                </div>

                {/* Address */}
                <div className="p-2 rounded-xl border border-border/30 bg-card/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-bold">Dirección de envío</span>
                    </div>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-semibold">Guardada</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-foreground/80">Juan Pérez</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-foreground/80">CDMX</div>
                      <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-foreground/80">06600</div>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold">Método de pago</span>
                  <button
                    onClick={() => setSelectedPayment("paypal")}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      selectedPayment === "paypal" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/30 bg-card/40"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${selectedPayment === "paypal" ? "border-primary" : "border-muted-foreground/30"} flex items-center justify-center`}>
                      {selectedPayment === "paypal" && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <div className="w-7 h-5 rounded bg-[#003087] flex items-center justify-center text-[7px] font-bold text-white">PP</div>
                    <span className="text-[10px] font-semibold flex-1 text-left">PayPal</span>
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  </button>
                  <button
                    onClick={() => setSelectedPayment("transfer")}
                    className={`w-full flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      selectedPayment === "transfer" ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border/30 bg-card/40"
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${selectedPayment === "transfer" ? "border-primary" : "border-muted-foreground/30"} flex items-center justify-center`}>
                      {selectedPayment === "transfer" && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-semibold flex-1 text-left">Transferencia bancaria</span>
                  </button>
                </div>

                {/* Gift wrap */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20">
                  <Gift className="h-3.5 w-3.5 text-pink-500" />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold">¿Es un regalo?</p>
                    <p className="text-[8px] text-muted-foreground">Empaque de regalo gratis</p>
                  </div>
                  <div className="w-7 h-4 rounded-full bg-muted-foreground/20 relative">
                    <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white" />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center p-2 rounded-xl bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20">
                  <div>
                    <span className="text-[10px] font-bold block">Total a pagar</span>
                    <span className="text-[8px] text-gold flex items-center gap-0.5"><Award className="h-2 w-2" /> +{loyaltyPoints} puntos</span>
                  </div>
                  <span className="text-base font-bold text-primary">{fmt(total)}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScene("confirmation")}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30"
                >
                  <Lock className="h-3 w-3" />
                  Pagar de forma segura
                </motion.button>
                <div className="flex items-center justify-center gap-3 text-[9px] text-muted-foreground/60">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-2.5 w-2.5" /> SSL</span>
                  <span className="flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> PCI</span>
                  <span className="flex items-center gap-1"><BadgeCheck className="h-2.5 w-2.5" /> Verificado</span>
                </div>
              </motion.div>
            )}

            {/* ============ CONFIRMATION ============ */}
            {scene === "confirmation" && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="space-y-3 py-1"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.1, stiffness: 200 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
                    {/* Confetti */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1 }}
                        animate={{
                          x: Math.cos(i * 45 * Math.PI / 180) * 50,
                          y: Math.sin(i * 45 * Math.PI / 180) * 50,
                          opacity: 0,
                        }}
                        transition={{ duration: 1.5, delay: 0.3, repeat: Infinity, repeatDelay: 2 }}
                        className={`absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full ${
                          ['bg-primary', 'bg-gold', 'bg-emerald-500', 'bg-rose-500'][i % 4]
                        }`}
                      />
                    ))}
                    <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                      <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-bold">¡Pedido confirmado!</h3>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Orden #MT-2847 · {fmt(total)}</p>
                    <p className="text-[9px] text-gold flex items-center justify-center gap-1 mt-0.5">
                      <Award className="h-2.5 w-2.5" /> Ganaste {loyaltyPoints} puntos
                    </p>
                  </div>
                </div>

                {/* Mini map tracking */}
                <div className="relative h-16 rounded-xl bg-gradient-to-br from-blue-500/10 via-emerald-500/5 to-blue-500/10 border border-border/30 overflow-hidden">
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'linear-gradient(rgba(100,100,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,100,100,0.1) 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }} />
                  {/* Route */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 64" preserveAspectRatio="none">
                    <motion.path
                      d="M 20 48 Q 60 20, 100 32 T 180 16"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </svg>
                  {/* Origin */}
                  <div className="absolute left-3 bottom-3 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                    <span className="text-[8px] font-bold">Tienda</span>
                  </div>
                  {/* Truck animation */}
                  <motion.div
                    initial={{ left: "10%", top: "70%" }}
                    animate={{ left: "75%", top: "20%" }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    className="absolute"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/50">
                      <Truck className="h-2.5 w-2.5 text-primary-foreground" />
                    </div>
                  </motion.div>
                  {/* Destination */}
                  <div className="absolute right-3 top-2 flex items-center gap-1">
                    <span className="text-[8px] font-bold">Tú</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-primary/30 animate-pulse" />
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-1.5 p-2 rounded-xl bg-muted/30">
                  {[
                    { icon: CheckCircle2, label: "Pago recibido", time: "Ahora", done: true },
                    { icon: Package, label: "Preparando pedido", time: "En proceso", done: true, current: true },
                    { icon: Truck, label: "En camino", time: "Mañana", done: false },
                    { icon: MapPin, label: "Entregado", time: "24-48h", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-emerald-500 text-white" : "bg-muted-foreground/20 text-muted-foreground/50"
                      } ${step.current ? "ring-2 ring-emerald-500/30 animate-pulse" : ""}`}>
                        <step.icon className="h-2.5 w-2.5" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-[10px] font-semibold ${step.done ? "" : "text-muted-foreground/50"}`}>{step.label}</p>
                      </div>
                      <span className={`text-[9px] ${step.current ? "text-emerald-600 font-bold" : "text-muted-foreground/50"}`}>{step.time}</span>
                    </div>
                  ))}
                </div>

                {/* Customer benefits */}
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/5 border border-primary/15">
                    <MessageCircle className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Chat directo</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/5 border border-primary/15">
                    <Bell className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Alertas en vivo</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Home Indicator */}
        {isMobile && (
          <div className="h-6 bg-gradient-to-t from-muted/30 to-transparent flex items-center justify-center">
            <div className="w-24 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Customer Benefits Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {[
          { icon: Zap, label: "Compra en 1 minuto", desc: "Sin registro obligatorio" },
          { icon: ShieldCheck, label: "Pago 100% seguro", desc: "Cifrado SSL + PayPal" },
          { icon: Truck, label: "Envío rápido", desc: "Seguimiento en vivo" },
          { icon: Award, label: "Programa de lealtad", desc: "Gana puntos en cada compra" },
        ].map((b, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -3, scale: 1.02 }}
            className="p-2.5 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm hover:border-primary/30 hover:bg-card/60 transition-colors cursor-default"
          >
            <b.icon className="h-3.5 w-3.5 text-primary mb-1" />
            <p className="text-[11px] font-bold leading-tight">{b.label}</p>
            <p className="text-[9px] text-muted-foreground/70 mt-0.5 leading-tight">{b.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

const ArrowRightSmall = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default StorePreviewMockup;
