import { StoreSection } from "@/types/storeLayout";
import { motion, useInView, useSpring, useMotionValue } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Crown, TrendingUp, Users, Package, Star, 
  ShoppingBag, Award, Heart, Zap, Globe 
} from "lucide-react";

interface AnimatedStatsProps {
  section: StoreSection;
  store: any;
  planTier?: 'basic' | 'professional' | 'enterprise';
}

interface StatConfig {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon: keyof typeof iconMap;
  color?: string;
}

const iconMap = {
  trending: TrendingUp,
  users: Users,
  package: Package,
  star: Star,
  shopping: ShoppingBag,
  award: Award,
  heart: Heart,
  zap: Zap,
  globe: Globe,
};

// Animated Counter Component
const AnimatedCounter = ({ 
  value, 
  duration = 2,
  prefix = '',
  suffix = '',
  color 
}: { 
  value: number; 
  duration?: number;
  prefix?: string;
  suffix?: string;
  color: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(num >= 10000 ? 0 : 1)}K`;
    return num.toLocaleString();
  };

  return (
    <span ref={ref} className="tabular-nums" style={{ color }}>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  );
};

export const AnimatedStatsSection = ({ section, store, planTier = 'basic' }: AnimatedStatsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const accentColor = store?.primary_color || '#8B4513';

  // Check plan tier
  if (planTier !== 'enterprise') {
    return (
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto rounded-2xl border-2 border-dashed p-12 text-center"
            style={{ borderColor: `${accentColor}30` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)` }}
            >
              <Crown className="h-10 w-10" style={{ color: accentColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-3">Estadísticas Animadas</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Muestra números impactantes con animaciones de conteo que cautivan a tus visitantes.
            </p>
            <Badge 
              className="text-sm px-4 py-2"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              Requiere Plan Enterprise
            </Badge>
          </motion.div>
        </div>
      </section>
    );
  }

  const layoutStyle = section.settings.layoutStyle || 'cards';
  const stats: StatConfig[] = section.settings.stats || [
    { value: 10000, label: 'Clientes Felices', suffix: '+', icon: 'users' },
    { value: 50000, label: 'Productos Vendidos', suffix: '+', icon: 'package' },
    { value: 4.9, label: 'Calificación Promedio', icon: 'star' },
    { value: 99, label: 'Satisfacción', suffix: '%', icon: 'heart' },
  ];

  // Cards Layout
  const renderCardsLayout = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const IconComponent = iconMap[stat.icon] || TrendingUp;
        return (
          <motion.div
            key={idx}
            className="relative group"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.15, ease: "easeOut" }}
          >
            <div 
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{ background: `${accentColor}30` }}
            />
            <div 
              className="relative bg-card rounded-3xl p-8 border shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2"
              style={{ borderColor: `${accentColor}20` }}
            >
              <motion.div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)` }}
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <IconComponent className="h-8 w-8" style={{ color: accentColor }} />
              </motion.div>
              
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  color={accentColor}
                />
              </h3>
              
              <p className="text-muted-foreground font-medium">{stat.label}</p>

              {/* Decorative line */}
              <motion.div 
                className="absolute bottom-0 left-8 right-8 h-1 rounded-full"
                style={{ background: `linear-gradient(to right, ${accentColor}, transparent)` }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: idx * 0.15 + 0.5 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  // Minimal Layout
  const renderMinimalLayout = () => (
    <div className="flex flex-wrap justify-center gap-12 md:gap-20">
      {stats.map((stat, idx) => {
        const IconComponent = iconMap[stat.icon] || TrendingUp;
        return (
          <motion.div
            key={idx}
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <IconComponent className="h-6 w-6" style={{ color: accentColor }} />
            </motion.div>
            
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-3">
              <AnimatedCounter 
                value={stat.value} 
                prefix={stat.prefix}
                suffix={stat.suffix}
                color={accentColor}
              />
            </h3>
            
            <p className="text-lg text-muted-foreground">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );

  // Banner Layout
  const renderBannerLayout = () => (
    <motion.div 
      className="relative rounded-3xl overflow-hidden py-12 px-8"
      style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6 }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              left: `${20 * i}%`,
              top: `${-20 + i * 10}%`,
            }}
            animate={{
              y: [0, 20, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => {
          const IconComponent = iconMap[stat.icon] || TrendingUp;
          return (
            <motion.div
              key={idx}
              className="text-center text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <IconComponent className="h-8 w-8 mx-auto mb-4 opacity-80" />
              
              <h3 className="text-4xl md:text-5xl font-bold mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  color="white"
                />
              </h3>
              
              <p className="text-white/80 font-medium">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  // Circular Layout
  const renderCircularLayout = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, idx) => {
        const IconComponent = iconMap[stat.icon] || TrendingUp;
        const percentage = Math.min((stat.value / 100) * 100, 100);
        
        return (
          <motion.div
            key={idx}
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
          >
            <div className="relative w-36 h-36 mb-6">
              {/* Background circle */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke={`${accentColor}20`}
                  strokeWidth="8"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke={accentColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={377}
                  initial={{ strokeDashoffset: 377 }}
                  animate={isInView ? { strokeDashoffset: 377 - (377 * percentage) / 100 } : {}}
                  transition={{ duration: 1.5, delay: idx * 0.15, ease: "easeOut" }}
                />
              </svg>
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <IconComponent className="h-10 w-10" style={{ color: accentColor }} />
                </motion.div>
              </div>
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-1">
              <AnimatedCounter 
                value={stat.value} 
                prefix={stat.prefix}
                suffix={stat.suffix}
                color={accentColor}
              />
            </h3>
            
            <p className="text-muted-foreground text-center">{stat.label}</p>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <section ref={containerRef} className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        {(section.settings.headline || section.settings.subtitle) && (
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            {section.settings.badge && (
              <Badge 
                className="mb-4"
                style={{ background: `${accentColor}20`, color: accentColor }}
              >
                <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                {section.settings.badge}
              </Badge>
            )}
            
            {section.settings.headline && (
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: 'var(--store-heading-font)' }}
              >
                {section.settings.headline}
              </h2>
            )}
            
            {section.settings.subtitle && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {section.settings.subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Stats */}
        {layoutStyle === 'cards' && renderCardsLayout()}
        {layoutStyle === 'minimal' && renderMinimalLayout()}
        {layoutStyle === 'banner' && renderBannerLayout()}
        {layoutStyle === 'circular' && renderCircularLayout()}
      </div>
    </section>
  );
};

export default AnimatedStatsSection;
