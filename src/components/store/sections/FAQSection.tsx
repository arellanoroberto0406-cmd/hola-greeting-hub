import { StoreSection } from "@/types/storeLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

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

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${store?.primary_color}15` }}
          >
            <HelpCircle 
              className="h-8 w-8" 
              style={{ color: store?.primary_color }}
            />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {section.settings.headline || "Preguntas Frecuentes"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {section.settings.subtitle || "Encuentra respuestas a las preguntas más comunes"}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq: any, index: number) => (
              <AccordionItem 
                key={faq.id || index} 
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
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};