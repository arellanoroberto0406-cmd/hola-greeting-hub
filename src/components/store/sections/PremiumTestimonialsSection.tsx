import { StoreSection } from "@/types/storeLayout";
import { Store } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, Sparkles, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface PremiumTestimonialsSectionProps {
  section: StoreSection;
  store: Store;
  planTier?: "basic" | "professional" | "enterprise";
}

const defaultTestimonials = [
  {
    id: 1,
    name: "María García",
    avatar: "",
    rating: 5,
    comment: "Excelente calidad y servicio. Los productos llegaron antes de lo esperado y la atención fue impecable.",
    date: "Hace 2 semanas",
    verified: true,
    location: "Ciudad de México"
  },
  {
    id: 2,
    name: "Carlos López",
    avatar: "",
    rating: 5,
    comment: "Muy satisfecho con mi compra. Definitivamente volveré a comprar aquí. La calidad superó mis expectativas.",
    date: "Hace 1 mes",
    verified: true,
    location: "Guadalajara"
  },
  {
    id: 3,
    name: "Ana Martínez",
    avatar: "",
    rating: 5,
    comment: "Buenos productos y atención al cliente muy amable. El envío fue rapidísimo. Totalmente recomendado.",
    date: "Hace 3 semanas",
    verified: true,
    location: "Monterrey"
  },
  {
    id: 4,
    name: "Roberto Sánchez",
    avatar: "",
    rating: 5,
    comment: "Increíble experiencia de compra. El producto llegó perfectamente empacado y funciona de maravilla.",
    date: "Hace 1 semana",
    verified: true,
    location: "Puebla"
  }
];

export const PremiumTestimonialsSection = ({ 
  section, 
  store,
  planTier = "basic" 
}: PremiumTestimonialsSectionProps) => {
  const testimonials = section.settings.testimonials || defaultTestimonials;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const isBasic = planTier === "basic";
  const isProfessional = planTier === "professional";
  const isEnterprise = planTier === "enterprise";

  // Auto-rotate testimonials for Enterprise
  useEffect(() => {
    if (!isEnterprise || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isEnterprise, isAutoPlaying, testimonials.length]);

  const TestimonialCard = ({ testimonial, index }: { testimonial: any; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={!isBasic ? { y: -8, scale: 1.02 } : {}}
      className="h-full"
    >
      <Card className={cn(
        "h-full transition-all duration-500 overflow-hidden",
        isEnterprise && "hover:shadow-2xl border-primary/10 hover:border-primary/30 bg-gradient-to-br from-card to-card/80",
        isProfessional && "hover:shadow-xl",
        isBasic && "hover:shadow-lg"
      )}>
        {/* Enterprise decorative elements */}
        {isEnterprise && (
          <>
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl"
              style={{ background: `radial-gradient(circle, ${store.primary_color}, transparent)` }}
            />
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="h-5 w-5 text-primary/30" />
              </motion.div>
            </div>
          </>
        )}

        <CardContent className={cn(
          "p-6 relative",
          isEnterprise && "p-8"
        )}>
          {/* Quote icon with animation */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Quote 
              className={cn(
                "mb-4",
                isEnterprise && "h-10 w-10 opacity-30",
                isProfessional && "h-8 w-8 opacity-25",
                isBasic && "h-8 w-8 opacity-20"
              )}
              style={{ color: store.primary_color }}
            />
          </motion.div>

          {/* Rating stars with animation */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <Star
                  className={cn(
                    "fill-yellow-400 text-yellow-400",
                    isEnterprise && "h-5 w-5",
                    isProfessional && "h-4 w-4",
                    isBasic && "h-3.5 w-3.5"
                  )}
                />
              </motion.div>
            ))}
          </div>

          {/* Testimonial text */}
          <p className={cn(
            "text-muted-foreground mb-6 italic leading-relaxed",
            isEnterprise && "text-base",
            isProfessional && "text-sm",
            isBasic && "text-sm"
          )}>
            "{testimonial.comment}"
          </p>

          {/* Author info */}
          <div className="flex items-center gap-4">
            <motion.div whileHover={isEnterprise ? { scale: 1.1 } : {}}>
              <Avatar className={cn(
                isEnterprise && "h-14 w-14 ring-2 ring-primary/20 ring-offset-2",
                isProfessional && "h-12 w-12",
                isBasic && "h-10 w-10"
              )}>
                <AvatarImage src={testimonial.avatar} />
                <AvatarFallback 
                  className="text-white font-semibold"
                  style={{ backgroundColor: store.primary_color }}
                >
                  {testimonial.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "font-semibold",
                  isEnterprise && "text-base",
                  !isEnterprise && "text-sm"
                )}>
                  {testimonial.name}
                </p>
                {!isBasic && testimonial.verified && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Verificado
                  </Badge>
                )}
              </div>
              {!isBasic && testimonial.location && (
                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">{testimonial.date}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Enterprise featured layout
  if (isEnterprise) {
    return (
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-20"
            style={{ background: store.primary_color }}
            animate={{ 
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: store.secondary_color || store.primary_color }}
            animate={{ 
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 12, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <Badge 
              variant="outline" 
              className="mb-4 px-4 py-1.5"
              style={{ borderColor: store.primary_color, color: store.primary_color }}
            >
              <Sparkles className="h-3 w-3 mr-1.5" />
              +10,000 clientes satisfechos
            </Badge>
            <h2 
              className="text-3xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'var(--store-heading-font, inherit)' }}
            >
              {section.settings.headline || "Lo que dicen nuestros clientes"}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section.settings.subtitle || "Opiniones reales de clientes satisfechos que confían en nosotros"}
            </p>
          </motion.div>

          {/* Featured testimonial */}
          <div className="max-w-4xl mx-auto mb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-card/80 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-primary/20 shadow-2xl"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 ring-4 ring-primary/20 ring-offset-4">
                      <AvatarImage src={testimonials[activeIndex]?.avatar} />
                      <AvatarFallback 
                        className="text-2xl text-white font-bold"
                        style={{ backgroundColor: store.primary_color }}
                      >
                        {testimonials[activeIndex]?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-xl md:text-2xl italic mb-6 leading-relaxed">
                      "{testimonials[activeIndex]?.comment}"
                    </blockquote>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <span className="font-bold text-lg">{testimonials[activeIndex]?.name}</span>
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compra verificada
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === activeIndex ? "w-8" : "w-2",
                    )}
                    style={{ 
                      backgroundColor: i === activeIndex ? store.primary_color : 'var(--muted)' 
                    }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { value: "4.9", label: "Calificación promedio" },
              { value: "10K+", label: "Clientes felices" },
              { value: "98%", label: "Recomendarían" },
              { value: "24h", label: "Tiempo de respuesta" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center p-6 rounded-2xl bg-card/50 backdrop-blur border border-border/50"
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  style={{ color: store.primary_color }}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    );
  }

  // Professional grid layout
  if (isProfessional) {
    return (
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {section.settings.headline || "Lo que dicen nuestros clientes"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {section.settings.subtitle || "Opiniones reales de clientes satisfechos"}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 6).map((testimonial: any, index: number) => (
              <TestimonialCard key={testimonial.id || index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Basic simple layout
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            {section.settings.headline || "Lo que dicen nuestros clientes"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {section.settings.subtitle || "Opiniones reales de clientes satisfechos"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial: any, index: number) => (
            <TestimonialCard key={testimonial.id || index} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
