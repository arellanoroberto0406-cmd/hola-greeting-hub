import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

interface AboutSectionProps {
  section: StoreSection;
  store: Store;
}

export const AboutSection = ({ section, store }: AboutSectionProps) => {
  const { content } = section.settings;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-12"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${store.primary_color}15` }}
        >
          <Info className="h-6 w-6" style={{ color: store.primary_color }} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: store.primary_color }}>
          {section.title}
        </h2>
      </div>
      
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground text-lg leading-relaxed">
          {content || store.description || 'Somos una tienda comprometida con ofrecer los mejores productos a nuestros clientes.'}
        </p>
      </div>
    </motion.section>
  );
};
