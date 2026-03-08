import { useState } from "react";
import { Upload, CheckCircle2, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentProofUploadProps {
  orderId: string;
  primaryColor: string;
  onUploaded?: (url: string) => void;
}

const PaymentProofUpload = ({ orderId, primaryColor, onUploaded }: PaymentProofUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Solo se aceptan imágenes o PDF");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo no puede ser mayor a 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${orderId}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      const proofUrl = urlData.publicUrl;

      // Update the order with the proof URL
      const { error: updateError } = await supabase
        .from("orders")
        .update({ payment_proof_url: proofUrl } as any)
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order with proof:", updateError);
        // Don't fail - the file was uploaded successfully
      }

      setPreviewUrl(URL.createObjectURL(file));
      setUploaded(true);
      onUploaded?.(proofUrl);
      toast.success("¡Comprobante subido exitosamente!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error al subir el comprobante. Intenta de nuevo.");
    } finally {
      setIsUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="mt-4 p-4 rounded-lg border-2 border-dashed" style={{ borderColor: `${primaryColor}50` }}>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-green-700">Comprobante enviado</p>
            <p className="text-sm text-muted-foreground">El vendedor verificará tu pago pronto.</p>
          </div>
          {previewUrl && (
            <img src={previewUrl} alt="Comprobante" className="w-12 h-12 object-cover rounded" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-lg border-2 border-dashed" style={{ borderColor: `${primaryColor}30` }}>
      <div className="text-center">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="font-medium text-sm mb-1">Sube tu comprobante de pago</p>
        <p className="text-xs text-muted-foreground mb-3">
          Foto o captura de pantalla de la transferencia (máx. 5MB)
        </p>
        <label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            className="cursor-pointer"
            style={{ borderColor: primaryColor, color: primaryColor }}
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar archivo
                </>
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
};

export default PaymentProofUpload;
