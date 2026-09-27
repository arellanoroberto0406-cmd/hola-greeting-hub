import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, ShieldCheck, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

type PlanTier = "basic" | "professional" | "enterprise";

interface PremiumHeroSectionProps {
  section: StoreSection;
  store: Store;
  planTier: PlanTier;
  onAction?: () => void;
}

export const PremiumHeroSection = ({ section, store, planTier, onAction }: PremiumHeroSectionProps) => {
  const { headline, subtitle, showButton, buttonText } = section.settings;
  const hasImage = Boolean(store.banner_url);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="vc-hero"
    >
      <div className="vc-hero-copy">
        <div className="vc-kicker"><Flame aria-hidden="true" /> Colección encendida</div>
        <h1 className="vc-heading vc-hero-title">{headline || store.name}</h1>
        <p className="vc-hero-subtitle">{subtitle || store.description || "Piezas que no pasan desapercibidas."}</p>
        {showButton !== false && (
          <Button size="lg" onClick={onAction} className="vc-btn-fire vc-hero-cta">
            <ShoppingBag aria-hidden="true" /> {buttonText || "Ver productos"} <ArrowRight aria-hidden="true" />
          </Button>
        )}
        <div className="vc-hero-proof"><ShieldCheck aria-hidden="true" /> Compra protegida y pago seguro</div>
      </div>

      <div className="vc-hero-media">
        {hasImage ? (
          <img src={store.banner_url || ""} alt={`Colección de ${store.name}`} />
        ) : (
          <div className="vc-hero-monogram vc-heading">{store.name.slice(0, 2)}</div>
        )}
        <div className="vc-hero-stamp vc-heading">{planTier === "enterprise" ? "Edición premium" : "Nueva colección"}</div>
      </div>

      <div className="vc-hero-offer">
        <span>Compra hoy</span>
        <strong className="vc-heading">VIVE<br />EL FUEGO</strong>
        <small>Descubre piezas seleccionadas para destacar.</small>
      </div>
    </motion.section>
  );
};

export default PremiumHeroSection;