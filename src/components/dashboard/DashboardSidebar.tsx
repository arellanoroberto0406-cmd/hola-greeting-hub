import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ShoppingBag, 
  Link2, 
  Wallet, 
  PieChart, 
  RotateCcw, 
  BarChart3, 
  Tag, 
  Package, 
  Layers, 
  CreditCard, 
  Settings,
  MessagesSquare,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  primaryColor: string;
  unreadCount?: number;
}

const tabs = [
  { id: "orders", label: "Pedidos", icon: ShoppingBag, description: "Gestiona pedidos y envíos" },
  { id: "url", label: "URL", icon: Link2, description: "Enlace y código QR" },
  { id: "payments", label: "Pagos", icon: Wallet, description: "Métodos de pago" },
  { id: "payment-stats", label: "Ventas", icon: PieChart, description: "Estadísticas de ventas" },
  { id: "refunds", label: "Reembolsos", icon: RotateCcw, description: "Historial de reembolsos" },
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Métricas y gráficas" },
  { id: "coupons", label: "Cupones", icon: Tag, description: "Descuentos y promociones" },
  { id: "products", label: "Productos", icon: Package, description: "Catálogo de productos" },
  { id: "editor", label: "Editor", icon: Layers, description: "Personaliza tu tienda" },
  { id: "subscription", label: "Plan", icon: CreditCard, description: "Tu suscripción" },
  { id: "settings", label: "Configuración", icon: Settings, description: "Ajustes de la tienda" },
  { id: "chat", label: "Chat", icon: MessagesSquare, description: "Chat con clientes" },
];

const sidebarVariants = {
  expanded: { width: 260 },
  collapsed: { width: 72 }
};

const DashboardSidebar = ({ activeTab, onTabChange, primaryColor, unreadCount = 0 }: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-border/50 bg-card/30 backdrop-blur-sm"
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-background shadow-sm z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasNotification = tab.id === "chat" && unreadCount > 0;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive 
                  ? "text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={{
                backgroundColor: isActive ? primaryColor : undefined
              }}
              whileHover={{ x: isActive ? 0 : 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className={cn(
                "h-5 w-5 flex-shrink-0",
                isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="truncate"
                >
                  {tab.label}
                </motion.span>
              )}
              
              {hasNotification && (
                <Badge 
                  className={cn(
                    "h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-bold",
                    isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                  )}
                  style={{ backgroundColor: isActive ? "white" : primaryColor, color: isActive ? primaryColor : "white" }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div 
          className="p-4 border-t border-border/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-foreground">¿Necesitas ayuda?</p>
            <p className="text-xs text-muted-foreground mt-1">Revisa el tutorial o contacta soporte</p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};

export default DashboardSidebar;
