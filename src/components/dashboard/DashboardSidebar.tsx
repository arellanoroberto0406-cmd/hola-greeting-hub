import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Crown,
  Lock,
  X
} from "lucide-react";
import { useState } from "react";
import { PlanTier } from "@/hooks/useStorePlanTier";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  primaryColor: string;
  unreadCount?: number;
  planTier?: PlanTier;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const tabs = [
  { id: "orders", label: "Pedidos", icon: ShoppingBag, group: "ventas", minPlan: "basic" as PlanTier },
  { id: "products", label: "Productos", icon: Package, group: "ventas", minPlan: "basic" as PlanTier },
  { id: "url", label: "URL & QR", icon: Link2, group: "ventas", minPlan: "basic" as PlanTier },
  { id: "payments", label: "Métodos de Pago", icon: Wallet, group: "finanzas", minPlan: "basic" as PlanTier },
  { id: "payment-stats", label: "Ventas", icon: PieChart, group: "finanzas", minPlan: "basic" as PlanTier },
  { id: "refunds", label: "Reembolsos", icon: RotateCcw, group: "finanzas", minPlan: "basic" as PlanTier },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "marketing", minPlan: "professional" as PlanTier },
  { id: "coupons", label: "Cupones", icon: Tag, group: "marketing", minPlan: "professional" as PlanTier },
  { id: "chat", label: "Chat en Vivo", icon: MessagesSquare, group: "marketing", minPlan: "professional" as PlanTier },
  { id: "editor", label: "Editor Visual", icon: Layers, group: "configuración", minPlan: "basic" as PlanTier },
  { id: "settings", label: "Configuración", icon: Settings, group: "configuración", minPlan: "basic" as PlanTier },
  { id: "subscription", label: "Mi Plan", icon: CreditCard, group: "configuración", minPlan: "basic" as PlanTier },
];

const groups = [
  { id: "ventas", label: "Ventas" },
  { id: "finanzas", label: "Finanzas" },
  { id: "marketing", label: "Marketing" },
  { id: "configuración", label: "Configuración" },
];

const planOrder: Record<PlanTier, number> = { basic: 0, professional: 1, enterprise: 2 };

const DashboardSidebar = ({ 
  activeTab, 
  onTabChange, 
  primaryColor, 
  unreadCount = 0,
  planTier = "basic",
  isMobileOpen = false,
  onMobileClose
}: DashboardSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isTabLocked = (minPlan: PlanTier) => planOrder[planTier] < planOrder[minPlan];

  const handleTabClick = (tabId: string, minPlan: PlanTier) => {
    if (isTabLocked(minPlan)) {
      onTabChange("subscription");
    } else {
      onTabChange(tabId);
    }
    onMobileClose?.();
  };

  const sidebarContent = (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {groups.map((group) => {
          const groupTabs = tabs.filter(t => t.group === group.id);
          if (groupTabs.length === 0) return null;

          return (
            <div key={group.id}>
              {!isCollapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {groupTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const hasNotification = tab.id === "chat" && unreadCount > 0;
                  const locked = isTabLocked(tab.minPlan);
                  
                  const button = (
                    <motion.button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id, tab.minPlan)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                        isActive 
                          ? "text-white shadow-sm" 
                          : locked
                          ? "text-muted-foreground/50 cursor-pointer"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      style={{
                        backgroundColor: isActive ? primaryColor : undefined
                      }}
                      whileHover={{ x: isActive ? 0 : 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <tab.icon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-white" : locked ? "text-muted-foreground/40" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      
                      {!isCollapsed && (
                        <span className="truncate text-sm">
                          {tab.label}
                        </span>
                      )}

                      {!isCollapsed && locked && (
                        <Lock className="h-3 w-3 ml-auto text-muted-foreground/40 flex-shrink-0" />
                      )}
                      
                      {hasNotification && (
                        <Badge 
                          className={cn(
                            "h-5 min-w-[20px] flex items-center justify-center p-0 text-[10px] font-bold border-0",
                            isCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                          )}
                          style={{ backgroundColor: isActive ? "rgba(255,255,255,0.3)" : primaryColor, color: isActive ? "white" : "white" }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </motion.button>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={tab.id}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          {tab.label}
                          {locked && " 🔒"}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={tab.id}>{button}</div>;
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div 
          className="p-3 border-t border-border/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div 
            className="rounded-lg p-3 border"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}10, ${primaryColor}05)`,
              borderColor: `${primaryColor}20`
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-3.5 w-3.5" style={{ color: primaryColor }} />
              <p className="text-xs font-semibold">¿Necesitas más?</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Mejora tu plan para desbloquear todas las funciones.
            </p>
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-[calc(100vh-4rem)] sticky top-16 border-r border-border/50 bg-card/30 flex-shrink-0"
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

        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-background border-r border-border shadow-xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <span className="font-heading font-bold text-sm">Navegación</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMobileClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardSidebar;