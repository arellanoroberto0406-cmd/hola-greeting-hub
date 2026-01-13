import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  ExternalLink, 
  LogOut, 
  HelpCircle,
  Bell,
  Settings,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  onShowTutorial: () => void;
  onSignOut: () => void;
  unreadCount?: number;
}

const DashboardHeader = ({ 
  storeName, 
  storeSlug, 
  primaryColor, 
  onShowTutorial, 
  onSignOut,
  unreadCount = 0
}: DashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Left: Logo & Store Name */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative">
              <div 
                className="absolute inset-0 blur-lg rounded-xl opacity-40"
                style={{ backgroundColor: primaryColor }}
              />
              <div 
                className="relative h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <Store className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg leading-none">{storeName}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Panel de Administración</p>
            </div>
          </motion.div>

          {/* Center: Quick Status */}
          <div className="hidden lg:flex items-center gap-3">
            <Badge 
              variant="outline" 
              className="gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border-green-500/30 text-green-500"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Tienda Activa
            </Badge>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-xl"
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
              <ExternalLink className="h-4 w-4" />
              Ver tienda
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={onSignOut}
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
