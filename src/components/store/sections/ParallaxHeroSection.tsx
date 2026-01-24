import { StoreSection } from "@/types/storeLayout";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ChevronDown, Crown, Star, Zap } from "lucide-react";

interface ParallaxHeroSectionProps {
  section: StoreSection;
  store: any;
  planTier?: 'basic' | 'professional' | 'enterprise';
}

export const ParallaxHeroSection = ({ section, store, planTier = 'basic' }: ParallaxHeroSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const accentColor = store?.primary_color || '#8B4513';
  
  // Parallax transforms with spring physics
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 300]), { stiffness: 100, damping: 30 });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 150]), { stiffness: 100, damping: 30 });
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 75]), { stiffness: 100, damping: 30 });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);
  const textY = useSpring(useTransform(scrollYProgress, [0, 1], [0, 200]), { stiffness: 100, damping: 30 });

  // Check plan tier
  if (planTier !== 'enterprise') {
    return (
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${accentColor}10, ${accentColor}05)` }}
        />
        <motion.div 
          className="text-center z-10 p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)` }}
          >
            <Crown className="h-10 w-10" style={{ color: accentColor }} />
          </div>
          <h3 className="text-2xl font-bold mb-3">Hero Parallax Premium</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Crea experiencias inmersivas con efectos de profundidad 3D y animaciones fluidas.
          </p>
          <Badge 
            className="text-sm px-4 py-2"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            <Crown className="h-3.5 w-3.5 mr-1.5" />
            Requiere Plan Enterprise
          </Badge>
        </motion.div>
      </section>
    );
  }

  const layoutStyle = section.settings.layoutStyle || 'layered';
  const backgroundImage = section.settings.backgroundImage || '';
  const foregroundImage = section.settings.foregroundImage || '';
  const midgroundImage = section.settings.midgroundImage || '';

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
  }));

  return (
    <motion.section 
      ref={containerRef}
      className="relative h-[100vh] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background Layer - Slowest */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ y: y1, scale }}
      >
        {backgroundImage ? (
          <img 
            src={backgroundImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 50%, ${accentColor}20 100%)` 
            }}
          />
        )}
      </motion.div>

      {/* Midground Layer - Medium Speed */}
      {midgroundImage && (
        <motion.div 
          className="absolute inset-0 z-10"
          style={{ y: y2 }}
        >
          <img 
            src={midgroundImage} 
            alt="" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 z-20"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${accentColor}10 50%, rgba(0,0,0,0.6) 100%)`
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-25 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              bottom: '-20px',
              background: `radial-gradient(circle, ${accentColor}60, ${accentColor}20)`,
              boxShadow: `0 0 ${particle.size * 2}px ${accentColor}40`,
            }}
            animate={{
              y: [0, -window.innerHeight - 100],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1, 1, 0.5],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Foreground Layer - Fastest */}
      {foregroundImage && (
        <motion.div 
          className="absolute inset-0 z-30"
          style={{ y: y3 }}
        >
          <img 
            src={foregroundImage} 
            alt="" 
            className="w-full h-full object-contain"
          />
        </motion.div>
      )}

      {/* Content */}
      <motion.div 
        className="absolute inset-0 z-40 flex items-center justify-center"
        style={{ y: textY, opacity }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {section.settings.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Badge 
                  className="mb-6 px-4 py-2 text-sm backdrop-blur-md"
                  style={{ background: `${accentColor}90`, color: 'white' }}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {section.settings.badge}
                </Badge>
              </motion.div>
            )}

            <motion.h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
              style={{ fontFamily: 'var(--store-heading-font)', textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {section.settings.headline || 'Experiencia Premium'}
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {section.settings.subtitle || 'Descubre una nueva forma de comprar'}
            </motion.p>

            {section.settings.showButton && (
              <motion.div 
                className="flex flex-wrap gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 rounded-full shadow-2xl"
                    style={{ backgroundColor: accentColor }}
                  >
                    {section.settings.buttonText || 'Explorar'}
                    <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
                {section.settings.secondaryButtonText && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="text-lg px-8 py-6 rounded-full backdrop-blur-md border-white/30 text-white hover:bg-white/10"
                    >
                      {section.settings.secondaryButtonText}
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Trust Badges */}
            {section.settings.showTrustBadges && (
              <motion.div 
                className="mt-12 flex flex-wrap items-center justify-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                {[
                  { icon: Star, text: '4.9 Rating' },
                  { icon: Sparkles, text: '10K+ Clientes' },
                  { icon: Zap, text: 'Envío Express' },
                ].map((badge, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md"
                    style={{ background: 'rgba(255,255,255,0.1)' }}
                  >
                    <badge.icon className="h-4 w-4" style={{ color: accentColor }} />
                    <span className="text-sm text-white/90">{badge.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
        style={{ opacity }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default ParallaxHeroSection;
