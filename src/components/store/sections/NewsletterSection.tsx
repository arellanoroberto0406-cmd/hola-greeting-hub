import { useState } from "react";
import { Store } from "@/types/store";
import { StoreSection } from "@/types/storeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface NewsletterSectionProps {
  section: StoreSection;
  store: Store;
}

export const NewsletterSection = ({ section, store }: NewsletterSectionProps) => {
  const { headline, subtitle } = section.settings;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate subscription
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubscribed(true);
    setEmail("");
    
    toast({
      title: "¡Suscripción exitosa!",
      description: "Recibirás nuestras ofertas exclusivas.",
    });
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="py-16 px-6 rounded-2xl text-center"
      style={{ backgroundColor: `${store.primary_color}08` }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="inline-flex h-16 w-16 items-center justify-center rounded-2xl mb-6"
        style={{ backgroundColor: `${store.primary_color}15` }}
      >
        <Mail className="h-8 w-8" style={{ color: store.primary_color }} />
      </motion.div>

      <h2 className="text-2xl md:text-3xl font-bold font-heading mb-3">
        {headline || 'Suscríbete a nuestro boletín'}
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {subtitle || 'Recibe ofertas exclusivas y novedades directamente en tu correo'}
      </p>

      {isSubscribed ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-2 text-green-600"
        >
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">¡Gracias por suscribirte!</span>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: store.primary_color }}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Suscribirse'
            )}
          </Button>
        </form>
      )}
    </motion.section>
  );
};
