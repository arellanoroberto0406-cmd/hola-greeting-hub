import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Lock, BadgeCheck, RotateCcw, AlertTriangle,
  MessageCircle, Mail, Phone, CheckCircle2, FileText, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store } from "@/types/store";

interface CheckoutSecurityPanelProps {
  store: Store;
  primaryColor: string;
}

/**
 * Highly-visible security & trust panel shown on the checkout page.
 * - Verified seller card (real store info)
 * - Payment security guarantees
 * - Anti-scam warning: "never ask for data outside this page"
 * - Privacy & returns policy dialog
 */
const CheckoutSecurityPanel = ({ store, primaryColor }: CheckoutSecurityPanelProps) => {
  const [policiesOpen, setPoliciesOpen] = useState(false);

  const yearsActive = useMemo(() => {
    const created = (store as any).created_at ? new Date((store as any).created_at) : null;
    if (!created) return null;
    const months = Math.max(1, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    if (months < 12) return `${months} ${months === 1 ? "mes" : "meses"} activa`;
    const years = Math.floor(months / 12);
    return `${years}+ ${years === 1 ? "año" : "años"} activa`;
  }, [store]);

  return (
    <div className="space-y-4">
      {/* Verified seller card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border-2 overflow-hidden"
        style={{
          borderColor: `${primaryColor}40`,
          background: `linear-gradient(135deg, ${primaryColor}10, transparent 60%)`,
        }}
      >
        <div className="p-4 md:p-5 flex items-start gap-4">
          <div className="relative shrink-0">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.name}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-lg"
              />
            ) : (
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                {store.name?.[0]?.toUpperCase() || "T"}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-2 ring-background"
              style={{ backgroundColor: primaryColor }}
              title="Vendedor verificado"
            >
              <BadgeCheck className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base truncate">{store.name}</h3>
              <Badge
                className="text-[10px] px-2 py-0 h-5 gap-1"
                style={{ backgroundColor: primaryColor, color: "white" }}
              >
                <BadgeCheck className="w-3 h-3" /> Verificada
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Estás comprando directamente al vendedor oficial.
            </p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-muted-foreground">
              {yearsActive && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" style={{ color: primaryColor }} />
                  {yearsActive}
                </span>
              )}
              {store.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" style={{ color: primaryColor }} />
                  Contacto real
                </span>
              )}
              {store.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" style={{ color: primaryColor }} />
                  Atención directa
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security guarantees grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { icon: Lock, title: "Pago cifrado", sub: "SSL 256-bit" },
          { icon: ShieldCheck, title: "Compra protegida", sub: "Reembolso garantizado" },
          { icon: BadgeCheck, title: "Pagos verificados", sub: "PayPal + transferencia" },
          { icon: RotateCcw, title: "30 días", sub: "Para devoluciones" },
        ].map(({ icon: Icon, title, sub }, i) => (
          <div
            key={i}
            className="rounded-xl border p-3 bg-card/60 backdrop-blur-sm flex items-start gap-2"
            style={{ borderColor: `${primaryColor}25` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${primaryColor}18`, color: primaryColor }}
            >
              <Icon className="w-4 h-4" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold leading-tight">{title}</p>
              <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Anti-scam warning */}
      <div
        className="rounded-xl p-3 md:p-4 border-2 flex items-start gap-3"
        style={{
          borderColor: "hsl(38 92% 50% / 0.4)",
          background: "hsl(38 92% 50% / 0.08)",
        }}
      >
        <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "hsl(38 92% 45%)" }} />
        <div className="text-xs md:text-[13px] leading-relaxed">
          <p className="font-bold mb-0.5">Cuida tu compra</p>
          <p className="text-muted-foreground">
            Nunca te pediremos tu contraseña, código de tarjeta ni datos bancarios
            por WhatsApp, llamada o email. Realiza el pago <strong>solo desde esta página</strong>.
          </p>
        </div>
      </div>

      {/* Payment logos + policies */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Lock className="w-3.5 h-3.5" style={{ color: primaryColor }} />
          <span>Procesado con pasarelas oficiales</span>
        </div>

        <Dialog open={policiesOpen} onOpenChange={setPoliciesOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] gap-1"
              style={{ color: primaryColor }}
            >
              <Eye className="w-3.5 h-3.5" />
              Privacidad y devoluciones
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                Políticas de {store.name}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-5 text-sm">
                <section>
                  <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" style={{ color: primaryColor }} />
                    Privacidad de tus datos
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Los datos que ingresas (nombre, dirección, contacto) se usan
                    exclusivamente para procesar y enviar tu pedido. No
                    almacenamos datos completos de tarjetas: los pagos se
                    procesan mediante pasarelas certificadas (PayPal, MercadoPago).
                    Nunca compartimos tu información con terceros con fines
                    comerciales.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" style={{ color: primaryColor }} />
                    Devoluciones y reembolsos
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground list-disc pl-5">
                    <li>Cuentas con <strong>30 días</strong> desde la entrega para solicitar cambio o devolución.</li>
                    <li>El producto debe estar en su estado original, sin uso y con empaque.</li>
                    <li>Si el producto llega dañado o incorrecto, cubrimos el reenvío.</li>
                    <li>El reembolso se procesa a través del mismo método de pago utilizado.</li>
                  </ul>
                </section>

                <section>
                  <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" style={{ color: primaryColor }} />
                    Seguridad del pago
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Toda la información viaja cifrada con SSL de 256 bits. Los
                    pagos con tarjeta son procesados por proveedores certificados
                    PCI-DSS. Las transferencias bancarias son validadas
                    manualmente por el equipo de la tienda antes de activar tu
                    pedido.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-base mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
                    Contacto y soporte
                  </h4>
                  <div className="text-muted-foreground space-y-1">
                    {store.email && <p>Email: <strong className="text-foreground">{store.email}</strong></p>}
                    {store.phone && <p>Teléfono / WhatsApp: <strong className="text-foreground">{store.phone}</strong></p>}
                    <p>Horario de atención: Lun a Vie 9:00 – 19:00</p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CheckoutSecurityPanel;
