import { useState, useEffect } from "react";
import { StoreSection } from "@/types/storeLayout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SectionSettingsDialogProps {
  section: StoreSection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (section: StoreSection) => void;
  primaryColor?: string;
}

export const SectionSettingsDialog = ({
  section,
  open,
  onOpenChange,
  onSave,
  primaryColor = '#8B4513'
}: SectionSettingsDialogProps) => {
  const [editedSection, setEditedSection] = useState<StoreSection | null>(null);

  useEffect(() => {
    if (section) {
      setEditedSection({ ...section, settings: { ...section.settings } });
    }
  }, [section]);

  if (!editedSection) return null;

  const updateSetting = (key: string, value: any) => {
    setEditedSection({
      ...editedSection,
      settings: { ...editedSection.settings, [key]: value }
    });
  };

  const handleSave = () => {
    if (editedSection) {
      onSave(editedSection);
      onOpenChange(false);
    }
  };

  const renderSettingsFields = () => {
    switch (editedSection.type) {
      case 'hero':
        return (
          <>
            <div className="space-y-2">
              <Label>Título principal</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="¡Bienvenido a nuestra tienda!"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Descubre los mejores productos"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar botón</Label>
              <Switch
                checked={editedSection.settings.showButton}
                onCheckedChange={(checked) => updateSetting('showButton', checked)}
              />
            </div>
            {editedSection.settings.showButton && (
              <div className="space-y-2">
                <Label>Texto del botón</Label>
                <Input
                  value={editedSection.settings.buttonText || ''}
                  onChange={(e) => updateSetting('buttonText', e.target.value)}
                  placeholder="Ver productos"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Tipo de fondo</Label>
              <Select
                value={editedSection.settings.backgroundType || 'gradient'}
                onValueChange={(value) => updateSetting('backgroundType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="solid">Color sólido</SelectItem>
                  <SelectItem value="image">Imagen de fondo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'featured_products':
      case 'products_grid':
        return (
          <>
            <div className="space-y-2">
              <Label>Cantidad de productos ({editedSection.settings.limit || 8})</Label>
              <Slider
                value={[editedSection.settings.limit || 8]}
                onValueChange={([value]) => updateSetting('limit', value)}
                min={4}
                max={24}
                step={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Columnas</Label>
              <Select
                value={String(editedSection.settings.columns || 4)}
                onValueChange={(value) => updateSetting('columns', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 columnas</SelectItem>
                  <SelectItem value="3">3 columnas</SelectItem>
                  <SelectItem value="4">4 columnas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar precios</Label>
              <Switch
                checked={editedSection.settings.showPrice !== false}
                onCheckedChange={(checked) => updateSetting('showPrice', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar badges (Nuevo, Oferta)</Label>
              <Switch
                checked={editedSection.settings.showBadges !== false}
                onCheckedChange={(checked) => updateSetting('showBadges', checked)}
              />
            </div>
            {editedSection.type === 'products_grid' && (
              <div className="flex items-center justify-between">
                <Label>Mostrar filtros</Label>
                <Switch
                  checked={editedSection.settings.showFilters !== false}
                  onCheckedChange={(checked) => updateSetting('showFilters', checked)}
                />
              </div>
            )}
          </>
        );

      case 'categories':
        return (
          <>
            <div className="space-y-2">
              <Label>Columnas</Label>
              <Select
                value={String(editedSection.settings.columns || 4)}
                onValueChange={(value) => updateSetting('columns', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 columnas</SelectItem>
                  <SelectItem value="3">3 columnas</SelectItem>
                  <SelectItem value="4">4 columnas</SelectItem>
                  <SelectItem value="6">6 columnas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar descripción</Label>
              <Switch
                checked={editedSection.settings.showDescription}
                onCheckedChange={(checked) => updateSetting('showDescription', checked)}
              />
            </div>
          </>
        );

      case 'banner':
        return (
          <>
            <div className="space-y-2">
              <Label>Texto del banner</Label>
              <Textarea
                value={editedSection.settings.text || ''}
                onChange={(e) => updateSetting('text', e.target.value)}
                placeholder="¡Envío gratis en compras mayores a $999!"
              />
            </div>
            <div className="space-y-2">
              <Label>Color de fondo</Label>
              <Select
                value={editedSection.settings.backgroundColor || 'primary'}
                onValueChange={(value) => updateSetting('backgroundColor', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Color primario</SelectItem>
                  <SelectItem value="secondary">Color secundario</SelectItem>
                  <SelectItem value="accent">Color de acento</SelectItem>
                  <SelectItem value="dark">Oscuro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'newsletter':
        return (
          <>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Suscríbete a nuestro boletín"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Recibe ofertas exclusivas"
              />
            </div>
          </>
        );

      case 'about':
        return (
          <div className="space-y-2">
            <Label>Contenido</Label>
            <Textarea
              value={editedSection.settings.content || ''}
              onChange={(e) => updateSetting('content', e.target.value)}
              placeholder="Describe tu tienda..."
              rows={6}
            />
          </div>
        );

      case 'contact':
        return (
          <>
            <div className="flex items-center justify-between">
              <Label>Mostrar mapa</Label>
              <Switch
                checked={editedSection.settings.showMap}
                onCheckedChange={(checked) => updateSetting('showMap', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar redes sociales</Label>
              <Switch
                checked={editedSection.settings.showSocial}
                onCheckedChange={(checked) => updateSetting('showSocial', checked)}
              />
            </div>
          </>
        );

      case 'testimonials':
        return (
          <>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Lo que dicen nuestros clientes"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Opiniones reales de clientes satisfechos"
              />
            </div>
            <div className="space-y-2">
              <Label>Columnas</Label>
              <Select
                value={String(editedSection.settings.columns || 3)}
                onValueChange={(value) => updateSetting('columns', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 columnas</SelectItem>
                  <SelectItem value="3">3 columnas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'image_slider':
        return (
          <>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Galería de imágenes"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Reproducción automática</Label>
              <Switch
                checked={editedSection.settings.autoplay !== false}
                onCheckedChange={(checked) => updateSetting('autoplay', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Intervalo (ms)</Label>
              <Slider
                value={[editedSection.settings.interval || 5000]}
                onValueChange={([value]) => updateSetting('interval', value)}
                min={2000}
                max={10000}
                step={1000}
              />
              <p className="text-xs text-muted-foreground">
                {(editedSection.settings.interval || 5000) / 1000} segundos
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar leyendas</Label>
              <Switch
                checked={editedSection.settings.showCaptions !== false}
                onCheckedChange={(checked) => updateSetting('showCaptions', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label>Proporción</Label>
              <Select
                value={editedSection.settings.aspectRatio || '16/9'}
                onValueChange={(value) => updateSetting('aspectRatio', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16/9">16:9 (Panorámico)</SelectItem>
                  <SelectItem value="4/3">4:3 (Estándar)</SelectItem>
                  <SelectItem value="21/9">21:9 (Ultra ancho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case 'video':
        return (
          <>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Video de presentación"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo (opcional)</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Conoce nuestra historia"
              />
            </div>
            <div className="space-y-2">
              <Label>ID de YouTube</Label>
              <Input
                value={editedSection.settings.youtubeId || ''}
                onChange={(e) => updateSetting('youtubeId', e.target.value)}
                placeholder="ej: dQw4w9WgXcQ"
              />
              <p className="text-xs text-muted-foreground">
                El ID está después de "v=" en la URL de YouTube
              </p>
            </div>
            <div className="space-y-2">
              <Label>O URL de video directo</Label>
              <Input
                value={editedSection.settings.videoUrl || ''}
                onChange={(e) => updateSetting('videoUrl', e.target.value)}
                placeholder="https://ejemplo.com/video.mp4"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Reproducción automática</Label>
              <Switch
                checked={editedSection.settings.autoplay}
                onCheckedChange={(checked) => updateSetting('autoplay', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Repetir en bucle</Label>
              <Switch
                checked={editedSection.settings.loop !== false}
                onCheckedChange={(checked) => updateSetting('loop', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mostrar controles</Label>
              <Switch
                checked={editedSection.settings.showControls !== false}
                onCheckedChange={(checked) => updateSetting('showControls', checked)}
              />
            </div>
          </>
        );

      case 'faq':
        return (
          <>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Preguntas Frecuentes"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Encuentra respuestas a las preguntas más comunes"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Las preguntas se pueden editar directamente en la base de datos o mediante la API.
            </p>
          </>
        );

      default:
        return <p className="text-muted-foreground">No hay configuraciones disponibles para esta sección.</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar: {editedSection.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nombre de la sección</Label>
            <Input
              value={editedSection.title}
              onChange={(e) => setEditedSection({ ...editedSection, title: e.target.value })}
            />
          </div>
          
          {renderSettingsFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            style={{ backgroundColor: primaryColor }}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
