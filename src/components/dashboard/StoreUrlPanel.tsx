import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Link2, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode,
  Share2,
  Loader2,
  Save,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StoreUrlPanelProps {
  storeId: string;
  currentSlug: string;
  storeName: string;
  primaryColor?: string;
  onSlugUpdate?: (newSlug: string) => void;
}

const StoreUrlPanel = ({ 
  storeId, 
  currentSlug, 
  storeName, 
  primaryColor = "#8B4513",
  onSlugUpdate 
}: StoreUrlPanelProps) => {
  const { toast } = useToast();
  const [slug, setSlug] = useState(currentSlug);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  
  const baseUrl = window.location.origin;
  const storeUrl = `${baseUrl}/tienda/${slug}`;

  useEffect(() => {
    setSlug(currentSlug);
  }, [currentSlug]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const checkSlugAvailability = async (newSlug: string) => {
    if (newSlug === currentSlug) {
      setSlugAvailable(true);
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id")
        .eq("slug", newSlug)
        .neq("id", storeId)
        .maybeSingle();

      if (error) throw error;
      setSlugAvailable(data === null);
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const sanitized = generateSlug(value);
    setSlug(sanitized);
    setSlugAvailable(null);
    
    // Debounced check
    const timer = setTimeout(() => {
      if (sanitized.length >= 3) {
        checkSlugAvailability(sanitized);
      }
    }, 500);

    return () => clearTimeout(timer);
  };

  const handleSaveSlug = async () => {
    if (!slug || slug.length < 3) {
      toast({
        variant: "destructive",
        title: "URL inválida",
        description: "La URL debe tener al menos 3 caracteres",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({ slug })
        .eq("id", storeId);

      if (error) {
        if (error.message.includes("duplicate")) {
          toast({
            variant: "destructive",
            title: "URL no disponible",
            description: "Esta URL ya está en uso por otra tienda",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "URL actualizada",
        description: "La URL de tu tienda ha sido actualizada correctamente",
      });
      
      onSlugUpdate?.(slug);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "El enlace se ha copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo copiar el enlace",
      });
    }
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `¡Visita mi tienda ${storeName}!`,
          url: storeUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  const generateQrCode = () => {
    // Using a free QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(storeUrl)}&color=${primaryColor.replace("#", "")}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" style={{ color: primaryColor }} />
          URL de tu Tienda
        </CardTitle>
        <CardDescription>
          Personaliza y comparte la URL de tu tienda con tus clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current URL Display */}
        <div className="p-4 bg-muted rounded-lg">
          <Label className="text-xs text-muted-foreground mb-2 block">Tu enlace de tienda:</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono break-all" style={{ color: primaryColor }}>
              {storeUrl}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              title="Copiar enlace"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Edit Slug */}
        <div className="space-y-2">
          <Label>Personalizar URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">{baseUrl}/tienda/</span>
            <div className="relative flex-1">
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="mi-tienda"
                className={`pr-8 ${
                  slugAvailable === true ? "border-green-500" : 
                  slugAvailable === false ? "border-red-500" : ""
                }`}
              />
              {isChecking && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
              {!isChecking && slugAvailable === true && slug !== currentSlug && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
          
          {slugAvailable === false && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Esta URL ya está en uso</AlertDescription>
            </Alert>
          )}
          
          {slug !== currentSlug && slugAvailable === true && (
            <Button
              onClick={handleSaveSlug}
              disabled={isSaving || !slugAvailable}
              size="sm"
              className="mt-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar nueva URL
            </Button>
          )}
        </div>

        {/* Share Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(storeUrl, "_blank")}
            className="flex-1"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver tienda
          </Button>
          
          <Button
            variant="outline"
            onClick={shareUrl}
            className="flex-1"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
          
          <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <QrCode className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Código QR de tu tienda</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <img
                    src={generateQrCode()}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Escanea este código para visitar <strong>{storeName}</strong>
                </p>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar enlace
                  </Button>
                  <Button
                    className="flex-1"
                    style={{ backgroundColor: primaryColor }}
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = generateQrCode();
                      link.download = `qr-${slug}.png`;
                      link.click();
                    }}
                  >
                    Descargar QR
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Social Share Tips */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-sm mb-2">💡 Tips para compartir</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Comparte tu enlace en tus redes sociales</li>
            <li>• Añade el enlace a tu bio de Instagram</li>
            <li>• Usa el código QR en tarjetas de presentación</li>
            <li>• Envía el enlace por WhatsApp a tus clientes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreUrlPanel;
