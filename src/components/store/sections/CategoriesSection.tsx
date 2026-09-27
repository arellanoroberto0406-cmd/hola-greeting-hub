import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowUpRight, Layers3 } from "lucide-react";

interface CategoriesSectionProps {
  section: StoreSection;
  store: Store;
  collections: string[];
  onCollectionSelect: (collection: string) => void;
}

export const CategoriesSection = ({ section, collections, onCollectionSelect }: CategoriesSectionProps) => {
  if (collections.length === 0) return null;

  return (
    <section className="vc-categories" aria-labelledby={`categories-${section.id}`}>
      <div className="vc-section-heading">
        <span className="vc-section-number">01</span>
        <div>
          <p>Explora por estilo</p>
          <h2 id={`categories-${section.id}`} className="vc-heading">{section.title || "Categorías"}</h2>
        </div>
      </div>

      <div className="vc-category-grid">
        {collections.map((collection, index) => (
          <motion.div
            key={collection}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Button variant="ghost" className="vc-category" onClick={() => onCollectionSelect(collection)}>
              <span className="vc-category-index">{String(index + 1).padStart(2, "0")}</span>
              <Layers3 aria-hidden="true" />
              <strong className="vc-heading">{collection}</strong>
              <ArrowUpRight className="vc-category-arrow" aria-hidden="true" />
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};