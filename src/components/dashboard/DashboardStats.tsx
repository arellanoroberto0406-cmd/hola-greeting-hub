import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Users,
  Eye
} from "lucide-react";
import { useStoreOrdersStats } from "@/hooks/useStoreOrders";
import { useEffect, useState } from "react";

interface DashboardStatsProps {
  storeId: string;
  primaryColor: string;
  productsCount: number;
}

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "", decimals = 0 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
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
    <span>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const }
  }
};

const DashboardStats = ({ storeId, primaryColor, productsCount }: DashboardStatsProps) => {
  const { data: stats, isLoading } = useStoreOrdersStats(storeId);

  const statCards = [
    {
      title: "Ingresos Totales",
      value: stats?.totalRevenue || 0,
      prefix: "$",
      decimals: 2,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-500/10",
      iconColor: "text-green-500"
    },
    {
      title: "Total Pedidos",
      value: stats?.totalOrders || 0,
      prefix: "",
      decimals: 0,
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      title: "Pendientes",
      value: stats?.pendingOrders || 0,
      prefix: "",
      decimals: 0,
      icon: Package,
      color: "from-amber-500 to-orange-600",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500"
    },
    {
      title: "Productos",
      value: productsCount,
      prefix: "",
      decimals: 0,
      icon: Package,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold font-heading tracking-tight">
                    <AnimatedNumber 
                      value={stat.value} 
                      prefix={stat.prefix}
                      decimals={stat.decimals}
                    />
                  </p>
                </div>
                <motion.div 
                  className={`p-3 rounded-xl ${stat.bgColor}`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </motion.div>
              </div>
              
              {/* Trend indicator - placeholder */}
              <div className="flex items-center gap-1 mt-3 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-muted-foreground">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default DashboardStats;
