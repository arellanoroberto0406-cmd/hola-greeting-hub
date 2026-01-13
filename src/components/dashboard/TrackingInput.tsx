import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Truck, Package, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface TrackingInputProps {
  orderId: string;
  currentTracking?: {
    tracking_number?: string;
    tracking_url?: string;
    carrier?: string;
    estimated_delivery?: string;
  };
}

const CARRIERS = [
  { value: "fedex", label: "FedEx", trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=" },
  { value: "dhl", label: "DHL", trackingUrl: "https://www.dhl.com/us-en/home/tracking.html?tracking-id=" },
  { value: "ups", label: "UPS", trackingUrl: "https://www.ups.com/track?tracknum=" },
  { value: "estafeta", label: "Estafeta", trackingUrl: "https://www.estafeta.com/Herramientas/Rastreo?tipo=1&guias=" },
  { value: "99minutos", label: "99 Minutos", trackingUrl: "https://tracking.99minutos.com/" },
  { value: "paquetexpress", label: "Paquetexpress", trackingUrl: "https://www.paquetexpress.com.mx/rastreo/" },
  { value: "redpack", label: "Redpack", trackingUrl: "https://www.redpack.com.mx/rastreo/" },
  { value: "other", label: "Otro", trackingUrl: "" },
];

const TrackingInput = ({ orderId, currentTracking }: TrackingInputProps) => {
  const [open, setOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking?.tracking_number || "");
  const [carrier, setCarrier] = useState(currentTracking?.carrier || "");
  const [customUrl, setCustomUrl] = useState(currentTracking?.tracking_url || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(currentTracking?.estimated_delivery || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    try {
      const selectedCarrier = CARRIERS.find(c => c.value === carrier);
      const trackingUrl = carrier === "other" 
        ? customUrl 
        : selectedCarrier?.trackingUrl 
          ? `${selectedCarrier.trackingUrl}${trackingNumber}`
          : customUrl;

      const { error } = await supabase
        .from("orders")
        .update({
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier: carrier || null,
          estimated_delivery: estimatedDelivery || null,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast({ title: "Tracking actualizado" });
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Truck className="h-4 w-4 mr-2" />
          {currentTracking?.tracking_number ? "Editar tracking" : "Agregar tracking"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Información de envío
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Paquetería</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona paquetería" />
              </SelectTrigger>
              <SelectContent>
                {CARRIERS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Número de guía</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ej: 794644790226"
            />
          </div>

          {carrier === "other" && (
            <div className="space-y-2">
              <Label>URL de rastreo</Label>
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Fecha estimada de entrega</Label>
            <Input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
            />
          </div>

          {trackingNumber && carrier && carrier !== "other" && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">URL de rastreo generada:</p>
              <a
                href={`${CARRIERS.find(c => c.value === carrier)?.trackingUrl}${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center gap-1 hover:underline break-all"
              >
                {CARRIERS.find(c => c.value === carrier)?.trackingUrl}{trackingNumber}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Guardando..." : "Guardar información"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingInput;
