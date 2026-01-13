import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface CategoriesSectionProps {
  section: StoreSection;
  store: Store;
  collections: string[];
  onCollectionSelect: (collection: string) => void;
}

export const CategoriesSection = ({ 
  section, 
  store, 
  collections,
  onCollectionSelect 
}: CategoriesSectionProps) => {
  const { columns = 4, showDescription } = section.settings;

  if (collections.length === 0) return null;

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
    6: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  // Generate consistent colors for each category
  const getCategoryColor = (index: number) => {
    const hue = (index * 137.5) % 360; // Golden angle for good distribution
    return `hsl(${hue}, 60%, 95%)`;
  };

  return (
    <section className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: store.primary_color }}>
          {section.title}
        </h2>
      </motion.div>

      <div className={`grid grid-cols-1 ${gridCols[columns as keyof typeof gridCols] || gridCols[4]} gap-4`}>
        {collections.map((collection, index) => (
          <motion.button
            key={collection}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCollectionSelect(collection)}
            className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-lg"
            style={{ 
              backgroundColor: getCategoryColor(index),
              border: `1px solid ${store.primary_color}15`
            }}
          >
            <div className="relative z-10">
              <h3 className="font-semibold text-lg mb-1" style={{ color: store.primary_color }}>
                {collection}
              </h3>
              {showDescription && (
                <p className="text-sm text-muted-foreground">
                  Ver productos
                </p>
              )}
            </div>
            
            <div 
              className="absolute bottom-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
              style={{ backgroundColor: `${store.primary_color}15` }}
            >
              <ChevronRight className="h-4 w-4" style={{ color: store.primary_color }} />
            </div>

            {/* Decorative element */}
            <div 
              className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-30 transition-all duration-300 group-hover:scale-125"
              style={{ backgroundColor: store.primary_color }}
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
};
