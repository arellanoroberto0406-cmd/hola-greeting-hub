import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Store } from "@/types/store";

interface CategorySectionProps {
  collections: string[];
  store: Store;
  onCollectionSelect: (collection: string) => void;
  selectedCollection: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// Category icons/images mapping (can be customized per store)
const getCategoryGradient = (index: number): string => {
  const gradients = [
    "from-rose-500 to-pink-500",
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-green-500 to-emerald-500",
  ];
  return gradients[index % gradients.length];
};

const CategorySection = ({
  collections,
  store,
  onCollectionSelect,
  selectedCollection,
}: CategorySectionProps) => {
  if (collections.length === 0) return null;

  return (
    <section className="py-8">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-2xl md:text-3xl font-heading font-bold mb-6 text-center"
        >
          Categorías
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {/* All Products Card */}
          <motion.div variants={fadeInUp}>
            <Card
              className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                selectedCollection === "all"
                  ? "ring-2 ring-offset-2 ring-primary"
                  : "hover:ring-1 hover:ring-primary/20"
              }`}
              onClick={() => onCollectionSelect("all")}
            >
              <CardContent className="p-0">
                <div
                  className="aspect-square flex items-center justify-center text-white font-heading font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${store.primary_color}, ${store.secondary_color || store.primary_color}99)`,
                  }}
                >
                  Todos
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {collections.map((collection, index) => (
            <motion.div key={collection} variants={fadeInUp}>
              <Card
                className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedCollection === collection
                    ? "ring-2 ring-offset-2 ring-primary"
                    : "hover:ring-1 hover:ring-primary/20"
                }`}
                onClick={() => onCollectionSelect(collection)}
              >
                <CardContent className="p-0">
                  <div
                    className={`aspect-square flex items-center justify-center text-white font-heading font-bold text-sm text-center p-2 bg-gradient-to-br ${getCategoryGradient(index)}`}
                  >
                    {collection}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CategorySection;
