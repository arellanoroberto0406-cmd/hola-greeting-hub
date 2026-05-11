import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, HelpCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FAQPoliciesPanelProps {
  storeId: string;
  primaryColor: string;
  initial: {
    faq_returns?: string | null;
    faq_shipping?: string | null;
    faq_refunds?: string | null;
    faq_payments?: string | null;
    faq_support?: string | null;
  };
}

const DEFAULTS = {
  faq_returns:
    "Tienes hasta 30 días desde la recepción para solicitar la devolución. El producto debe estar en buen estado y con su empaque original. Una vez recibido y revisado, procesamos el reembolso completo.",
  faq_shipping:
    "Los envíos estándar tardan entre 3 y 7 días hábiles según tu ubicación. Recibirás un número de seguimiento por correo y WhatsApp para rastrear tu pedido en tiempo real.",
  faq_refunds:
    "Una vez aprobada la devolución, el reembolso se procesa en 3-5 días hábiles por el mismo método de pago que usaste. Si pagaste por transferencia, te pediremos los datos bancarios para devolver el importe.",
  faq_payments:
    "Aceptamos PayPal y transferencia bancaria. Todos los pagos viajan cifrados con SSL de 256 bits y nunca almacenamos datos de tu tarjeta. Las transferencias se validan manualmente para mayor seguridad.",
  faq_support:
    "Puedes escribirnos por WhatsApp o usar el chat en vivo de la tienda. Respondemos rápido en horario laboral y siempre te asignamos a una persona real, no a un bot automatizado.",
};

const FIELDS: Array<{ key: keyof typeof DEFAULTS; label: string; question: string }> = [
  { key: "faq_returns", label: "Devoluciones", question: "¿Puedo devolver un producto si no me convence?" },
  { key: "faq_shipping", label: "Tiempos de envío", question: "¿Cuánto tarda en llegar mi pedido?" },
  { key: "faq_refunds", label: "Reembolsos", question: "¿Cómo funcionan los reembolsos?" },
  { key: "faq_payments", label: "Pagos", question: "¿Qué métodos de pago aceptan y son seguros?" },
  { key: "faq_support", label: "Soporte", question: "¿Cómo puedo contactarlos si tengo un problema?" },
];

const MAX = 600;

const FAQPoliciesPanel = ({ storeId, primaryColor, initial }: FAQPoliciesPanelProps) => {
  const [values, setValues] = useState({
    faq_returns: initial.faq_returns || "",
    faq_shipping: initial.faq_shipping || "",
    faq_refunds: initial.faq_refunds || "",
    faq_payments: initial.faq_payments || "",
    faq_support: initial.faq_support || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload: Record<string, string | null> = {};
    (Object.keys(values) as Array<keyof typeof values>).forEach((k) => {
      const v = values[k].trim();
      payload[k] = v.length > 0 ? v.slice(0, MAX) : null;
    });
    const { error } = await supabase.from("stores").update(payload).eq("id", storeId);
    setSaving(false);
    if (error) {
      toast.error("No se pudieron guardar las políticas");
      return;
    }
    toast.success("FAQ actualizado en tu tienda");
  };

  const resetField = (key: keyof typeof DEFAULTS) => {
    setValues((prev) => ({ ...prev, [key]: DEFAULTS[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" style={{ color: primaryColor }} />
          Políticas y FAQ de la tienda
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personaliza las respuestas que verán tus clientes en la sección "Preguntas frecuentes". Si dejas un campo vacío, se mostrará el texto por defecto.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {FIELDS.map((f) => (
          <div key={f.key} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label className="text-base font-semibold">{f.label}</Label>
                <p className="text-xs text-muted-foreground italic">{f.question}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-8"
                onClick={() => resetField(f.key)}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Por defecto
              </Button>
            </div>
            <Textarea
              value={values[f.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [f.key]: e.target.value.slice(0, MAX) }))
              }
              placeholder={DEFAULTS[f.key]}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {values[f.key].length} / {MAX}
            </p>
          </div>
        ))}

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
          style={{ backgroundColor: primaryColor }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar políticas del FAQ
        </Button>
      </CardContent>
    </Card>
  );
};

export default FAQPoliciesPanel;
