import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, Crown, Zap, Building2, Clock, AlertTriangle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { 
  useSubscriptionPlans, 
  useStoreSubscription, 
  useCreateSubscription,
  useUpdateSubscription,
  useSubscriptionStatus,
  SubscriptionPlan 
} from "@/hooks/useSubscription";

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
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { subscription, isActive, status, daysLeft, plan: currentPlan } = useSubscriptionStatus(storeId);
  const createSubscription = useCreateSubscription();
  const updateSubscription = useUpdateSubscription();
  
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

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

  const handleSubmitPayment = () => {
    if (!selectedPlan || !subscription || !paymentMethod) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    updateSubscription.mutate(
      {
        subscriptionId: subscription.id,
        updates: {
          plan_id: selectedPlan.id,
          status: 'active',
          payment_method: paymentMethod,
          payment_reference: paymentReference || paymentNotes,
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_payment_date: new Date().toISOString(),
          next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success(`¡Plan ${selectedPlan.name} activado exitosamente!`);
          setShowUpgradeDialog(false);
          setSelectedPlan(null);
          setPaymentMethod("");
          setPaymentReference("");
          setPaymentNotes("");
        },
        onError: (error) => {
          toast.error("Error al actualizar suscripción: " + error.message);
        },
      }
    );
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
            Activo
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
        {!isActive && status !== 'none' && (
          <CardContent>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
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
            Métodos disponibles para activar tu suscripción
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">🏦 Transferencia Bancaria</h4>
              <p className="text-sm text-muted-foreground">
                Realiza una transferencia y envía el comprobante junto con tu referencia de pago.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">💳 PayPal</h4>
              <p className="text-sm text-muted-foreground">
                Envía el pago a nuestra cuenta de PayPal y proporciona el ID de transacción.
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">📱 Otro método</h4>
              <p className="text-sm text-muted-foreground">
                Contáctanos para acordar otros métodos de pago disponibles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activar Plan {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Completa la información de pago para activar tu suscripción.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span>Plan seleccionado:</span>
                <span className="font-bold">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>Precio mensual:</span>
                <span className="font-bold">${selectedPlan?.price_monthly}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Método de pago *</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-reference">
                Referencia de pago / ID de transacción
              </Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ej: TXN-123456789"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notas adicionales</Label>
              <Textarea
                id="payment-notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Información adicional sobre el pago..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitPayment}
              disabled={!paymentMethod || updateSubscription.isPending}
              style={{ backgroundColor: primaryColor || undefined }}
            >
              {updateSubscription.isPending ? "Procesando..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPanel;
