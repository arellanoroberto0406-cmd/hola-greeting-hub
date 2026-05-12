import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, Search, Menu, ChevronRight, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";
import { useState } from "react";

const demoProducts = [
  { name: "Gorra Premium NY", price: "$599", original: "$799", rating: 4.8, reviews: 128, tag: "Más vendido", color: "from-amber-500/20 to-orange-500/10" },
  { name: "Sneakers Urban Pro", price: "$1,299", original: "$1,599", rating: 4.9, reviews: 84, tag: "Nuevo", color: "from-blue-500/20 to-cyan-500/10" },
  { name: "Hoodie Oversized", price: "$899", original: "$1,099", rating: 4.7, reviews: 256, tag: "Oferta", color: "from-rose-500/20 to-pink-500/10" },
  { name: "Mochila Street", price: "$749", rating: 4.6, reviews: 62, tag: "Popular", color: "from-emerald-500/20 to-green-500/10" },
];

const categories = ["Inicio", "Novedades", "Ofertas", "Hombre", "Mujer"];

export const StorePreviewMockup = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [cartCount, setCartCount] = useState(2);
  const [liked, setLiked] = useState<number[]>([0]);

  const toggleLike = (i: number) => {
    setLiked(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const addToCart = () => {
    setCartCount(c => c + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-lg mx-auto"
    >
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-orange-400/10 to-gold/20 rounded-[2.5rem] blur-2xl opacity-40" />

      {/* Browser Chrome */}
      <div className="relative rounded-3xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/30 overflow-hidden">
        {/* Browser Header */}
        <div className="px-4 py-3 border-b border-border/30 bg-muted/30 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-2">
            <div className="h-7 rounded-lg bg-background/60 border border-border/20 flex items-center px-3 gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-[10px] text-muted-foreground/60 font-mono truncate">mitienda.com/moda-urbana</span>
            </div>
          </div>
        </div>

        {/* Store Content */}
        <div className="p-3 space-y-3 max-h-[420px] overflow-hidden relative">
          {/* Store Header */}
          <motion.div 
            className="rounded-2xl bg-gradient-to-r from-primary/90 to-primary/70 p-3 text-primary-foreground shadow-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">M</div>
                <span className="font-bold text-sm">Moda Urbana</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <div 
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer relative"
                  onClick={addToCart}
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
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer md:hidden">
                  <Menu className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            {/* Categories */}
            <div className="flex gap-1 overflow-hidden">
              {categories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(i)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    activeCategory === i 
                      ? "bg-white/20 backdrop-blur-sm" 
                      : "bg-transparent hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Hero Banner */}
          <motion.div 
            className="relative rounded-xl overflow-hidden h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 flex items-center px-4"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
            <div className="relative z-10">
              <p className="text-[9px] uppercase tracking-wider text-primary/80 font-bold mb-0.5">Colección 2024</p>
              <p className="text-sm font-bold text-white leading-tight">Estilo Urbano</p>
              <p className="text-[10px] text-white/60">Hasta 40% OFF</p>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-gold/20 blur-md" />
          </motion.div>

          {/* Trust Bar */}
          <div className="flex justify-between px-1">
            {[
              { icon: ShieldCheck, label: "Seguro" },
              { icon: Truck, label: "Envío" },
              { icon: RotateCcw, label: "30 días" },
              { icon: Headphones, label: "Soporte" },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <t.icon className="h-3 w-3 text-primary/60" />
                <span className="text-[8px] text-muted-foreground/50 font-medium">{t.label}</span>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-2">
            {demoProducts.map((product, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-border/30 bg-card/50 p-2.5 space-y-2 cursor-pointer group"
              >
                {/* Image placeholder */}
                <div className={`relative h-16 rounded-lg bg-gradient-to-br ${product.color} flex items-center justify-center overflow-hidden`}>
                  <div className="text-2xl opacity-40 select-none">{["🧢", "👟", "🧥", "🎒"][i]}</div>
                  <div className="absolute top-1.5 left-1.5">
                    <span className="px-1.5 py-0.5 rounded-md bg-primary/90 text-[8px] font-bold text-primary-foreground">
                      {product.tag}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(i); }}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart className={`h-2.5 w-2.5 ${liked.includes(i) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                </div>
                
                {/* Info */}
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold leading-tight truncate group-hover:text-primary transition-colors">{product.name}</p>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-gold text-gold" />
                    <span className="text-[9px] font-medium">{product.rating}</span>
                    <span className="text-[9px] text-muted-foreground/50">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-primary">{product.price}</span>
                    {product.original && (
                      <span className="text-[9px] text-muted-foreground/40 line-through">{product.original}</span>
                    )}
                  </div>
                </div>

                {/* Add to cart */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={addToCart}
                  className="w-full h-6 rounded-lg bg-primary/10 hover:bg-primary hover:text-primary-foreground text-primary text-[9px] font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <ShoppingCart className="h-2.5 w-2.5" />
                  Agregar
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* View More */}
          <div className="flex items-center justify-center gap-1 pt-1 pb-2">
            <span className="text-[10px] text-muted-foreground/50 font-medium">Ver más productos</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StorePreviewMockup;
