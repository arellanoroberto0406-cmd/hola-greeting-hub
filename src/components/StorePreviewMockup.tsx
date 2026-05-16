import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Star, Heart, Search, Menu, ChevronRight, ShieldCheck, Truck,
  RotateCcw, Headphones, Smartphone, Monitor, Package, CreditCard, CheckCircle2,
  MapPin, Tag, Lock, MessageCircle, BadgeCheck, Sparkles, ArrowLeft, Plus, Minus,
  Clock, Zap
} from "lucide-react";
import { useState } from "react";

const demoProducts = [
  { name: "Gorra Premium NY", price: 599, original: 799, rating: 4.8, reviews: 128, tag: "Más vendido", color: "from-amber-500/20 to-orange-500/10", emoji: "🧢" },
  { name: "Sneakers Urban Pro", price: 1299, original: 1599, rating: 4.9, reviews: 84, tag: "Nuevo", color: "from-blue-500/20 to-cyan-500/10", emoji: "👟" },
  { name: "Hoodie Oversized", price: 899, original: 1099, rating: 4.7, reviews: 256, tag: "Oferta", color: "from-rose-500/20 to-pink-500/10", emoji: "🧥" },
  { name: "Mochila Street", price: 749, original: null, rating: 4.6, reviews: 62, tag: "Popular", color: "from-emerald-500/20 to-green-500/10", emoji: "🎒" },
];

const categories = ["Inicio", "Novedades", "Ofertas", "Hombre", "Mujer"];

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

export const StorePreviewMockup = ({ viewMode = "desktop", onViewModeChange }: StorePreviewMockupProps) => {
  const isMobile = viewMode === "mobile";
  const [activeCategory, setActiveCategory] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [liked, setLiked] = useState<number[]>([0]);
  const [scene, setScene] = useState<Scene>("catalog");
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedPayment, setSelectedPayment] = useState<"paypal" | "transfer">("paypal");

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
  const shipping = 99;
  const total = subtotal + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full"
    >
      {/* View Mode Toggle */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex bg-muted/40 rounded-xl p-1 gap-1 border border-border/30">
          <button
            onClick={() => onViewModeChange?.("desktop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              !isMobile
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Escritorio</span>
          </button>
          <button
            onClick={() => onViewModeChange?.("mobile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
              isMobile
                ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Móvil</span>
          </button>
        </div>
      </div>

      {/* Scene Selector */}
      <div className="flex justify-center mb-4 px-2">
        <div className="inline-flex flex-wrap justify-center gap-1.5 bg-muted/30 rounded-xl p-1 border border-border/30 max-w-full">
          {scenes.map((s) => {
            const Icon = s.icon;
            const active = scene === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setScene(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  active
                    ? "bg-card text-foreground shadow-md ring-1 ring-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3 w-3 ${active ? "text-primary" : ""}`} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Glow */}
      <div className={`absolute -inset-4 bg-gradient-to-r from-primary/20 via-orange-400/10 to-gold/20 rounded-[2.5rem] blur-2xl opacity-40 ${isMobile ? 'top-12' : ''}`} />

      {/* Device Frame */}
      <div className={`relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isMobile
          ? "max-w-[280px] rounded-[2.5rem] border-[6px] border-border/50 bg-card/80 shadow-2xl shadow-black/40 overflow-hidden"
          : "max-w-lg rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden"
      }`}>
        {/* Mobile Status Bar */}
        {isMobile && (
          <div className="h-7 bg-gradient-to-b from-muted/50 to-transparent flex items-center justify-between px-6 pt-1">
            <span className="text-[10px] font-semibold text-muted-foreground">9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
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
              </div>
            </div>
          </div>
        )}

        {/* Persistent Store Header (hidden on confirmation) */}
        {scene !== "confirmation" && (
          <div className="px-3 pt-3">
            <div className={`rounded-2xl bg-gradient-to-r from-primary/90 to-primary/70 p-3 text-primary-foreground shadow-lg ${isMobile ? 'rounded-xl' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {(scene === "product" || scene === "cart" || scene === "checkout") ? (
                    <button onClick={() => setScene(scene === "product" ? "catalog" : scene === "cart" ? "product" : "cart")} className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">M</div>
                  )}
                  <span className="font-bold text-sm">Moda Urbana</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <div
                    className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer relative"
                    onClick={() => setScene("cart")}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 1.4 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-[9px] font-bold flex items-center justify-center text-black"
                    >
                      {cartCount}
                    </motion.span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center cursor-pointer">
                    <Menu className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
              {scene === "catalog" && (
                <div className={`flex gap-1 ${isMobile ? 'overflow-x-auto scrollbar-hide' : 'overflow-hidden'}`}>
                  {categories.map((cat, i) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(i)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 ${
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

        {/* Scene Content */}
        <div className={`p-3 space-y-3 overflow-hidden relative ${isMobile ? 'max-h-[460px]' : 'max-h-[480px]'}`}>
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
                {/* Hero Banner */}
                <div className={`relative rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 flex items-center px-4 ${isMobile ? 'h-20' : 'h-24'}`}>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                  <div className="relative z-10">
                    <p className="text-[9px] uppercase tracking-wider text-primary/80 font-bold mb-0.5">Colección 2024</p>
                    <p className={`font-bold text-white leading-tight ${isMobile ? 'text-xs' : 'text-sm'}`}>Estilo Urbano</p>
                    <p className="text-[10px] text-white/60">Hasta 40% OFF</p>
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
                      onClick={() => setScene("product")}
                      className="rounded-xl border border-border/30 bg-card/50 p-2 space-y-2 cursor-pointer group"
                    >
                      <div className={`relative rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center overflow-hidden ${isMobile ? 'h-14' : 'h-16'}`}>
                        <div className="text-2xl opacity-50 select-none">{product.emoji}</div>
                        <div className="absolute top-1.5 left-1.5">
                          <span className="px-1.5 py-0.5 rounded-md bg-primary/90 text-[8px] font-bold text-primary-foreground">{product.tag}</span>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLike(i); }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 flex items-center justify-center"
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
                  <div className="text-5xl opacity-60">{featured.emoji}</div>
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-[9px] font-bold text-white">-19%</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/90 text-[9px] font-bold text-primary-foreground">{featured.tag}</span>
                  </div>
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                    {[0,1,2,3].map(i => <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary' : 'bg-white/40'}`} />)}
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

                {/* Size selector */}
                <div>
                  <p className="text-[10px] font-semibold mb-1">Talla: <span className="text-primary">{selectedSize}</span></p>
                  <div className="flex gap-1.5">
                    {["S", "M", "L", "XL"].map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${
                          selectedSize === s
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card border-border/40 hover:border-primary/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
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
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30">
                    <BadgeCheck className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Producto original</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-muted/30">
                    <Clock className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Llega en 24-48h</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={addToCart}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-primary/30"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Agregar al carrito
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

                {[featured, demoProducts[0]].map((p, i) => (
                  <div key={i} className="flex gap-2 p-2 rounded-xl border border-border/30 bg-card/40">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0`}>
                      <span className="text-xl">{p.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold truncate">{p.name}</p>
                      {i === 0 && <p className="text-[9px] text-muted-foreground">Talla: {selectedSize}</p>}
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
                  <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Envío</span><span className="font-semibold">{fmt(shipping)}</span></div>
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
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" /> Checkout seguro
                </h3>

                {/* Address */}
                <div className="p-2 rounded-xl border border-border/30 bg-card/40 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold">Dirección de envío</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-muted-foreground">Nombre completo</div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-muted-foreground">Ciudad</div>
                      <div className="h-6 rounded-md bg-muted/40 px-2 flex items-center text-[9px] text-muted-foreground">CP</div>
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

                {/* Total */}
                <div className="flex justify-between items-center p-2 rounded-xl bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20">
                  <span className="text-[10px] font-bold">Total a pagar</span>
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
                <p className="text-center text-[9px] text-muted-foreground/60 flex items-center justify-center gap-1">
                  <ShieldCheck className="h-2.5 w-2.5" /> Tus datos están cifrados con SSL
                </p>
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
                className="space-y-3 py-2"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/40">
                      <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-bold">¡Pedido confirmado!</h3>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5">Orden #MT-2847 · {fmt(total)}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2 p-2.5 rounded-xl bg-muted/30">
                  {[
                    { icon: CheckCircle2, label: "Pago recibido", time: "Ahora", done: true },
                    { icon: Package, label: "Preparando pedido", time: "En proceso", done: true, current: true },
                    { icon: Truck, label: "En camino", time: "Mañana", done: false },
                    { icon: MapPin, label: "Entregado", time: "24-48h", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-emerald-500 text-white" : "bg-muted-foreground/20 text-muted-foreground/50"
                      } ${step.current ? "ring-2 ring-emerald-500/30" : ""}`}>
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
                    <span className="text-[9px] font-medium leading-tight">Chat directo con tienda</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-primary/5 border border-primary/15">
                    <Sparkles className="h-3 w-3 text-primary shrink-0" />
                    <span className="text-[9px] font-medium leading-tight">Seguimiento en tiempo real</span>
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
          { icon: MessageCircle, label: "Soporte directo", desc: "Chat con la tienda" },
        ].map((b, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-card/40 border border-border/30 backdrop-blur-sm">
            <b.icon className="h-3.5 w-3.5 text-primary mb-1" />
            <p className="text-[11px] font-bold leading-tight">{b.label}</p>
            <p className="text-[9px] text-muted-foreground/70 mt-0.5 leading-tight">{b.desc}</p>
          </div>
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
