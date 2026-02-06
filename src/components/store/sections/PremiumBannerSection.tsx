import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, Gift, Shield, Clock, Sparkles, BadgePercent, 
  CreditCard, Heart, Award, Zap, Star, Package 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PremiumBannerSectionProps {
  section: StoreSection;
  store: Store;
  planTier?: "basic" | "professional" | "enterprise";
}

const bannerIcons: Record<string, any> = {
  shipping: Truck,
  gift: Gift,
  security: Shield,
  time: Clock,
  discount: BadgePercent,
  payment: CreditCard,
  love: Heart,
  award: Award,
  flash: Zap,
  star: Star,
  package: Package,
};

const defaultMessages = [
  { text: "¡Envío gratis en compras mayores a $999!", icon: "shipping" },
  { text: "🎉 OFERTA FLASH: 20% OFF en todo el sitio", icon: "flash" },
  { text: "⭐ +10,000 clientes satisfechos", icon: "star" },
  { text: "🔒 Pago 100% seguro garantizado", icon: "security" },
];

export const PremiumBannerSection = ({ 
  section, 
  store,
  planTier = "basic" 
}: PremiumBannerSectionProps) => {
  const { 
    text, 
    backgroundColor = 'primary', 
    icon = 'shipping',
    messages = defaultMessages,
    animated = true 
  } = section.settings;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  // Rotate messages for Professional and Enterprise
  useEffect(() => {
    if (isBasic || !animated) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (messages?.length || 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isBasic, animated, messages?.length]);

  const getBgColor = () => {
    switch (backgroundColor) {
      case 'primary':
        return store.primary_color;
      case 'secondary':
        return store.secondary_color || store.primary_color;
      case 'accent':
        return store.accent_color || store.primary_color;
      case 'dark':
        return '#1a1a1a';
      case 'gradient':
        return `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color || store.primary_color})`;
      default:
        return store.primary_color;
    }
  };

  const Icon = bannerIcons[icon] || Truck;
  const currentMessage = messages?.[currentIndex] || { text, icon };
  const CurrentIcon = bannerIcons[currentMessage.icon] || Icon;

  // Enterprise banner with animated gradient and particles
  if (isEnterprise) {
    return (
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden"
        style={{ 
          borderRadius: 'var(--store-radius, 16px)',
        }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color || store.primary_color}, ${store.primary_color})`,
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20],
                x: [-10, 10],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />

        <div className="relative z-10 py-5 px-6 text-white">
          <div className="container mx-auto flex items-center justify-center gap-6">
            {/* Left decorative element */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="hidden md:block"
            >
              <Sparkles className="h-5 w-5 opacity-60" />
            </motion.div>

            {/* Rotating messages */}
            <div className="relative h-6 flex-1 max-w-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center gap-3"
                >
                  <CurrentIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-semibold text-base tracking-wide">
                    {currentMessage.text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="hidden md:flex gap-1.5">
              {messages?.map((_: any, i: number) => (
                <motion.div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  )}
                />
              ))}
            </div>

            {/* Right decorative element */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="hidden md:block"
            >
              <Sparkles className="h-5 w-5 opacity-60" />
            </motion.div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Professional banner with smooth transitions
  if (isProfessional) {
    return (
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden text-white"
        style={{ 
          background: getBgColor(),
          borderRadius: 'var(--store-radius, 12px)',
        }}
      >
        {/* Subtle shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
        />

        <div className="relative z-10 py-4 px-6">
          <div className="container mx-auto">
            <div className="relative h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center justify-center gap-3"
                >
                  <CurrentIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium">
                    {currentMessage.text}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>
    );
  }

  // Basic simple banner
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 text-white text-center flex items-center justify-center gap-3"
      style={{ 
        backgroundColor: getBgColor() as string,
        borderRadius: 'var(--store-radius, 12px)',
      }}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="font-medium">
        {text || '¡Envío gratis en compras mayores a $999!'}
      </p>
    </motion.section>
  );
};
