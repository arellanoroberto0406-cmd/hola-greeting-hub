import { useState, useEffect } from "react";
import { X, Clock, AlertTriangle, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { motion, AnimatePresence } from "framer-motion";

interface SubscriptionExpiryBannerProps {
  storeId: string;
  onUpgrade: () => void;
  primaryColor?: string | null;
}

const SubscriptionExpiryBanner = ({ 
  storeId, 
  onUpgrade, 
  primaryColor 
}: SubscriptionExpiryBannerProps) => {
  const { status, daysLeft, isActive, plan } = useSubscriptionStatus(storeId);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissKey, setDismissKey] = useState("");

  // Check if banner was dismissed today
  useEffect(() => {
    const today = new Date().toDateString();
    const key = `subscription_banner_dismissed_${storeId}_${today}`;
    setDismissKey(key);
    
    const dismissed = localStorage.getItem(key);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [storeId]);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (dismissKey) {
      localStorage.setItem(dismissKey, "true");
    }
  };

  // Determine if we should show the banner
  const shouldShow = () => {
    if (isDismissed) return false;
    
    // Show for trial expiring soon (3 days or less)
    if (status === 'trial' && daysLeft !== null && daysLeft <= 3) {
      return true;
    }
    
    // Show for pending renewal
    if (status === 'pending_renewal') {
      return true;
    }
    
    // Show for expired subscriptions
    if (status === 'expired' || status === 'trial_expired') {
      return true;
    }
    
    // Show when subscription is about to expire (7 days or less)
    if (status === 'active' && daysLeft !== null && daysLeft <= 7) {
      return true;
    }
    
    return false;
  };

  const getBannerContent = () => {
    if (status === 'expired' || status === 'trial_expired') {
      return {
        icon: AlertTriangle,
        title: "¡Tu suscripción ha expirado!",
        message: "Tu tienda tiene funcionalidades limitadas. Renueva ahora para restaurar todas las funciones.",
        buttonText: "Renovar ahora",
        variant: "destructive" as const,
        bgClass: "from-red-500/95 to-red-600/95",
        urgent: true,
      };
    }
    
    if (status === 'pending_renewal') {
      return {
        icon: Clock,
        title: "Renovación pendiente",
        message: "Tu suscripción está por vencer. Renueva para mantener acceso a todas las funciones.",
        buttonText: "Renovar plan",
        variant: "warning" as const,
        bgClass: "from-amber-500/95 to-orange-500/95",
        urgent: true,
      };
    }
    
    if (status === 'trial') {
      if (daysLeft === 0) {
        return {
          icon: AlertTriangle,
          title: "¡Tu prueba termina hoy!",
          message: "Activa tu plan ahora para no perder acceso a tu tienda.",
          buttonText: "Activar plan",
          variant: "destructive" as const,
          bgClass: "from-red-500/95 to-red-600/95",
          urgent: true,
        };
      }
      if (daysLeft === 1) {
        return {
          icon: Clock,
          title: "¡Tu prueba termina mañana!",
          message: "No pierdas tus configuraciones. Elige un plan para continuar.",
          buttonText: "Elegir plan",
          variant: "warning" as const,
          bgClass: "from-amber-500/95 to-orange-500/95",
          urgent: true,
        };
      }
      return {
        icon: Zap,
        title: `Tu prueba termina en ${daysLeft} días`,
        message: "Aprovecha todas las funciones premium eligiendo un plan ahora.",
        buttonText: "Ver planes",
        variant: "info" as const,
        bgClass: "from-blue-500/95 to-indigo-500/95",
        urgent: false,
      };
    }
    
    // Active subscription expiring soon
    if (daysLeft !== null && daysLeft <= 3) {
      return {
        icon: Clock,
        title: `Tu suscripción vence en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`,
        message: "Renueva ahora para mantener acceso sin interrupciones.",
        buttonText: "Renovar",
        variant: "warning" as const,
        bgClass: "from-amber-500/95 to-orange-500/95",
        urgent: true,
      };
    }
    
    return {
      icon: Crown,
      title: `Tu plan ${plan?.name || ''} vence en ${daysLeft} días`,
      message: "Configura la renovación automática para no perder tus beneficios.",
      buttonText: "Gestionar plan",
      variant: "info" as const,
      bgClass: "from-primary/95 to-primary/80",
      urgent: false,
    };
  };

  if (!shouldShow()) return null;

  const content = getBannerContent();
  const Icon = content.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-2xl"
      >
        <div 
          className={`relative overflow-hidden rounded-xl shadow-2xl bg-gradient-to-r ${content.bgClass} backdrop-blur-xl border border-white/20`}
        >
          {/* Animated background effect for urgent banners */}
          {content.urgent && (
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          <div className="relative px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={content.urgent ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="p-2 rounded-lg bg-white/20 backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  {content.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                  {content.message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={onUpgrade}
                  className="bg-white text-gray-900 hover:bg-white/90 font-medium shadow-lg"
                >
                  {content.buttonText}
                </Button>
                
                {/* Dismiss button - only for non-urgent banners */}
                {!content.urgent && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress bar for trial */}
          {status === 'trial' && daysLeft !== null && (
            <div className="h-1 bg-white/20">
              <motion.div 
                className="h-full bg-white/60"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, ((14 - daysLeft) / 14) * 100)}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionExpiryBanner;
