import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Crown, Zap, Building2, Clock, AlertTriangle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  useSubscriptionPlans, 
  useCreateSubscription,
  useSubscriptionStatus,
  SubscriptionPlan 
} from "@/hooks/useSubscription";
import { usePayPalPayment } from "@/hooks/usePayPalPayment";

interface SubscriptionPanelProps {
  storeId: string;
  primaryColor?: string | null;
}

const PlanIcon = ({ slug }: { slug: string }) => {
  switch (slug) {
    case 'basico':
      return <Zap className="h-6 w-6" />;
    case 'profesional':
      return <Crown className="h-6 w-6" />;
    case 'empresarial':
      return <Building2 className="h-6 w-6" />;
    default:
      return <Zap className="h-6 w-6" />;
  }
};

const SubscriptionPanel = ({ storeId, primaryColor }: SubscriptionPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: plans, isLoading: plansLoading, error: plansError } = useSubscriptionPlans();
  const { subscription, isActive, status, daysLeft, plan: currentPlan } = useSubscriptionStatus(storeId);
  const createSubscription = useCreateSubscription();
  const { createSubscription: createPayPalSubscription, cancelSubscription, isProcessing, error: paymentError } = usePayPalPayment();
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Handle payment redirects
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('¡Pago completado exitosamente! Tu plan ha sido activado.');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    } else if (paymentStatus === 'cancelled') {
      toast.info('El pago fue cancelado');
      searchParams.delete('payment');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!subscription) {
      // Start trial with this plan
      createSubscription.mutate(
        { storeId, planId: plan.id },
        {
          onSuccess: () => {
            toast.success(`¡Prueba gratuita de 14 días activada con el plan ${plan.name}!`);
          },
          onError: (error) => {
            toast.error("Error al activar la prueba: " + error.message);
          },
        }
      );
    } else {
      // Show upgrade dialog
      setSelectedPlan(plan);
      setShowUpgradeDialog(true);
    }
  };

  const handlePayWithPayPal = () => {
    if (!selectedPlan) return;
    createPayPalSubscription(storeId, selectedPlan.id, billingCycle);
  };

  const handleCancelSubscription = () => {
    cancelSubscription(storeId);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'trial':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Prueba gratis - {daysLeft} días restantes
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-green-500 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Activo - {daysLeft} días restantes
          </Badge>
        );
      case 'pending_renewal':
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300">
            <Clock className="h-3 w-3" />
            Renovación pendiente
          </Badge>
        );
      case 'trial_expired':
      case 'expired':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expirado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">Sin suscripción</Badge>
        );
    }
  };

  if (plansLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Estado de Suscripción
              </CardTitle>
              <CardDescription>
                {currentPlan ? `Plan actual: ${currentPlan.name}` : "Selecciona un plan para comenzar"}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        {status === 'pending_renewal' && (
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tu suscripción está por vencer</p>
                  <p className="text-sm mt-1">
                    Tu suscripción expira pronto. Renueva ahora para mantener acceso a todas las funciones.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
        {!isActive && status !== 'none' && status !== 'pending_renewal' && (
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tu suscripción ha expirado</p>
                  <p className="text-sm mt-1">
                    Actualiza tu plan para seguir disfrutando de todas las funciones de tu tienda.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans?.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const features = Array.isArray(plan.features) ? plan.features : [];
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all ${
                isCurrentPlan ? 'ring-2 ring-primary' : 'hover:shadow-lg'
              } ${plan.slug === 'profesional' ? 'border-primary' : ''}`}
            >
              {plan.slug === 'profesional' && (
                <div 
                  className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg"
                  style={{ backgroundColor: primaryColor || '#3b82f6' }}
                >
                  Más popular
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg text-white"
                    style={{ backgroundColor: primaryColor || '#3b82f6' }}
                  >
                    <PlanIcon slug={plan.slug} />
                  </div>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price_monthly}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      o ${plan.price_yearly}/año (ahorra {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%)
                    </p>
                  )}
                </div>
                
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "default"}
                  disabled={isCurrentPlan || createSubscription.isPending}
                  onClick={() => handleSelectPlan(plan)}
                  style={!isCurrentPlan ? { backgroundColor: primaryColor || undefined } : {}}
                >
                  {isCurrentPlan 
                    ? "Plan actual" 
                    : !subscription 
                      ? "Iniciar prueba gratis" 
                      : "Seleccionar plan"
                  }
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Pago</CardTitle>
          <CardDescription>
            Cobro automático mensual/anual con PayPal. El dinero llega directo a tu cuenta PayPal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 flex items-center gap-4">
            <div className="bg-[#0070ba] text-white p-3 rounded-lg">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium">💳 PayPal - Cobro Recurrente</h4>
              <p className="text-sm text-muted-foreground">
                Se cobra automáticamente cada mes (o año). Los pagos se depositan directamente en tu cuenta PayPal.
                El cliente puede cancelar en cualquier momento.
              </p>
            </div>
          </div>
          {subscription?.paypal_subscription_id && status === 'active' && (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Suscripción activa con cobro automático</p>
                <p className="text-xs text-muted-foreground">
                  ID: {subscription.paypal_subscription_id}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar suscripción'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activar Plan {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Selecciona el ciclo de facturación y procede al pago con PayPal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span>Plan seleccionado:</span>
                <span className="font-bold">{selectedPlan?.name}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label>Ciclo de facturación</Label>
              <RadioGroup 
                value={billingCycle} 
                onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="cursor-pointer">
                    <div>
                      <p className="font-medium">Mensual</p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedPlan?.price_monthly}/mes
                      </p>
                    </div>
                  </Label>
                </div>
                {selectedPlan?.price_yearly && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yearly" id="yearly" />
                    <Label htmlFor="yearly" className="cursor-pointer">
                      <div>
                        <p className="font-medium">Anual</p>
                        <p className="text-sm text-muted-foreground">
                          ${selectedPlan.price_yearly}/año
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Ahorra {Math.round((1 - selectedPlan.price_yearly / (selectedPlan.price_monthly * 12)) * 100)}%
                          </Badge>
                        </p>
                      </div>
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-xl font-bold">
                  ${billingCycle === 'yearly' && selectedPlan?.price_yearly 
                    ? selectedPlan.price_yearly 
                    : selectedPlan?.price_monthly}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePayWithPayPal}
              disabled={isProcessing}
              className="bg-[#0070ba] hover:bg-[#005ea6] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirigiendo a PayPal...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar con PayPal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPanel;
