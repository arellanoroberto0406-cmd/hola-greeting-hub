import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  section: StoreSection;
  store: Store;
  onAction?: () => void;
}

export const HeroSection = ({ section, store, onAction }: HeroSectionProps) => {
  const { headline, subtitle, showButton, buttonText, backgroundType } = section.settings;

  const getBackground = () => {
    switch (backgroundType) {
      case 'gradient':
        return `linear-gradient(135deg, ${store.primary_color}15, ${store.secondary_color}20, ${store.primary_color}10)`;
      case 'solid':
        return `${store.primary_color}10`;
      case 'image':
        return store.banner_url ? `url(${store.banner_url})` : `${store.primary_color}10`;
      default:
        return `linear-gradient(135deg, ${store.primary_color}15, ${store.secondary_color}20)`;
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-16 md:py-24 px-6 rounded-2xl overflow-hidden"
      style={{
        background: getBackground(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {backgroundType === 'image' && store.banner_url && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-3xl md:text-5xl font-bold font-heading mb-4 ${
            backgroundType === 'image' && store.banner_url ? 'text-white' : ''
          }`}
          style={{ color: backgroundType !== 'image' ? store.primary_color : undefined }}
        >
          {headline || '¡Bienvenido a nuestra tienda!'}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-lg md:text-xl mb-8 ${
            backgroundType === 'image' && store.banner_url ? 'text-white/90' : 'text-muted-foreground'
          }`}
        >
          {subtitle || 'Descubre los mejores productos'}
        </motion.p>
        
        {showButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={onAction}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: store.primary_color }}
            >
              {buttonText || 'Ver productos'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
