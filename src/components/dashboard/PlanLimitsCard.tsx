import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  ShoppingCart, 
  Tag, 
  BarChart3, 
  Palette, 
  Globe, 
  Crown,
  Lock,
  ArrowUpRight,
  Zap,
  Building2,
  AlertTriangle
} from "lucide-react";
import { useStorePlanTier, PlanTier } from "@/hooks/useStorePlanTier";
import { useSubscriptionStatus } from "@/hooks/useSubscription";
import { motion } from "framer-motion";

interface PlanLimitsCardProps {
  storeId: string;
  productCount: number;
  orderCount: number;
  onUpgrade: () => void;
  primaryColor?: string | null;
}

interface PlanLimits {
  maxProducts: number;
  maxOrders: number;
  canUseCoupons: boolean;
  canUseAnalytics: boolean;
  canCustomizeTheme: boolean;
  canUseCustomDomain: boolean;
}

const getPlanLimits = (tier: PlanTier): PlanLimits => {
  switch (tier) {
    case "enterprise":
      return {
        maxProducts: -1, // unlimited
        maxOrders: -1,
        canUseCoupons: true,
        canUseAnalytics: true,
        canCustomizeTheme: true,
        canUseCustomDomain: true,
      };
    case "professional":
      return {
        maxProducts: 100,
        maxOrders: 500,
        canUseCoupons: true,
        canUseAnalytics: true,
        canCustomizeTheme: true,
        canUseCustomDomain: false,
      };
    default: // basic
      return {
        maxProducts: 15,
        maxOrders: 100,
        canUseCoupons: false,
        canUseAnalytics: false,
        canCustomizeTheme: false,
        canUseCustomDomain: false,
      };
  }
};

const getPlanName = (tier: PlanTier): string => {
  switch (tier) {
    case "enterprise": return "Empresarial";
    case "professional": return "Profesional";
    default: return "Básico";
  }
};

const getPlanIcon = (tier: PlanTier) => {
  switch (tier) {
    case "enterprise": return Building2;
    case "professional": return Crown;
    default: return Zap;
  }
};

const PlanLimitsCard = ({ 
  storeId, 
  productCount, 
  orderCount, 
  onUpgrade,
  primaryColor 
}: PlanLimitsCardProps) => {
  const { planTier, isActive, plan } = useStorePlanTier(storeId);
  const { daysLeft, status } = useSubscriptionStatus(storeId);
  const limits = getPlanLimits(planTier);
  const PlanIcon = getPlanIcon(planTier);

  const productPercentage = limits.maxProducts === -1 
    ? 0 
    : Math.min((productCount / limits.maxProducts) * 100, 100);
  
  const orderPercentage = limits.maxOrders === -1 
    ? 0 
    : Math.min((orderCount / limits.maxOrders) * 100, 100);

  const isNearProductLimit = productPercentage >= 80;
  const isNearOrderLimit = orderPercentage >= 80;
  const isAtProductLimit = productPercentage >= 100;
  const isAtOrderLimit = orderPercentage >= 100;

  const features = [
    {
      name: "Cupones de descuento",
      icon: Tag,
      enabled: limits.canUseCoupons,
      upgradeText: "Disponible en Profesional",
    },
    {
      name: "Analíticas",
      icon: BarChart3,
      enabled: limits.canUseAnalytics,
      upgradeText: "Disponible en Profesional",
    },
    {
      name: "Personalización de tema",
      icon: Palette,
      enabled: limits.canCustomizeTheme,
      upgradeText: "Disponible en Profesional",
    },
    {
      name: "Dominio personalizado",
      icon: Globe,
      enabled: limits.canUseCustomDomain,
      upgradeText: "Disponible en Empresarial",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        {/* Gradient background decoration */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg text-white"
                style={{ backgroundColor: primaryColor || '#3b82f6' }}
              >
                <PlanIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Plan {getPlanName(planTier)}
                  {status === 'trial' && (
                    <Badge variant="secondary" className="text-xs">
                      Prueba - {daysLeft} días
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Límites y funcionalidades de tu plan
                </CardDescription>
              </div>
            </div>
            {planTier !== "enterprise" && (
              <Button 
                onClick={onUpgrade}
                size="sm"
                className="gap-1"
                style={{ backgroundColor: primaryColor || undefined }}
              >
                <ArrowUpRight className="h-4 w-4" />
                Mejorar plan
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Usage Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Uso actual
            </h4>
            
            {/* Products */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>Productos</span>
                  {isAtProductLimit && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Límite alcanzado
                    </Badge>
                  )}
                  {isNearProductLimit && !isAtProductLimit && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Cerca del límite
                    </Badge>
                  )}
                </div>
                <span className="font-medium">
                  {productCount} / {limits.maxProducts === -1 ? "∞" : limits.maxProducts}
                </span>
              </div>
              {limits.maxProducts !== -1 && (
                <Progress 
                  value={productPercentage} 
                  className={`h-2 ${isNearProductLimit ? '[&>div]:bg-amber-500' : ''} ${isAtProductLimit ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>

            {/* Orders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span>Pedidos este mes</span>
                  {isAtOrderLimit && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Límite alcanzado
                    </Badge>
                  )}
                  {isNearOrderLimit && !isAtOrderLimit && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                      Cerca del límite
                    </Badge>
                  )}
                </div>
                <span className="font-medium">
                  {orderCount} / {limits.maxOrders === -1 ? "∞" : limits.maxOrders}
                </span>
              </div>
              {limits.maxOrders !== -1 && (
                <Progress 
                  value={orderPercentage} 
                  className={`h-2 ${isNearOrderLimit ? '[&>div]:bg-amber-500' : ''} ${isAtOrderLimit ? '[&>div]:bg-destructive' : ''}`}
                />
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Funcionalidades
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={feature.name}
                    className={`flex items-center gap-2 p-3 rounded-lg border ${
                      feature.enabled 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-muted/50 border-border'
                    }`}
                  >
                    {feature.enabled ? (
                      <Icon 
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: primaryColor || '#3b82f6' }}
                      />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${!feature.enabled && 'text-muted-foreground'}`}>
                        {feature.name}
                      </p>
                      {!feature.enabled && (
                        <p className="text-xs text-muted-foreground truncate">
                          {feature.upgradeText}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upgrade CTA for basic plan */}
          {planTier === "basic" && (
            <div 
              className="p-4 rounded-lg border-2 border-dashed"
              style={{ borderColor: primaryColor || '#3b82f6' }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg text-white flex-shrink-0"
                  style={{ backgroundColor: primaryColor || '#3b82f6' }}
                >
                  <Crown className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium">¿Necesitas más capacidad?</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    Actualiza a Profesional para obtener hasta 100 productos, 500 pedidos/mes, 
                    cupones de descuento y analíticas avanzadas.
                  </p>
                  <Button 
                    onClick={onUpgrade}
                    size="sm"
                    className="mt-3"
                    style={{ backgroundColor: primaryColor || undefined }}
                  >
                    Ver planes disponibles
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Upgrade CTA for professional plan */}
          {planTier === "professional" && (
            <div 
              className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white flex-shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium">Escala sin límites</h5>
                  <p className="text-sm text-muted-foreground mt-1">
                    Con el plan Empresarial obtienes productos y pedidos ilimitados, 
                    dominio personalizado y soporte 24/7.
                  </p>
                  <Button 
                    onClick={onUpgrade}
                    size="sm"
                    className="mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    Actualizar a Empresarial
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlanLimitsCard;
