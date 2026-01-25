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
  AlertCircle,
  Globe,
  Sparkles
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
import { Badge } from "@/components/ui/badge";

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
  
  // Usar dominio personalizado - obtener la base del dominio actual
  const getStoreBaseUrl = () => {
    const hostname = window.location.hostname;
    // Si estamos en un dominio personalizado o en producción
    if (!hostname.includes('localhost')) {
      return `${window.location.protocol}//${hostname}`;
    }
    return window.location.origin;
  };
  
  const baseUrl = getStoreBaseUrl();
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

  // Obtener solo el dominio base sin protocolo para mostrar
  const displayDomain = baseUrl.replace(/^https?:\/\//, '');

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" style={{ color: primaryColor }} />
              URL de tu Tienda
            </CardTitle>
            <CardDescription className="mt-1">
              Personaliza y comparte el enlace de tu tienda con código QR
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Personalizable
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Current URL Display */}
        <div className="p-4 bg-gradient-to-r from-muted to-muted/50 rounded-xl border">
          <Label className="text-xs text-muted-foreground mb-2 block font-medium">
            Tu enlace de tienda:
          </Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1 bg-background rounded-lg px-3 py-2 border">
              <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
              <code className="text-sm font-mono break-all" style={{ color: primaryColor }}>
                {displayDomain}/tienda/{slug}
              </code>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              title="Copiar enlace"
              className="shrink-0"
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Personalizar URL</Label>
            {slug !== currentSlug && (
              <span className="text-xs text-muted-foreground">
                Vista previa del cambio
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border">
            <span className="text-sm text-muted-foreground whitespace-nowrap font-mono">
              {displayDomain}/tienda/
            </span>
            <div className="relative flex-1">
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="mi-tienda"
                className={`pr-8 font-mono ${
                  slugAvailable === true ? "border-green-500 focus-visible:ring-green-500" : 
                  slugAvailable === false ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
              />
              {isChecking && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {!isChecking && slugAvailable === true && slug !== currentSlug && (
                <Check className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
            </div>
          </div>
          
          {slugAvailable === false && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Esta URL ya está en uso por otra tienda</AlertDescription>
            </Alert>
          )}
          
          {slug !== currentSlug && slugAvailable === true && (
            <Button
              onClick={handleSaveSlug}
              disabled={isSaving || !slugAvailable}
              size="sm"
              className="w-full"
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
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(storeUrl, "_blank")}
            className="flex-col h-auto py-3 gap-1"
          >
            <ExternalLink className="h-5 w-5" />
            <span className="text-xs">Ver tienda</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={shareUrl}
            className="flex-col h-auto py-3 gap-1"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-xs">Compartir</span>
          </Button>
          
          <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-col h-auto py-3 gap-1">
                <QrCode className="h-5 w-5" />
                <span className="text-xs">Código QR</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" style={{ color: primaryColor }} />
                  Código QR de tu tienda
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-6 bg-white rounded-2xl shadow-lg">
                  <img
                    src={generateQrCode()}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">{storeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {displayDomain}/tienda/{slug}
                  </p>
                </div>
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
        <div className="p-4 border rounded-xl bg-gradient-to-r from-muted/30 to-muted/10">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
            Tips para compartir
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Comparte tu enlace en tus redes sociales
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Añade el enlace a tu bio de Instagram
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Usa el código QR en tarjetas de presentación
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Envía el enlace por WhatsApp a tus clientes
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoreUrlPanel;
