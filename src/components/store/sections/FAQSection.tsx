import { StoreSection } from "@/types/storeLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FAQSectionProps {
  section: StoreSection;
  store: any;
}

const defaultFaqs = [
  {
    id: 1,
    question: "¿Cuáles son los métodos de pago disponibles?",
    answer: "Aceptamos tarjetas de crédito, débito, transferencias bancarias y pago contra entrega en zonas seleccionadas."
  },
  {
    id: 2,
    question: "¿Cuánto tiempo tarda en llegar mi pedido?",
    answer: "El tiempo de entrega varía según tu ubicación. Generalmente los pedidos se entregan entre 3 y 7 días hábiles."
  },
  {
    id: 3,
    question: "¿Puedo devolver un producto?",
    answer: "Sí, tienes 30 días para devolver cualquier producto sin uso. El producto debe estar en su empaque original."
  },
  {
    id: 4,
    question: "¿Los productos tienen garantía?",
    answer: "Todos nuestros productos cuentan con garantía de fábrica. El tiempo de garantía varía según el producto."
  },
  {
    id: 5,
    question: "¿Realizan envíos a todo el país?",
    answer: "Sí, realizamos envíos a toda la República. Los costos de envío se calculan según el destino y peso del paquete."
  }
];

export const FAQSection = ({ section, store }: FAQSectionProps) => {
  const faqs = section.settings.faqs || defaultFaqs;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.section 
      className="py-12 md:py-16"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${store?.primary_color}15` }}
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          >
            <HelpCircle 
              className="h-8 w-8" 
              style={{ color: store?.primary_color }}
            />
          </motion.div>
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {section.settings.headline || "Preguntas Frecuentes"}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {section.settings.subtitle || "Encuentra respuestas a las preguntas más comunes"}
          </motion.p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq: any, index: number) => (
              <motion.div key={faq.id || index} variants={itemVariants}>
                <AccordionItem 
                  value={`item-${index}`}
                  className="border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-5">
                    <span className="font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </motion.section>
  );
};