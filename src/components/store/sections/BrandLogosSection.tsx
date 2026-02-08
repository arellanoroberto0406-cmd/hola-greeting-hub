import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PlanTier } from "@/hooks/useStorePlanTier";
import { Sparkles, Award, Shield, Star } from "lucide-react";

interface BrandLogosProps {
  planTier?: PlanTier;
  title?: string;
  subtitle?: string;
  brands?: Array<{
    name: string;
    logo?: string;
  }>;
}

const defaultBrands = [
  { name: "Apple", logo: "🍎" },
  { name: "Google", logo: "🔍" },
  { name: "Microsoft", logo: "💻" },
  { name: "Amazon", logo: "📦" },
  { name: "Meta", logo: "🌐" },
  { name: "Netflix", logo: "🎬" },
  { name: "Spotify", logo: "🎵" },
  { name: "Tesla", logo: "⚡" },
  { name: "Nike", logo: "✓" },
  { name: "Adidas", logo: "🏃" },
  { name: "Samsung", logo: "📱" },
  { name: "Sony", logo: "🎮" },
];

export const BrandLogosSection = ({
  planTier = "basic",
  title = "Marcas que confían en nosotros",
  subtitle = "Colaboramos con las mejores marcas del mercado",
  brands = defaultBrands,
}: BrandLogosProps) => {
  const isEnterprise = planTier === "enterprise";
  const isProfessional = planTier === "professional" || isEnterprise;

  // Duplicate brands for seamless loop
  const duplicatedBrands = [...brands, ...brands, ...brands];

  if (!isProfessional) {
    // Basic tier: Simple static grid
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">{title}</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {brands.slice(0, 6).map((brand, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-4 bg-background rounded-lg border"
              >
                <span className="text-2xl mr-2">{brand.logo}</span>
                <span className="text-sm font-medium text-muted-foreground">
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!isEnterprise) {
    // Professional tier: Animated grid with hover effects
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {brands.slice(0, 12).map((brand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group flex flex-col items-center justify-center p-6 bg-background rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {brand.logo}
                </span>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {brand.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Enterprise tier: Full marquee with premium effects
  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/30 rounded-full"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Partners Oficiales</span>
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          {[
            { icon: Award, label: "Marcas Premium", value: "50+" },
            { icon: Shield, label: "Años de Confianza", value: "10+" },
            { icon: Star, label: "Proyectos Exitosos", value: "500+" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-background/80 backdrop-blur-sm border border-primary/10 shadow-lg"
            >
              <div className="p-2 rounded-xl bg-primary/10">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Marquee Container */}
        <div className="relative">
          {/* Gradient Masks */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          {/* First Marquee Row - Left to Right */}
          <div className="mb-6 overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: [0, -50 * brands.length] }}
              transition={{
                x: {
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {duplicatedBrands.map((brand, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-4 px-8 py-6",
                    "bg-background/80 backdrop-blur-sm rounded-2xl",
                    "border border-primary/10 shadow-lg",
                    "hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
                    "transition-all duration-300 cursor-pointer group"
                  )}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {brand.logo}
                  </span>
                  <div>
                    <span className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                    <div className="text-xs text-muted-foreground">Partner Oficial</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Second Marquee Row - Right to Left */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{ x: [-50 * brands.length, 0] }}
              transition={{
                x: {
                  duration: 35,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
            >
              {[...duplicatedBrands].reverse().map((brand, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-4 px-8 py-6",
                    "bg-background/80 backdrop-blur-sm rounded-2xl",
                    "border border-accent/10 shadow-lg",
                    "hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5",
                    "transition-all duration-300 cursor-pointer group"
                  )}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {brand.logo}
                  </span>
                  <div>
                    <span className="text-lg font-semibold group-hover:text-accent transition-colors">
                      {brand.name}
                    </span>
                    <div className="text-xs text-muted-foreground">Partner Verificado</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "px-8 py-4 rounded-full font-semibold",
              "bg-gradient-to-r from-primary to-primary/80",
              "text-primary-foreground shadow-lg shadow-primary/25",
              "hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            )}
          >
            Convertirse en Partner
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandLogosSection;
