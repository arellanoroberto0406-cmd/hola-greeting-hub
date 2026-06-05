import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Crown, Zap, Building2, Clock, AlertTriangle, CreditCard, Loader2, ExternalLink, Copy, ShieldAlert, Upload, Landmark, CheckCircle2, Ticket, QrCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
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

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  clabe: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  notes: string | null;
}

const PlanIcon = ({ slug }: { slug: string }) => {
  switch (slug) {
    case 'basico': return <Zap className="h-6 w-6" />;
    case 'profesional': return <Crown className="h-6 w-6" />;
    case 'empresarial': return <Building2 className="h-6 w-6" />;
    default: return <Zap className="h-6 w-6" />;
  }
};

const CopyField = ({ label, value }: { label: string; value: string }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copiado`);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(`${label} copiado`);
    }
  };

  return (
    <div className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-medium">{value}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
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
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'transfer'>('paypal');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          onSuccess: () => toast.success(`¡Prueba gratuita de 14 días activada con el plan ${plan.name}!`),
          onError: (error) => toast.error("Error al activar la prueba: " + error.message),
        }
      );
    } else {
      setSelectedPlan(plan);
      clearManualApprovalUrl();
      setProofFile(null);
      setProofPreview(null);
      setTransferSuccess(false);
      setShowUpgradeDialog(true);
    }
  };

  const handlePayWithPayPal = () => {
    if (!selectedPlan) return;
    clearManualApprovalUrl();
    createPayPalSubscription(storeId, selectedPlan.id, billingCycle);
  };

  const handleCancelSubscription = () => cancelSubscription(storeId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se aceptan imágenes (JPG, PNG, WebP) o PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }
    if (file.size < 10 * 1024) {
      toast.error('El archivo es demasiado pequeño. Sube un comprobante real.');
      return;
    }
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setProofPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitTransfer = async () => {
    if (!selectedPlan || !proofFile) {
      toast.error('Sube el comprobante de pago');
      return;
    }

    setIsUploadingProof(true);
    try {
      const ext = proofFile.name.split('.').pop() || 'jpg';
      const path = `subscriptions/${storeId}/${Date.now()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(path, proofFile);

      if (uploadError) throw new Error('Error al subir comprobante: ' + uploadError.message);

      const { data: urlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(path);

      const price = billingCycle === 'yearly' && selectedPlan.price_yearly
        ? selectedPlan.price_yearly
        : selectedPlan.price_monthly;

      const { data, error: fnError } = await supabase.functions.invoke('activate-transfer-subscription', {
        body: {
          storeId,
          planId: selectedPlan.id,
          billingCycle,
          amount: price,
          proofUrl: urlData.publicUrl,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      setTransferSuccess(true);
      toast.success(data?.message || '¡Comprobante enviado! Será revisado pronto.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  const isAccountRestricted = paymentError?.includes('restringida') || paymentError?.includes('RESTRICTED');

  const getStatusBadge = () => {
    switch (status) {
      case 'trial':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" />Prueba - {daysLeft} días</Badge>;
      case 'active':
        return <Badge className="bg-green-500 flex items-center gap-1"><Check className="h-3 w-3" />Activo - {daysLeft} días</Badge>;
      case 'pending_renewal':
        return <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300"><Clock className="h-3 w-3" />Renovación pendiente</Badge>;
      case 'trial_expired':
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Expirado</Badge>;
      default:
        return <Badge variant="outline">Sin suscripción</Badge>;
    }
  };

  if (plansLoading) {
    return (
      <Card><CardContent className="p-6">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Cargando planes...</span>
        </div>
      </CardContent></Card>
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
              <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Estado de Suscripción</CardTitle>
              <CardDescription>{currentPlan ? `Plan actual: ${currentPlan.name}` : "Selecciona un plan para comenzar"}</CardDescription>
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
                  <p className="text-sm mt-1">Renueva ahora para mantener acceso a todas las funciones.</p>
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
                  <p className="text-sm mt-1">Actualiza tu plan para seguir disfrutando de todas las funciones.</p>
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
            <Card key={plan.id} className={`relative overflow-hidden transition-all ${isCurrentPlan ? 'ring-2 ring-primary' : 'hover:shadow-lg'} ${plan.slug === 'profesional' ? 'border-primary' : ''}`}>
              {plan.slug === 'profesional' && (
                <div className="absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg" style={{ backgroundColor: primaryColor || '#3b82f6' }}>Más popular</div>
              )}
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg text-white" style={{ backgroundColor: primaryColor || '#3b82f6' }}><PlanIcon slug={plan.slug} /></div>
                  <div><CardTitle>{plan.name}</CardTitle><CardDescription>{plan.description}</CardDescription></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price_monthly}</span>
                    <span className="text-muted-foreground text-sm">MXN/mes</span>
                  </div>
                  {plan.price_yearly && (
                    <p className="text-sm text-muted-foreground">
                      o ${plan.price_yearly} MXN/año
                      <Badge variant="secondary" className="ml-1 text-xs">-{Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}%</Badge>
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" /><span>{feature}</span></li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={isCurrentPlan ? "secondary" : "default"} disabled={isCurrentPlan || createSubscription.isPending} onClick={() => handleSelectPlan(plan)} style={!isCurrentPlan ? { backgroundColor: primaryColor || undefined } : {}}>
                  {createSubscription.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrentPlan ? "Plan actual" : !subscription ? "Iniciar prueba gratis" : "Seleccionar plan"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Métodos de Pago</CardTitle>
          <CardDescription>Paga con PayPal o transferencia bancaria.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-4 flex items-center gap-4">
            <div className="bg-[#0070ba] text-white p-3 rounded-lg flex-shrink-0"><CreditCard className="h-5 w-5" /></div>
            <div>
              <h4 className="font-medium text-sm">PayPal</h4>
              <p className="text-xs text-muted-foreground">Paga con tu cuenta PayPal o tarjeta</p>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4">
            <div className="bg-emerald-600 text-white p-3 rounded-lg flex-shrink-0"><Landmark className="h-5 w-5" /></div>
            <div>
              <h4 className="font-medium text-sm">Transferencia Bancaria</h4>
              <p className="text-xs text-muted-foreground">Transfiere y sube tu comprobante</p>
            </div>
          </div>
          {subscription?.payment_reference && status === 'active' && (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30">
              <div>
                <p className="text-sm font-medium">Suscripción activa</p>
                <p className="text-xs text-muted-foreground">Método: {subscription.payment_method === 'transfer' ? 'Transferencia' : 'PayPal'}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleCancelSubscription} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancelar'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={(open) => {
        setShowUpgradeDialog(open);
        if (!open) {
          clearManualApprovalUrl();
          setProofFile(null);
          setProofPreview(null);
          setTransferSuccess(false);
        }
      }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Activar Plan {selectedPlan?.name}</DialogTitle>
            <DialogDescription>Selecciona el ciclo y método de pago.</DialogDescription>
          </DialogHeader>

          {transferSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-700">Comprobante enviado</h3>
                <p className="text-sm text-muted-foreground mt-1">Tu comprobante está siendo verificado. Tu plan {selectedPlan?.name} se activará una vez aprobado.</p>
              </div>
              <Button onClick={() => setShowUpgradeDialog(false)} className="w-full">Cerrar</Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                {/* Plan & Billing */}
                <div className="bg-muted/50 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-bold">{selectedPlan?.name}</span>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-sm">Ciclo de facturación</Label>
                  <RadioGroup value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')} className="grid grid-cols-2 gap-3">
                    <label htmlFor="monthly" className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${billingCycle === 'monthly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <RadioGroupItem value="monthly" id="monthly" />
                      <div><p className="font-medium text-sm">Mensual</p><p className="text-xs text-muted-foreground">${selectedPlan?.price_monthly} MXN</p></div>
                    </label>
                    {selectedPlan?.price_yearly && (
                      <label htmlFor="yearly" className={`flex items-center gap-2 border rounded-lg p-3 cursor-pointer transition-colors ${billingCycle === 'yearly' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                        <RadioGroupItem value="yearly" id="yearly" />
                        <div><p className="font-medium text-sm">Anual</p><p className="text-xs text-muted-foreground">${selectedPlan.price_yearly} MXN</p></div>
                      </label>
                    )}
                  </RadioGroup>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex justify-between items-center">
                  <span className="font-medium text-sm">Total:</span>
                  <span className="text-xl font-bold">${selectedPrice} MXN</span>
                </div>

                {/* Payment Method Tabs */}
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'paypal' | 'transfer')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="paypal" className="flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />PayPal
                    </TabsTrigger>
                    <TabsTrigger value="transfer" className="flex items-center gap-1.5">
                      <Landmark className="h-4 w-4" />Transferencia
                    </TabsTrigger>
                  </TabsList>

                  {/* PayPal Tab */}
                  <TabsContent value="paypal" className="space-y-3 mt-3">
                    {manualApprovalUrl ? (
                      <div className="rounded-lg border-2 border-green-300 bg-green-50 p-4 space-y-3">
                        <p className="text-sm font-medium text-green-800 text-center flex items-center justify-center gap-2">
                          <Check className="h-4 w-4" />Enlace de pago listo
                        </p>
                        <Button asChild className="w-full bg-[#0070ba] hover:bg-[#005ea6]">
                          <a href={manualApprovalUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />Ir a PayPal para pagar
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => handleCopyLink(manualApprovalUrl)}>
                          <Copy className="mr-2 h-4 w-4" />Copiar enlace
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">Al completar el pago serás redirigido automáticamente.</p>
                      </div>
                    ) : (
                      <Button onClick={handlePayWithPayPal} disabled={isProcessing} className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white">
                        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Conectando...</> : <><CreditCard className="mr-2 h-4 w-4" />Pagar con PayPal</>}
                      </Button>
                    )}

                    {isAccountRestricted && (
                      <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                        <div className="flex items-start gap-2">
                          <ShieldAlert className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-800">Cuenta PayPal restringida</p>
                            <p className="text-xs text-red-700 mt-1">Resuelve la restricción en paypal.com e intenta de nuevo.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {paymentError && !isAccountRestricted && !manualApprovalUrl && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <p className="text-sm text-red-700">{paymentError}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Transfer Tab */}
                  <TabsContent value="transfer" className="space-y-4 mt-3">
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Landmark className="h-4 w-4" />Datos para transferencia
                      </h4>
                      <CopyField label="Banco" value={BANK_INFO.banco} />
                      <CopyField label="Titular" value={BANK_INFO.titular} />
                      <CopyField label="CLABE" value={BANK_INFO.clabe} />
                      <p className="text-xs text-muted-foreground">
                        Monto a transferir: <strong>${selectedPrice} MXN</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium text-sm">Comprobante de pago</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {proofPreview ? (
                        <div className="relative border rounded-lg overflow-hidden">
                          <img src={proofPreview} alt="Comprobante" className="w-full max-h-48 object-contain bg-muted/20" />
                          <Button variant="secondary" size="sm" className="absolute top-2 right-2" onClick={() => { setProofFile(null); setProofPreview(null); }}>
                            Cambiar
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="w-full h-24 border-dashed flex flex-col gap-1" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-6 w-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Subir comprobante</span>
                          <span className="text-xs text-muted-foreground">Imagen o PDF (máx 5MB)</span>
                        </Button>
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitTransfer}
                      disabled={!proofFile || isUploadingProof}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      {isUploadingProof ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
                      ) : (
                        <><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar pago por transferencia</>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="w-full sm:w-auto">Cancelar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPanel;
