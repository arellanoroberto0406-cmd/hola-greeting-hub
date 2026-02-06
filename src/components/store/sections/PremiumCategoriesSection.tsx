import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PremiumCategoriesSectionProps {
  section: StoreSection;
  store: Store;
  planTier?: "basic" | "professional" | "enterprise";
  onCategoryClick?: (category: string) => void;
}

const defaultCategories = [
  { 
    id: "1", 
    name: "Electrónica", 
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    count: 48,
    trending: true
  },
  { 
    id: "2", 
    name: "Moda", 
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    count: 124,
    trending: false
  },
  { 
    id: "3", 
    name: "Hogar", 
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
    count: 67,
    trending: true
  },
  { 
    id: "4", 
    name: "Deportes", 
    image: "https://images.unsplash.com/photo-1461896836934- voices?w=400",
    count: 35,
    trending: false
  },
  { 
    id: "5", 
    name: "Belleza", 
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    count: 89,
    trending: true
  },
  { 
    id: "6", 
    name: "Accesorios", 
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    count: 56,
    trending: false
  },
];

export const PremiumCategoriesSection = ({
  section,
  store,
  planTier = "basic",
  onCategoryClick
}: PremiumCategoriesSectionProps) => {
  const categories = section.settings.categories || defaultCategories;
  
  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  const CategoryCard = ({ category, index }: { category: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={!isBasic ? { 
        y: -10, 
        scale: 1.02,
        transition: { duration: 0.3 }
      } : {}}
      className={cn(
        "group relative overflow-hidden cursor-pointer",
        isEnterprise && "rounded-3xl",
        isProfessional && "rounded-2xl",
        isBasic && "rounded-xl"
      )}
      onClick={() => onCategoryClick?.(category.name)}
    >
      {/* Image */}
      <div className={cn(
        "relative overflow-hidden",
        isEnterprise && "aspect-[4/5]",
        isProfessional && "aspect-[3/4]",
        isBasic && "aspect-square"
      )}>
        <img
          src={category.image}
          alt={category.name}
          className={cn(
            "w-full h-full object-cover transition-transform",
            isEnterprise && "duration-700 group-hover:scale-110",
            isProfessional && "duration-500 group-hover:scale-105",
            isBasic && "duration-300"
          )}
        />

        {/* Overlay gradient */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isEnterprise && "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
          isProfessional && "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
          isBasic && "bg-gradient-to-t from-black/60 to-transparent"
        )} />

        {/* Enterprise glow effect */}
        {isEnterprise && (
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 100%, ${store.primary_color}40, transparent 60%)`,
            }}
          />
        )}

        {/* Trending badge */}
        {!isBasic && category.trending && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-3 left-3"
          >
            <Badge 
              className={cn(
                "flex items-center gap-1",
                isEnterprise && "px-3 py-1.5 text-sm shadow-lg"
              )}
              style={{ backgroundColor: store.primary_color }}
            >
              <Sparkles className="h-3 w-3" />
              Trending
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 text-white transition-all duration-500",
        isEnterprise && "p-6 group-hover:pb-8",
        isProfessional && "p-5",
        isBasic && "p-4"
      )}>
        <h3 className={cn(
          "font-bold mb-1",
          isEnterprise && "text-2xl",
          isProfessional && "text-xl",
          isBasic && "text-lg"
        )}>
          {category.name}
        </h3>
        
        {!isBasic && (
          <p className="text-white/80 text-sm mb-3">
            {category.count} productos
          </p>
        )}

        {/* Explore button - Professional & Enterprise */}
        {!isBasic && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-all",
              isEnterprise && "opacity-0 group-hover:opacity-100"
            )}
          >
            <span>Explorar</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.div>
          </motion.div>
        )}

        {/* Enterprise decorative line */}
        {isEnterprise && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/40"
            initial={{ width: 0 }}
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  );

  // Enterprise full-width showcase
  if (isEnterprise) {
    return (
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: store.primary_color }}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 md:mb-0">
              <Badge 
                variant="outline" 
                className="mb-4"
                style={{ borderColor: store.primary_color, color: store.primary_color }}
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Colecciones
              </Badge>
              <h2 
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: 'var(--store-heading-font, inherit)' }}
              >
                {section.settings.title || "Explora por Categoría"}
              </h2>
              {section.settings.subtitle && (
                <p className="text-muted-foreground text-lg mt-3 max-w-xl">
                  {section.settings.subtitle}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="group self-start md:self-auto"
              style={{ borderColor: store.primary_color, color: store.primary_color }}
            >
              Ver todas
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Categories grid - asymmetric */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {/* Large featured category */}
            <div className="col-span-2 row-span-2">
              <CategoryCard category={categories[0]} index={0} />
            </div>
            
            {/* Smaller categories */}
            {categories.slice(1, 5).map((category: any, index: number) => (
              <CategoryCard key={category.id} category={category} index={index + 1} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Professional grid
  if (isProfessional) {
    return (
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {section.settings.title || "Categorías"}
            </h2>
            {section.settings.subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {section.settings.subtitle}
              </p>
            )}
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.slice(0, 8).map((category: any, index: number) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Basic simple grid
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {section.settings.title || "Categorías"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.slice(0, 6).map((category: any, index: number) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
