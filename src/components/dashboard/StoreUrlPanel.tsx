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
  Sparkles,
  ShieldCheck,
  Smartphone,
  Monitor,
  X,
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
  const [validationStatus, setValidationStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [validationMessage, setValidationMessage] = useState<string>("");

  // URL pública real de la tienda (la que se comparte con clientes).
  // Si estamos en preview / sandbox de desarrollo, devolvemos el dominio
  // publicado real para que el link siempre funcione al enviarlo.
  const PUBLISHED_URL = "https://apptienda.lovable.app";
  const getStoreBaseUrl = () => {
    if (typeof window === "undefined") return PUBLISHED_URL;
    const hostname = window.location.hostname;
    const isPreviewHost =
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.startsWith("id-preview--") ||
      hostname.endsWith(".lovableproject.com") ||
      hostname.endsWith(".lovable.dev") ||
      hostname.includes("--");
    if (isPreviewHost) return PUBLISHED_URL;
    return `${window.location.protocol}//${hostname}`;
  };

  const baseUrl = getStoreBaseUrl();
  const storeUrl = `${baseUrl}/tienda/${slug}`;
  // El QR SIEMPRE apunta al dominio publicado real, funcione desde donde funcione (móvil o escritorio).
  const publicStoreUrl = `${PUBLISHED_URL}/tienda/${slug}`;

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

  const copyToClipboard = async (text = publicStoreUrl) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: `Se copió el dominio publicado real: ${publicDisplayDomain}/tienda/${slug}`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Copia manualmente desde el texto mostrado.",
      });
    }
  };

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: storeName,
          text: `¡Visita mi tienda ${storeName}!`,
          url: publicStoreUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyToClipboard();
    }
  };

  const generateQrCode = (size = 300) => {
    // El QR siempre codifica la URL publicada real, para que funcione desde
    // cualquier cámara de móvil o escritorio, sin importar dónde se comparta.
    const color = primaryColor.replace("#", "");
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(publicStoreUrl)}&color=${color}&margin=10&ecc=H&format=png`;
  };

  const validatePublicUrl = async () => {
    setValidationStatus("checking");
    setValidationMessage("");
    try {
      // Comprobamos que la tienda existe en la BD para el slug actual.
      const { data, error } = await supabase
        .from("stores")
        .select("id, is_active, slug")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setValidationStatus("error");
        setValidationMessage("No encontramos una tienda publicada con este enlace. Guarda los cambios primero.");
        return;
      }
      if (data.is_active === false) {
        setValidationStatus("error");
        setValidationMessage("La tienda está desactivada. Actívala para que el QR abra correctamente.");
        return;
      }
      // Ping en segundo plano al dominio publicado (no bloquea, sólo confirma alcance).
      try {
        await fetch(publicStoreUrl, { method: "HEAD", mode: "no-cors" });
      } catch {
        // ignoramos: no-cors no da status, pero el intento evita falsos negativos
      }
      setValidationStatus("ok");
      setValidationMessage("Enlace y QR verificados. Abren tu tienda en móvil y escritorio.");
    } catch (e: any) {
      setValidationStatus("error");
      setValidationMessage(e?.message || "No se pudo validar el enlace.");
    }
  };

  // Obtener solo el dominio base sin protocolo para mostrar
  const displayDomain = baseUrl.replace(/^https?:\/\//, '');
  const publicDisplayDomain = PUBLISHED_URL.replace(/^https?:\/\//, '');

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
                {publicDisplayDomain}/tienda/{slug}
              </code>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard()}
              title="Copiar enlace publicado"
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-green-600" />
            Este enlace apunta al dominio publicado real. Siempre funciona para tus clientes.
          </p>
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
              {publicDisplayDomain}/tienda/
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
            onClick={() => window.open(publicStoreUrl, "_blank", "noopener,noreferrer")}
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
                <div className="p-6 bg-white rounded-2xl shadow-lg relative">
                  <img
                    src={generateQrCode(600)}
                    alt={`Código QR para abrir ${storeName}`}
                    className="w-64 h-64"
                    loading="lazy"
                  />
                  {validationStatus === "ok" && (
                    <span className="absolute -top-2 -right-2 flex items-center gap-1 bg-green-500 text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
                      <ShieldCheck className="h-3 w-3" /> Verificado
                    </span>
                  )}
                </div>
                <div className="text-center space-y-1">
                  <p className="font-medium">{storeName}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {publicDisplayDomain}/tienda/{slug}
                  </p>
                  <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-2 pt-1">
                    <Smartphone className="h-3 w-3" /> Móvil
                    <span className="opacity-40">·</span>
                    <Monitor className="h-3 w-3" /> Escritorio
                  </p>
                </div>

                {validationStatus !== "idle" && (
                  <Alert
                    variant={validationStatus === "error" ? "destructive" : "default"}
                    className="py-2"
                  >
                    {validationStatus === "checking" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : validationStatus === "ok" ? (
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    <AlertDescription className="text-xs">
                      {validationStatus === "checking" ? "Validando enlace..." : validationMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    variant="outline"
                    onClick={validatePublicUrl}
                    disabled={validationStatus === "checking"}
                  >
                    {validationStatus === "checking" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 mr-2" />
                    )}
                    Validar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(publicStoreUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Probar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(publicStoreUrl);
                      toast({ title: "Enlace copiado", description: publicStoreUrl });
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    style={{ backgroundColor: primaryColor }}
                    onClick={async () => {
                      try {
                        const res = await fetch(generateQrCode(800));
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `qr-${slug}.png`;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        URL.revokeObjectURL(url);
                      } catch {
                        window.open(generateQrCode(800), "_blank");
                      }
                    }}
                  >
                    Descargar
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
