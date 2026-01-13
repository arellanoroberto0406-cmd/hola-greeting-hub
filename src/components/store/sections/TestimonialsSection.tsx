import { StoreSection } from "@/types/storeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface TestimonialsSectionProps {
  section: StoreSection;
  store: any;
}

const defaultTestimonials = [
  {
    id: 1,
    name: "María García",
    avatar: "",
    rating: 5,
    comment: "Excelente calidad y servicio. Los productos llegaron antes de lo esperado.",
    date: "Hace 2 semanas"
  },
  {
    id: 2,
    name: "Carlos López",
    avatar: "",
    rating: 5,
    comment: "Muy satisfecho con mi compra. Definitivamente volveré a comprar aquí.",
    date: "Hace 1 mes"
  },
  {
    id: 3,
    name: "Ana Martínez",
    avatar: "",
    rating: 4,
    comment: "Buenos productos y atención al cliente muy amable. Recomendado.",
    date: "Hace 3 semanas"
  }
];

export const TestimonialsSection = ({ section, store }: TestimonialsSectionProps) => {
  const testimonials = section.settings.testimonials || defaultTestimonials;
  const columns = section.settings.columns || 3;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {section.settings.headline || "Lo que dicen nuestros clientes"}
          </motion.h2>
          <motion.p 
            className="text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {section.settings.subtitle || "Opiniones reales de clientes satisfechos"}
          </motion.p>
        </motion.div>

        <motion.div 
          className={`grid gap-6 md:grid-cols-${columns}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={testimonial.id || index}
              variants={itemVariants}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Quote 
                    className="h-8 w-8 mb-4 opacity-20"
                    style={{ color: store?.primary_color }}
                  />
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.comment}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback 
                        style={{ backgroundColor: store?.primary_color }}
                        className="text-white"
                      >
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-2">
                          {testimonial.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};