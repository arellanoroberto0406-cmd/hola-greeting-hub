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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="py-12"
    >
      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${store.primary_color}15` }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Info className="h-6 w-6" style={{ color: store.primary_color }} />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold font-heading" style={{ color: store.primary_color }}>
          {section.title}
        </h2>
      </motion.div>
      
      <motion.div 
        className="prose prose-gray max-w-none"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <p className="text-muted-foreground text-lg leading-relaxed">
          {content || store.description || 'Somos una tienda comprometida con ofrecer los mejores productos a nuestros clientes.'}
        </p>
      </motion.div>
    </motion.section>
  );
};
