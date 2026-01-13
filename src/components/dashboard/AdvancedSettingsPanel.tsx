import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Palette, 
  Bell, 
  Globe, 
  Truck, 
  MessageSquare, 
  Shield, 
  Eye,
  DollarSign,
  Clock,
  Link2,
  Loader2,
  Save,
  Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoreSettings {
  // Visual
  accent_color: string;
  welcome_message: string;
  announcement_text: string;
  announcement_active: boolean;
  
  // Display
  show_reviews: boolean;
  show_stock: boolean;
  
  // Commerce
  currency: string;
  tax_rate: number;
  min_order_amount: number;
  
  // Social
  twitter_url: string;
  tiktok_url: string;
  website_url: string;
  
  // Policies
  return_policy: string;
  shipping_info: string;
}

interface AdvancedSettingsPanelProps {
  storeId: string;
  initialSettings: Partial<StoreSettings>;
  primaryColor: string;
}

const currencies = [
  { value: "MXN", label: "Peso Mexicano (MXN)" },
  { value: "USD", label: "Dólar Americano (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "COP", label: "Peso Colombiano (COP)" },
  { value: "ARS", label: "Peso Argentino (ARS)" },
  { value: "CLP", label: "Peso Chileno (CLP)" },
  { value: "PEN", label: "Sol Peruano (PEN)" },
];

const AdvancedSettingsPanel = ({ storeId, initialSettings, primaryColor }: AdvancedSettingsPanelProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    accent_color: initialSettings.accent_color || "#2F1810",
    welcome_message: initialSettings.welcome_message || "",
    announcement_text: initialSettings.announcement_text || "",
    announcement_active: initialSettings.announcement_active || false,
    show_reviews: initialSettings.show_reviews ?? true,
    show_stock: initialSettings.show_stock ?? true,
    currency: initialSettings.currency || "MXN",
    tax_rate: initialSettings.tax_rate || 0,
    min_order_amount: initialSettings.min_order_amount || 0,
    twitter_url: initialSettings.twitter_url || "",
    tiktok_url: initialSettings.tiktok_url || "",
    website_url: initialSettings.website_url || "",
    return_policy: initialSettings.return_policy || "",
    shipping_info: initialSettings.shipping_info || "",
  });

  const updateSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update(settings)
        .eq("id", storeId);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
    setIsSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configuración Avanzada
        </CardTitle>
        <CardDescription>
          Personaliza todos los aspectos de tu tienda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full space-y-2">
          {/* Announcements Section */}
          <AccordionItem value="announcements" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Anuncios y Mensajes</p>
                  <p className="text-sm text-muted-foreground">Barra de anuncios y mensaje de bienvenida</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Barra de anuncios</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra un mensaje destacado en la parte superior de tu tienda
                  </p>
                </div>
                <Switch
                  checked={settings.announcement_active}
                  onCheckedChange={(checked) => updateSetting("announcement_active", checked)}
                />
              </div>
              
              {settings.announcement_active && (
                <div className="space-y-2 animate-in fade-in-50">
                  <Label>Texto del anuncio</Label>
                  <Input
                    value={settings.announcement_text}
                    onChange={(e) => updateSetting("announcement_text", e.target.value)}
                    placeholder="🎉 ¡Envío gratis en compras mayores a $999!"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa emojis para hacerlo más llamativo
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Mensaje de bienvenida</Label>
                <Textarea
                  value={settings.welcome_message}
                  onChange={(e) => updateSetting("welcome_message", e.target.value)}
                  placeholder="¡Bienvenido a nuestra tienda! Encuentra los mejores productos aquí."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Se mostrará debajo del nombre de tu tienda
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Display Options */}
          <AccordionItem value="display" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Opciones de visualización</p>
                  <p className="text-sm text-muted-foreground">Qué mostrar en tu tienda</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Mostrar reseñas</Label>
                  <p className="text-sm text-muted-foreground">
                    Permite que los clientes vean y dejen reseñas en los productos
                  </p>
                </div>
                <Switch
                  checked={settings.show_reviews}
                  onCheckedChange={(checked) => updateSetting("show_reviews", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Mostrar stock disponible</Label>
                  <p className="text-sm text-muted-foreground">
                    Muestra la cantidad de unidades disponibles en cada producto
                  </p>
                </div>
                <Switch
                  checked={settings.show_stock}
                  onCheckedChange={(checked) => updateSetting("show_stock", checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Color de acento</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={settings.accent_color}
                    onChange={(e) => updateSetting("accent_color", e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Color adicional para destacar elementos
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Commerce Settings */}
          <AccordionItem value="commerce" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Configuración de ventas</p>
                  <p className="text-sm text-muted-foreground">Moneda, impuestos y mínimos</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => updateSetting("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.value} value={curr.value}>
                          {curr.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tasa de impuesto (%)</Label>
                  <Input
                    type="number"
                    value={settings.tax_rate}
                    onChange={(e) => updateSetting("tax_rate", Number(e.target.value))}
                    min={0}
                    max={100}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Monto mínimo de compra</Label>
                <Input
                  type="number"
                  value={settings.min_order_amount}
                  onChange={(e) => updateSetting("min_order_amount", Number(e.target.value))}
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Deja en 0 para sin mínimo
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Social Links */}
          <AccordionItem value="social" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Redes sociales adicionales</p>
                  <p className="text-sm text-muted-foreground">Twitter, TikTok y sitio web</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Twitter / X</Label>
                  <Input
                    value={settings.twitter_url}
                    onChange={(e) => updateSetting("twitter_url", e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>TikTok</Label>
                  <Input
                    value={settings.tiktok_url}
                    onChange={(e) => updateSetting("tiktok_url", e.target.value)}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sitio web</Label>
                <Input
                  value={settings.website_url}
                  onChange={(e) => updateSetting("website_url", e.target.value)}
                  placeholder="https://www.miempresa.com"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Policies */}
          <AccordionItem value="policies" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Políticas de la tienda</p>
                  <p className="text-sm text-muted-foreground">Devoluciones e información de envío</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label>Política de devoluciones</Label>
                <Textarea
                  value={settings.return_policy}
                  onChange={(e) => updateSetting("return_policy", e.target.value)}
                  placeholder="Describe tu política de devoluciones y cambios..."
                  rows={4}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Información de envío</Label>
                <Textarea
                  value={settings.shipping_info}
                  onChange={(e) => updateSetting("shipping_info", e.target.value)}
                  placeholder="Tiempos de entrega, zonas de cobertura, métodos de envío..."
                  rows={4}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button 
          onClick={handleSave} 
          className="w-full mt-6"
          disabled={isSaving}
          style={{ backgroundColor: primaryColor }}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Save className="h-4 w-4 mr-2" />
          Guardar Configuración Avanzada
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdvancedSettingsPanel;
