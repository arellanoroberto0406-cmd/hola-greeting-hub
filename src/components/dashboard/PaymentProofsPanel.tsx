import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, Eye, Loader2, FileCheck, ExternalLink, Copy, KeyRound, MessageCircle, PartyPopper } from "lucide-react";
import { PLATFORM_BRAND } from "@/config/platform";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BankAccountsAdminPanel from "./BankAccountsAdminPanel";
import ActivationCodesAdminPanel from "./ActivationCodesAdminPanel";

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {}
};

const PaymentProofsPanel = () => {
  const queryClient = useQueryClient();
  const [selectedProof, setSelectedProof] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ code: string; storeName: string; planName: string; storeId: string } | null>(null);
  const mountedAtRef = useRef<number>(Date.now());

  const { data: proofs, isLoading } = useQuery({
    queryKey: ["admin-payment-proofs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_payment_proofs")
        .select("*, stores(name, slug), subscription_plans:plan_id(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-payment-proofs-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "subscription_payment_proofs" },
        (payload) => {
          const createdAt = new Date((payload.new as any).created_at).getTime();
          if (createdAt < mountedAtRef.current - 5000) return;
          playBeep();
          toast.info("🔔 Nuevo comprobante de pago recibido", {
            description: "Revísalo para activar el plan del cliente.",
            duration: 8000,
          });
          queryClient.invalidateQueries({ queryKey: ["admin-payment-proofs"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "subscription_payment_proofs" },
        () => queryClient.invalidateQueries({ queryKey: ["admin-payment-proofs"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const handleReview = async (decision: "approved" | "rejected") => {
    if (!selectedProof) return;
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "activate-transfer-subscription?action=review",
        {
          body: {
            proofId: selectedProof.id,
            decision,
            notes: reviewNotes || undefined,
          },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (decision === "approved") {
        toast.success("✅ Plan activado y código generado");
        if (data?.activationCode) {
          setReceipt({
            code: data.activationCode,
            storeName: selectedProof.stores?.name || "Tienda",
            storeId: selectedProof.store_id,
            planName: selectedProof.subscription_plans?.name || "Plan",
          });
        }
      } else {
        toast.success("Comprobante rechazado");
      }
      setSelectedProof(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ["admin-payment-proofs"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar");
    } finally {
      setIsProcessing(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingCount = proofs?.filter((p: any) => p.status === "pending").length || 0;

  if (isLoading) {
    return (
      <Card><CardContent className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Comprobantes de Pago
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pendiente{pendingCount > 1 ? "s" : ""}</Badge>
            )}
          </CardTitle>
          <CardDescription>Revisa y aprueba los comprobantes de transferencia para activar planes.</CardDescription>
        </CardHeader>
        <CardContent>
          {!proofs?.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">No hay comprobantes registrados.</p>
          ) : (
            <div className="space-y-3">
              {proofs.map((proof: any) => (
                <div key={proof.id} className={`border rounded-lg p-4 flex items-center justify-between gap-4 ${proof.status === "pending" ? "border-amber-300 bg-amber-50/50" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{proof.stores?.name || "Tienda"}</span>
                      {statusBadge(proof.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Plan: {(proof as any).subscription_plans?.name || "—"} · 
                      ${proof.amount} MXN · 
                      {proof.billing_cycle === "yearly" ? "Anual" : "Mensual"} · 
                      {new Date(proof.created_at).toLocaleDateString("es-MX")}
                    </p>
                    {proof.notes && <p className="text-xs text-muted-foreground mt-1 italic">Nota: {proof.notes}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setPreviewUrl(proof.proof_url)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {proof.status === "pending" && (
                      <Button size="sm" onClick={() => { setSelectedProof(proof); setReviewNotes(""); }}>
                        Revisar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Comprobante de pago</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="space-y-3">
              {previewUrl.endsWith(".pdf") ? (
                <div className="text-center py-8">
                  <Button asChild><a href={previewUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Abrir PDF</a></Button>
                </div>
              ) : (
                <img src={previewUrl} alt="Comprobante" className="w-full rounded-lg max-h-[60vh] object-contain" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={!!selectedProof} onOpenChange={(open) => { if (!open) setSelectedProof(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revisar comprobante</DialogTitle>
            <DialogDescription>
              Tienda: {selectedProof?.stores?.name} · Plan: {selectedProof?.subscription_plans?.name} · ${selectedProof?.amount} MXN
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProof?.proof_url && (
              <div className="border rounded-lg overflow-hidden">
                {selectedProof.proof_url.endsWith(".pdf") ? (
                  <div className="text-center py-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedProof.proof_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Ver PDF</a>
                    </Button>
                  </div>
                ) : (
                  <img src={selectedProof.proof_url} alt="Comprobante" className="w-full max-h-48 object-contain bg-muted/20" />
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                placeholder="Agregar nota sobre la revisión..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="destructive" onClick={() => handleReview("rejected")} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Rechazar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleReview("approved")} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Aprobar y activar plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt dialog with auto-generated activation code */}
      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-emerald-600" />
              Plan activado · Código generado
            </DialogTitle>
            <DialogDescription>
              Comparte este código con el cliente como comprobante de su activación.
            </DialogDescription>
          </DialogHeader>

          {receipt && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-center space-y-2">
                <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold flex items-center justify-center gap-1">
                  <KeyRound className="h-3.5 w-3.5" />Código de activación
                </p>
                <p className="text-2xl font-mono font-bold tracking-wider text-emerald-900 select-all">
                  {receipt.code}
                </p>
                <p className="text-xs text-emerald-700">
                  {receipt.storeName} · {receipt.planName}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(receipt.code);
                    toast.success("Código copiado");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />Copiar código
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => {
                    const msg = [
                      `¡Pago confirmado! ✅`,
                      ``,
                      `Tu plan *${receipt.planName}* ha sido activado en ${PLATFORM_BRAND}.`,
                      ``,
                      `🔐 Código de comprobante: *${receipt.code}*`,
                      `(Guárdalo como referencia de tu activación)`,
                      ``,
                      `Gracias por tu compra 🙌`,
                    ].join('\n');
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />Enviar por WhatsApp
                </Button>
              </div>

              <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
                <p>✔️ El plan ya está <strong>activo</strong> en la tienda del cliente — no necesita hacer nada más.</p>
                <p>✔️ El código queda registrado en la base de datos como comprobante único.</p>
                <p>✔️ Este código <strong>no es reutilizable</strong>; solo sirve de referencia.</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setReceipt(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BankAccountsAdminPanel />
      <ActivationCodesAdminPanel />
    </div>
  );
};

export default PaymentProofsPanel;
