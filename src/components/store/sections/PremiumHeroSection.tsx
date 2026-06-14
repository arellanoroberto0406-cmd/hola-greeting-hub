import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown, Play, ShoppingBag, Zap } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumHeroSectionProps {
  section: StoreSection;
  store: Store;
  planTier: PlanTier;
  onAction?: () => void;
}

export const PremiumHeroSection = ({ section, store, planTier, onAction }: PremiumHeroSectionProps) => {
  const { headline, subtitle, showButton, buttonText, backgroundType } = section.settings;
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  // Parallax effects for enterprise
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  const getBackground = () => {
    switch (backgroundType) {
      case "gradient":
        return `linear-gradient(135deg, ${store.primary_color}15, ${store.secondary_color || store.primary_color}20, ${store.primary_color}10)`;
      case "solid":
        return `${store.primary_color}10`;
      case "image":
        return store.banner_url ? `url(${store.banner_url})` : `${store.primary_color}10`;
      default:
        return `linear-gradient(135deg, ${store.primary_color}15, ${store.secondary_color || store.primary_color}20)`;
    }
  };

  // Basic Plan - Simple, clean hero
  if (isBasic) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative py-16 md:py-24 px-6 overflow-hidden"
        style={{
          background: getBackground(),
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "var(--store-radius, 12px)",
        }}
      >
        {backgroundType === "image" && store.banner_url && (
          <div className="absolute inset-0 bg-black/40" />
        )}

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1
            className={cn(
              "text-4xl md:text-6xl lg:text-7xl font-black mb-5 tracking-tight leading-[0.95] drop-shadow-sm",
              backgroundType === "image" && store.banner_url ? "text-white" : ""
            )}
            style={{
              fontFamily: "var(--store-heading-font, inherit)",
              ...(backgroundType !== "image"
                ? {
                    backgroundImage: `linear-gradient(120deg, ${store.primary_color}, ${store.accent_color || store.secondary_color || store.primary_color}, ${store.secondary_color || store.primary_color})`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                  }
                : {}),
            }}
          >
            {headline || "¡Bienvenido a nuestra tienda!"}
          </h1>

          <p
            className={cn(
              "text-lg md:text-xl mb-8 font-medium",
              backgroundType === "image" && store.banner_url ? "text-white/90" : "text-muted-foreground"
            )}
          >
            {subtitle || "Descubre los mejores productos"}
          </p>

          {showButton && (
            <Button
              size="lg"
              onClick={onAction}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: store.primary_color }}
            >
              {buttonText || "Ver productos"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </motion.section>
    );
  }

  // Professional Plan - Enhanced with animations
  if (isProfessional) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-20 md:py-32 px-6 overflow-hidden rounded-2xl"
        style={{
          background: getBackground(),
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for image background */}
        {backgroundType === "image" && store.banner_url && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        )}

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-32 h-32 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: store.primary_color }}
            animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-40 h-40 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: store.secondary_color || store.primary_color }}
            animate={{ y: [0, -20, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              style={{
                backgroundColor: `${store.primary_color}20`,
                color: backgroundType === "image" ? "white" : store.primary_color,
                border: `1px solid ${store.primary_color}30`,
              }}
            >
              <Zap className="h-4 w-4" />
              {store.description ? store.description.split(" ").slice(0, 3).join(" ") : "Tienda Premium"}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={cn(
              "text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.9] tracking-tight",
              backgroundType === "image" && store.banner_url ? "text-white drop-shadow-2xl" : ""
            )}
            style={{
              fontFamily: "var(--store-heading-font, inherit)",
              ...(backgroundType !== "image"
                ? {
                    backgroundImage: `linear-gradient(120deg, ${store.primary_color} 0%, ${store.accent_color || store.secondary_color || store.primary_color} 50%, ${store.secondary_color || store.primary_color} 100%)`,
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto",
                    filter: `drop-shadow(0 4px 24px ${store.primary_color}40)`,
                  }
                : {}),
            }}
          >
            {headline || "¡Bienvenido a nuestra tienda!"}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className={cn(
              "text-lg md:text-xl lg:text-2xl mb-10 max-w-2xl mx-auto",
              backgroundType === "image" && store.banner_url ? "text-white/90" : "text-muted-foreground"
            )}
          >
            {subtitle || "Descubre los mejores productos"}
          </motion.p>

          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={onAction}
                className="gap-2 shadow-xl hover:shadow-2xl transition-all text-lg px-8 py-6 rounded-xl"
                style={{ backgroundColor: store.primary_color }}
              >
                <ShoppingBag className="h-5 w-5" />
                {buttonText || "Ver productos"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onAction}
                className="gap-2 text-lg px-8 py-6 rounded-xl backdrop-blur-sm"
                style={{
                  borderColor: backgroundType === "image" ? "white" : store.primary_color,
                  color: backgroundType === "image" ? "white" : store.primary_color,
                }}
              >
                Explorar colecciones
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          )}

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown
                className="h-8 w-8"
                style={{ color: backgroundType === "image" ? "white" : store.primary_color, opacity: 0.5 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    );
  }

  // Enterprise Plan - Full immersive experience
  return (
    <motion.section
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden rounded-3xl"
    >
      {/* Parallax background */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale }}
      >
        {backgroundType === "image" && store.banner_url ? (
          <img
            src={store.banner_url}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: getBackground() }}
          />
        )}
      </motion.div>

      {/* Dynamic gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />
      <div
        className="absolute inset-0 mix-blend-overlay opacity-50"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${store.primary_color}40 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, ${store.secondary_color || store.primary_color}30 0%, transparent 50%)`,
        }}
      />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Floating orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] opacity-40"
        style={{ backgroundColor: store.primary_color }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-30"
        style={{ backgroundColor: store.secondary_color || store.primary_color }}
        animate={{
          x: [0, -40, 0],
          y: [0, -40, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
      >
        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
            <Sparkles className="h-5 w-5" style={{ color: store.primary_color }} />
            <span className="text-sm font-medium tracking-wide">
              EXPERIENCIA PREMIUM
            </span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-8 text-white leading-none tracking-tight"
          style={{ fontFamily: "var(--store-heading-font, inherit)" }}
        >
          {headline || "¡Bienvenido!"}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl lg:text-3xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {subtitle || "Descubre una colección exclusiva de productos premium"}
        </motion.p>

        {/* CTA buttons */}
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={onAction}
                className="gap-3 text-lg px-10 py-7 rounded-2xl shadow-2xl font-semibold"
                style={{
                  backgroundColor: store.primary_color,
                  boxShadow: `0 20px 40px ${store.primary_color}50`,
                }}
              >
                <ShoppingBag className="h-6 w-6" />
                {buttonText || "Explorar tienda"}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="ghost"
                onClick={onAction}
                className="gap-3 text-lg px-10 py-7 rounded-2xl text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm"
              >
                <Play className="h-5 w-5" />
                Ver video
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60"
        >
          {[
            { value: "10K+", label: "Clientes" },
            { value: "4.9★", label: "Calificación" },
            { value: "24/7", label: "Soporte" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1.2 + i * 0.1 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-white/50 text-sm uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-6 w-6 text-white/50" />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default PremiumHeroSection;