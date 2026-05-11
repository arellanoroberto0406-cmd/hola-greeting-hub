import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PurchaseFAQSectionProps {
  primaryColor: string;
  storeName: string;
}

const faqs = [
  {
    q: "¿Puedo devolver un producto si no me convence?",
    a: "Sí. Tienes hasta 30 días desde la recepción para solicitar la devolución. El producto debe estar en buen estado y con su empaque original. Una vez recibido y revisado, procesamos el reembolso completo.",
  },
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Los envíos estándar tardan entre 3 y 7 días hábiles según tu ubicación. Recibirás un número de seguimiento por correo y WhatsApp para rastrear tu pedido en tiempo real.",
  },
  {
    q: "¿Cómo funcionan los reembolsos?",
    a: "Una vez aprobada la devolución, el reembolso se procesa en 3-5 días hábiles por el mismo método de pago que usaste. Si pagaste por transferencia, te pediremos los datos bancarios para devolver el importe.",
  },
  {
    q: "¿Qué métodos de pago aceptan y son seguros?",
    a: "Aceptamos PayPal y transferencia bancaria. Todos los pagos viajan cifrados con SSL de 256 bits y nunca almacenamos datos de tu tarjeta. Las transferencias se validan manualmente para mayor seguridad.",
  },
  {
    q: "¿Cómo puedo contactarlos si tengo un problema?",
    a: "Puedes escribirnos por WhatsApp o usar el chat en vivo de la tienda. Respondemos rápido en horario laboral y siempre te asignamos a una persona real, no a un bot automatizado.",
  },
];

export const PurchaseFAQSection = ({ primaryColor, storeName }: PurchaseFAQSectionProps) => {
  return (
    <section
      className="relative py-16 md:py-24 px-4 overflow-hidden"
      aria-labelledby="faq-compra-heading"
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(180deg, transparent, ${primaryColor}05, transparent)`,
        }}
      />

      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border backdrop-blur-sm"
            style={{
              backgroundColor: `${primaryColor}10`,
              borderColor: `${primaryColor}30`,
              color: primaryColor,
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            PREGUNTAS FRECUENTES
          </div>
          <h2
            id="faq-compra-heading"
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Resolvemos tus dudas
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Todo lo que necesitas saber antes de comprar en {storeName}.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border rounded-2xl bg-card/60 backdrop-blur-sm px-5 transition-colors hover:bg-card/80"
                style={{ borderColor: `${primaryColor}20` }}
              >
                <AccordionTrigger className="text-left font-semibold text-base md:text-lg hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base text-muted-foreground leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default PurchaseFAQSection;
