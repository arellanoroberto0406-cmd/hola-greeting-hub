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

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {section.settings.headline || "Lo que dicen nuestros clientes"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {section.settings.subtitle || "Opiniones reales de clientes satisfechos"}
          </p>
        </div>

        <div className={`grid gap-6 md:grid-cols-${columns}`}>
          {testimonials.map((testimonial: any, index: number) => (
            <motion.div
              key={testimonial.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
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
        </div>
      </div>
    </section>
  );
};