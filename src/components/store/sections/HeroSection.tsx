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
  const accent = store.accent_color || store.secondary_color || store.primary_color;

  const getBackground = () => {
    switch (backgroundType) {
      case 'gradient':
        return `linear-gradient(135deg, ${store.primary_color}25, ${store.secondary_color}30, ${store.primary_color}15)`;
      case 'solid':
        return `${store.primary_color}12`;
      case 'image':
        return store.banner_url ? `url(${store.banner_url})` : `${store.primary_color}12`;
      default:
        return `linear-gradient(135deg, ${store.primary_color}22, ${store.secondary_color}28)`;
    }
  };

  const isImage = backgroundType === 'image' && store.banner_url;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
      style={{
        background: getBackground(),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--store-radius, 12px)',
      }}
    >
      {isImage && <div className="absolute inset-0 bg-black/50" />}

      {/* Decorative gold hairline */}
      <div
        className="absolute top-8 left-8 md:left-12 h-px w-16 md:w-24"
        style={{ backgroundColor: accent, opacity: 0.7 }}
      />

      <div className="relative z-10 max-w-4xl">
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-block mb-6 text-[10px] md:text-xs font-bold uppercase"
          style={{
            color: accent,
            letterSpacing: '0.4em',
          }}
        >
          {section.settings.kicker || 'Colección Actual'}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-4xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.9] mb-6 ${
            isImage ? 'text-white' : ''
          }`}
          style={{
            color: !isImage ? store.primary_color : undefined,
            fontFamily: 'var(--store-heading-font, inherit)',
            letterSpacing: '-0.02em',
          }}
        >
          {headline || '¡Bienvenido a nuestra tienda!'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`text-base md:text-lg mb-10 max-w-xl leading-relaxed ${
            isImage ? 'text-white/85' : 'text-muted-foreground'
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
              className="gap-3 shadow-xl hover:shadow-2xl transition-all uppercase font-bold tracking-[0.18em] text-xs px-10 py-6"
              style={{
                backgroundColor: accent,
                color: store.primary_color,
              }}
            >
              {buttonText || 'Ver productos'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
};
