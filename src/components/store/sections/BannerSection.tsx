import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { Truck, Gift, Shield, Clock } from "lucide-react";

interface BannerSectionProps {
  section: StoreSection;
  store: Store;
}

const bannerIcons: Record<string, any> = {
  shipping: Truck,
  gift: Gift,
  security: Shield,
  time: Clock,
};

export const BannerSection = ({ section, store }: BannerSectionProps) => {
  const { text, backgroundColor = 'primary', icon } = section.settings;

  const getBgColor = () => {
    switch (backgroundColor) {
      case 'primary':
        return store.primary_color;
      case 'secondary':
        return store.secondary_color;
      case 'accent':
        return store.accent_color || store.primary_color;
      case 'dark':
        return '#1a1a1a';
      default:
        return store.primary_color;
    }
  };

  const Icon = icon ? bannerIcons[icon] : Truck;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-4 px-6 text-white text-center flex items-center justify-center gap-3"
      style={{ 
        backgroundColor: getBgColor(),
        borderRadius: 'var(--store-radius, 12px)',
      }}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      <p className="font-medium">
        {text || '¡Envío gratis en compras mayores a $999!'}
      </p>
    </motion.section>
  );
};
