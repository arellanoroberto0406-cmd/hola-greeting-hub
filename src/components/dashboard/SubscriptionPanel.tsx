import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Crown, Zap, Building2, Clock, AlertTriangle, CreditCard, Loader2, ExternalLink, Copy, ShieldAlert } from "lucide-react";
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
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscription, isActive, status, daysLeft, plan: currentPlan } = useSubscriptionStatus(storeId);
  const createSubscription = useCreateSubscription();
  const { 
    createSubscription: createPayPalSubscription, 
    cancelSubscription, 
    isProcessing, 
    error: paymentError,
    manualApprovalUrl,
    clearManualApprovalUrl,
  } = usePayPalPayment();
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Handle payment redirects
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      toast.success('¡Pago completado exitosamente! Tu plan ha sido activado.');
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    } else if (paymentStatus === 'cancelled') {
      toast.info('El pago fue cancelado. Puedes intentarlo de nuevo.');
      searchParams.delete('payment');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!subscription) {
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
      setSelectedPlan(plan);
      clearManualApprovalUrl();
      setShowUpgradeDialog(true);
    }
  };

  const handlePayWithPayPal = () => {
    if (!selectedPlan) return;
    clearManualApprovalUrl();
    createPayPalSubscription(storeId, selectedPlan.id, billingCycle);
  };

  const handleCancelSubscription = () => {
    cancelSubscription(storeId);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch {
      // Fallback for environments where clipboard API fails
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success('Enlace copiado al portapapeles');
      } catch {
        toast.error('No se pudo copiar. Copia el enlace manualmente.');
      }
      document.body.removeChild(textArea);
    }
  };

  const isAccountRestricted = paymentError?.includes('restringida') || paymentError?.includes('RESTRICTED');

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
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando planes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedPrice = billingCycle === 'yearly' && selectedPlan?.price_yearly 
    ? selectedPlan.price_yearly 
    : selectedPlan?.price_monthly;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
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
                    Renueva ahora para mantener acceso a todas las funciones de tu tienda.
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
                    Actualiza tu plan para seguir disfrutando de todas las funciones.
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
                    <span className="text-muted-foreground text-sm">USD/mes</span>
                  </div>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      o ${plan.price_yearly} USD/año 
                      <Badge variant="secondary" className="ml-1 text-xs">
                        -{Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%
                      </Badge>
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
                  {createSubscription.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
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
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información de Pago
          </CardTitle>
          <CardDescription>
            Pago único por período (mensual o anual) vía PayPal. Seguro y rápido.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 flex items-center gap-4">
            <div className="bg-[#0070ba] text-white p-3 rounded-lg flex-shrink-0">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium">PayPal</h4>
              <p className="text-sm text-muted-foreground">
                Paga con tu cuenta PayPal o tarjeta de crédito/débito. El pago se procesa de forma segura.
              </p>
            </div>
          </div>
          {subscription?.payment_reference && status === 'active' && (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Suscripción activa</p>
                <p className="text-xs text-muted-foreground">
                  Ref: {subscription.payment_reference.slice(0, 16)}...
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleCancelSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={(open) => {
        setShowUpgradeDialog(open);
        if (!open) clearManualApprovalUrl();
      }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Activar Plan {selectedPlan?.name}
            </DialogTitle>
            <DialogDescription>
              Selecciona el ciclo de facturación y procede al pago.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan seleccionado</span>
                <span className="font-bold">{selectedPlan?.name}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label className="font-medium">Ciclo de facturación</Label>
              <RadioGroup 
                value={billingCycle} 
                onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}
                className="grid grid-cols-2 gap-3"
              >
                <label 
                  htmlFor="monthly"
                  className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                    billingCycle === 'monthly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                >
                  <RadioGroupItem value="monthly" id="monthly" />
                  <div>
                    <p className="font-medium text-sm">Mensual</p>
                    <p className="text-xs text-muted-foreground">
                      ${selectedPlan?.price_monthly} USD/mes
                    </p>
                  </div>
                </label>
                {selectedPlan?.price_yearly && (
                  <label 
                    htmlFor="yearly"
                    className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${
                      billingCycle === 'yearly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value="yearly" id="yearly" />
                    <div>
                      <p className="font-medium text-sm">Anual</p>
                      <p className="text-xs text-muted-foreground">
                        ${selectedPlan.price_yearly} USD/año
                      </p>
                    </div>
                  </label>
                )}
              </RadioGroup>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-2xl font-bold">${selectedPrice} USD</span>
              </div>
              {billingCycle === 'yearly' && selectedPlan?.price_yearly && (
                <p className="text-xs text-green-600 mt-1 text-right">
                  Ahorras ${(selectedPlan.price_monthly * 12 - selectedPlan.price_yearly).toFixed(0)} USD al año
                </p>
              )}
            </div>
          </div>

          {/* PayPal Link Generated */}
          {manualApprovalUrl && (
            <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 space-y-3">
              <p className="text-sm font-medium text-green-800 text-center flex items-center justify-center gap-2">
                <Check className="h-4 w-4" />
                Enlace de pago listo
              </p>
              <Button asChild className="w-full bg-[#0070ba] hover:bg-[#005ea6]">
                <a href={manualApprovalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ir a PayPal para pagar
                </a>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleCopyLink(manualApprovalUrl)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copiar enlace de pago
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Al completar el pago en PayPal serás redirigido de vuelta automáticamente.
              </p>
            </div>
          )}

          {/* Account Restricted Error */}
          {isAccountRestricted && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Cuenta PayPal restringida</p>
                  <p className="text-xs text-red-700 mt-1">
                    La cuenta de PayPal asociada tiene restricciones. Para resolverlo:
                  </p>
                  <ol className="text-xs text-red-700 mt-1 list-decimal ml-4 space-y-1">
                    <li>Inicia sesión en <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">paypal.com</a></li>
                    <li>Ve al Centro de Resoluciones</li>
                    <li>Sigue los pasos para eliminar la restricción</li>
                    <li>Vuelve aquí e intenta de nuevo</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Generic Error */}
          {paymentError && !isAccountRestricted && !manualApprovalUrl && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-700">{paymentError}</p>
              <Button 
                variant="link" 
                className="text-xs p-0 h-auto text-red-600"
                onClick={handlePayWithPayPal}
              >
                Reintentar
              </Button>
            </div>
          )}
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancelar
            </Button>
            {!manualApprovalUrl && (
              <Button 
                onClick={handlePayWithPayPal}
                disabled={isProcessing}
                className="bg-[#0070ba] hover:bg-[#005ea6] text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando con PayPal...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pagar con PayPal
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPanel;
