import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ExternalLink, 
  LogOut, 
  HelpCircle,
  Bell,
  Crown,
  Building2,
  Zap,
  Menu
} from "lucide-react";
import { PlanTier } from "@/hooks/useStorePlanTier";

interface DashboardHeaderProps {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  onShowTutorial: () => void;
  onSignOut: () => void;
  unreadCount?: number;
  planTier?: PlanTier;
  onToggleMobileSidebar?: () => void;
}

const getPlanBadge = (tier: PlanTier) => {
  switch (tier) {
    case "enterprise":
      return { label: "Empresarial", icon: Building2, className: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400" };
    case "professional":
      return { label: "Profesional", icon: Crown, className: "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-500/40 text-violet-600 dark:text-violet-400" };
    default:
      return { label: "Básico", icon: Zap, className: "bg-muted/50 border-border text-muted-foreground" };
  }
};

const DashboardHeader = ({ 
  storeName, 
  storeSlug, 
  primaryColor, 
  onShowTutorial, 
  onSignOut,
  unreadCount = 0,
  planTier = "basic",
  onToggleMobileSidebar
}: DashboardHeaderProps) => {
  const planBadge = getPlanBadge(planTier);
  const PlanBadgeIcon = planBadge.icon;

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile menu + Logo & Store Name */}
          <div className="flex items-center gap-3">
            {onToggleMobileSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 rounded-xl"
                onClick={onToggleMobileSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.01 }}
            >
              <div className="relative">
                <div 
                  className="absolute inset-0 blur-lg rounded-xl opacity-40"
                  style={{ backgroundColor: primaryColor }}
                />
                <div 
                  className="relative h-9 w-9 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Store className="h-4.5 w-4.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading font-bold text-base leading-none">{storeName}</h1>
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 gap-1 ${planBadge.className}`}>
                    <PlanBadgeIcon className="h-3 w-3" />
                    {planBadge.label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Panel de Administración</p>
              </div>
            </motion.div>
          </div>

          {/* Center: Quick Status */}
          <div className="hidden xl:flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Tienda Activa
            </Badge>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={onShowTutorial}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl"
              >
                <Bell className="h-4 w-4" />
                <span 
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl hidden sm:flex"
              onClick={() => window.open(`/tienda/${storeSlug}`, "_blank")}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver tienda
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
              onClick={onSignOut}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;