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
import { Check, Crown, Zap, Building2, Clock, AlertTriangle, CreditCard, Loader2, ExternalLink, Copy, ShieldAlert, Upload, Landmark, CheckCircle2, Ticket, QrCode, ShieldCheck, Lock, BadgeCheck, RefreshCw, Headphones, FileCheck2, Eye } from "lucide-react";
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
  
  const queryClient = useQueryClient();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'transfer' | 'code'>('paypal');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [activationCode, setActivationCode] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bankAccounts } = useQuery({
    queryKey: ["platform-bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_bank_accounts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as BankAccount[];
    },
  });

  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0 && !selectedBankId) {
      setSelectedBankId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankId]);

  const selectedBank = bankAccounts?.find(b => b.id === selectedBankId) || bankAccounts?.[0];

  const handleRedeemCode = async () => {
    if (!activationCode.trim()) return toast.error("Ingresa un código");
    setRedeemingCode(true);
    try {
      const { data, error } = await supabase.rpc("redeem_subscription_code", {
        _code: activationCode.trim(),
        _store_id: storeId,
      });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.error || "Código inválido");
      toast.success(result.message || "¡Plan activado!");
      setActivationCode("");
      setShowUpgradeDialog(false);
      queryClient.invalidateQueries({ queryKey: ["store-subscription", storeId] });
    } catch (err: any) {
      toast.error(err.message || "Error al redimir código");
    } finally {
      setRedeemingCode(false);
    }
  };

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

      {/* Trust & Security Banner */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="bg-emerald-600 text-white p-2 rounded-lg flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2 flex-wrap">
                Pago 100% Seguro y Verificado
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  <Lock className="h-3 w-3 mr-1" />SSL 256-bit
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Tu información está protegida con cifrado de nivel bancario. Nunca almacenamos los datos de tu tarjeta.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-background/40 border">
              <BadgeCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">PayPal verificado</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-background/40 border">
              <Landmark className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">Banco oficial</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-background/40 border">
              <RefreshCw className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">Sin permanencia</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-md bg-white/60 dark:bg-background/40 border">
              <Headphones className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">Soporte real</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Métodos de Pago Disponibles</CardTitle>
          <CardDescription>Elige el método que prefieras. Todos son seguros y verificados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:border-[#0070ba]/40 transition-colors">
            <div className="bg-[#0070ba] text-white p-3 rounded-lg flex-shrink-0"><CreditCard className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm">PayPal</h4>
                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">
                  <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />Protección al comprador
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Activación automática. Cancela cuando quieras.</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 flex items-center gap-4 hover:border-emerald-600/40 transition-colors">
            <div className="bg-emerald-600 text-white p-3 rounded-lg flex-shrink-0"><Landmark className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-sm">Transferencia / SPEI / CoDi</h4>
                <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700">
                  <BadgeCheck className="h-2.5 w-2.5 mr-0.5" />Cuenta verificada
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Verificación manual del comprobante en menos de 24 h.</p>
            </div>
          </div>

          <div className="border rounded-lg p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
            <div className="bg-primary text-primary-foreground p-3 rounded-lg flex-shrink-0"><Ticket className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">Código de activación</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Activación inmediata si recibiste un código del administrador.</p>
            </div>
          </div>

          {/* How it works */}
          <div className="border rounded-lg p-4 bg-muted/30 mt-2">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              ¿Cómo funciona? Proceso transparente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-[11px]">1</span>
                <div><p className="font-medium">Eliges tu plan</p><p className="text-muted-foreground">Mensual o anual, sin permanencia.</p></div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-[11px]">2</span>
                <div><p className="font-medium">Pagas seguro</p><p className="text-muted-foreground">PayPal, transferencia o código.</p></div>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-[11px]">3</span>
                <div><p className="font-medium">Plan activado</p><p className="text-muted-foreground">Acceso completo al instante.</p></div>
              </div>
            </div>
          </div>

          {/* Guarantees row */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" />Cifrado SSL 256-bit</span>
            <span className="flex items-center gap-1.5"><FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />Comprobante por correo</span>
            <span className="flex items-center gap-1.5"><RefreshCw className="h-3.5 w-3.5 text-emerald-600" />Cancela cuando quieras</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />Datos protegidos</span>
          </div>

          {subscription?.payment_reference && status === 'active' && (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-muted/30 mt-2">
              <div>
                <p className="text-sm font-medium">Suscripción activa</p>
                <p className="text-xs text-muted-foreground">Método: {subscription.payment_method === 'transfer' ? 'Transferencia' : subscription.payment_method === 'activation_code' ? 'Código' : 'PayPal'}</p>
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
                <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="paypal" className="flex items-center gap-1 text-xs">
                      <CreditCard className="h-3.5 w-3.5" />PayPal
                    </TabsTrigger>
                    <TabsTrigger value="transfer" className="flex items-center gap-1 text-xs">
                      <Landmark className="h-3.5 w-3.5" />Transfer
                    </TabsTrigger>
                    <TabsTrigger value="code" className="flex items-center gap-1 text-xs">
                      <Ticket className="h-3.5 w-3.5" />Código
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
                            <p className="text-xs text-red-700 mt-1">Usa transferencia o un código de activación.</p>
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
                    {!bankAccounts?.length ? (
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        No hay cuentas bancarias configuradas. Contacta al administrador.
                      </div>
                    ) : (
                      <>
                        {bankAccounts.length > 1 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Elige el banco</Label>
                            <RadioGroup value={selectedBankId} onValueChange={setSelectedBankId} className="space-y-2">
                              {bankAccounts.map((b) => (
                                <label key={b.id} htmlFor={`bank-${b.id}`} className={`flex items-center gap-2 border rounded-lg p-2 cursor-pointer ${selectedBankId === b.id ? 'border-primary bg-primary/5' : ''}`}>
                                  <RadioGroupItem value={b.id} id={`bank-${b.id}`} />
                                  <Landmark className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{b.bank_name}</span>
                                  {b.qr_image_url && <Badge variant="secondary" className="text-xs ml-auto"><QrCode className="h-3 w-3 mr-1" />QR CoDi</Badge>}
                                </label>
                              ))}
                            </RadioGroup>
                          </div>
                        )}

                        {selectedBank && (
                          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              <Landmark className="h-4 w-4" />{selectedBank.bank_name}
                            </h4>
                            <CopyField label="Titular" value={selectedBank.account_holder} />
                            {selectedBank.clabe && <CopyField label="CLABE" value={selectedBank.clabe} />}
                            {selectedBank.account_number && <CopyField label="Cuenta" value={selectedBank.account_number} />}
                            {selectedBank.qr_image_url && (
                              <div className="bg-white rounded-md p-3 flex flex-col items-center gap-2 border">
                                <p className="text-xs text-muted-foreground flex items-center gap-1"><QrCode className="h-3 w-3" />Escanea desde tu app bancaria (CoDi)</p>
                                <img src={selectedBank.qr_image_url} alt="QR CoDi" className="max-w-[180px] rounded" />
                              </div>
                            )}
                            {selectedBank.notes && <p className="text-xs text-muted-foreground">{selectedBank.notes}</p>}
                            <p className="text-xs text-muted-foreground border-t pt-2">
                              Monto: <strong>${selectedPrice} MXN</strong>
                            </p>
                          </div>
                        )}
                      </>
                    )}

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

                  {/* Activation Code Tab */}
                  <TabsContent value="code" className="space-y-3 mt-3">
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <Ticket className="h-4 w-4" />Tengo un código de activación
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Si recibiste un código del administrador (por WhatsApp, pago en efectivo u otro método), ingrésalo aquí para activar tu plan al instante.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Código</Label>
                      <Input
                        value={activationCode}
                        onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
                        placeholder="PLAN-XXXXXXXX"
                        className="font-mono uppercase"
                      />
                    </div>
                    <Button
                      onClick={handleRedeemCode}
                      disabled={!activationCode.trim() || redeemingCode}
                      className="w-full"
                    >
                      {redeemingCode ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Validando...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Activar plan con código</>}
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
