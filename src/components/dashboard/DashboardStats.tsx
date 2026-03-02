import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useStoreOrdersStats } from "@/hooks/useStoreOrders";
import { useEffect, useState } from "react";

interface DashboardStatsProps {
  storeId: string;
  primaryColor: string;
  productsCount: number;
}

const AnimatedNumber = ({ value, prefix = "", decimals = 0 }: { value: number; prefix?: string; decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 25;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>{prefix}{displayValue.toFixed(decimals)}</span>
  );
};

const DashboardStats = ({ storeId, primaryColor, productsCount }: DashboardStatsProps) => {
  const { data: stats, isLoading } = useStoreOrdersStats(storeId);

  const statCards = [
    {
      title: "Ingresos",
      value: stats?.totalRevenue || 0,
      prefix: "$",
      decimals: 2,
      icon: DollarSign,
      trend: "+12%",
      trendUp: true,
      accentClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-500/10",
    },
    {
      title: "Pedidos",
      value: stats?.totalOrders || 0,
      prefix: "",
      decimals: 0,
      icon: ShoppingCart,
      trend: "+8%",
      trendUp: true,
      accentClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-500/10",
    },
    {
      title: "Pendientes",
      value: stats?.pendingOrders || 0,
      prefix: "",
      decimals: 0,
      icon: Package,
      trend: "-3%",
      trendUp: false,
      accentClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-500/10",
    },
    {
      title: "Productos",
      value: productsCount,
      prefix: "",
      decimals: 0,
      icon: Package,
      trend: `${productsCount}`,
      trendUp: true,
      accentClass: "text-violet-600 dark:text-violet-400",
      bgClass: "bg-violet-500/10",
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse border-border/50">
            <CardContent className="p-5">
              <div className="h-16 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-2 xl:grid-cols-4 gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, staggerChildren: 0.1 }}
    >
      {statCards.map((stat, index) => (
        <motion.div 
          key={index} 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Card className="border-border/50 bg-card/80 hover:shadow-md transition-shadow duration-300">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bgClass}`}>
                  <stat.icon className={`h-4 w-4 ${stat.accentClass}`} />
                </div>
                <div className="flex items-center gap-0.5 text-xs">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-amber-500" />
                  )}
                  <span className={stat.trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight leading-none">
                <AnimatedNumber 
                  value={stat.value} 
                  prefix={stat.prefix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;