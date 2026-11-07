import { useCustomerFaqs } from '@/hooks/useCustomerFaqs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircleQuestion } from 'lucide-react';
export default function CustomerFaqSection({ storeId }: { storeId: string }) {
  const { data } = useCustomerFaqs(storeId);
  if (!data?.length) return null;
  return <section className="py-10 px-4" aria-label="Preguntas de clientes">
    <div className="container mx-auto max-w-3xl">
      <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 mb-6"><MessageCircleQuestion className="h-6 w-6 shrink-0" />Preguntas de clientes</h2>
      <Accordion type="single" collapsible>{data.map(item => <AccordionItem key={item.id} value={item.id}><AccordionTrigger className="text-left break-words gap-3">{item.question}</AccordionTrigger><AccordionContent className="whitespace-pre-wrap break-words text-muted-foreground">{item.answer}</AccordionContent></AccordionItem>)}</Accordion>
    </div>
  </section>;
}