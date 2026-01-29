import { useState, useEffect } from "react";
import { StoreSection, ANIMATION_OPTIONS, BACKGROUND_COLORS, AnimationType } from "@/types/storeLayout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Sparkles, Settings2, Crown, Eye } from "lucide-react";
import { SectionPreview } from "./SectionPreview";

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
        return (
          <>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Descubre nuestros productos más populares"
              />
            </div>
            <div className="space-y-2">
              <Label>Diseño</Label>
              <Select
                value={editedSection.settings.layout || 'grid'}
                onValueChange={(value) => updateSetting('layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">🔲 Cuadrícula</SelectItem>
                  <SelectItem value="carousel">🎠 Carrusel</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
            {editedSection.settings.layout !== 'carousel' && (
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
            )}
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
          </>
        );

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
            <div className="flex items-center justify-between">
              <Label>Mostrar filtros</Label>
              <Switch
                checked={editedSection.settings.showFilters !== false}
                onCheckedChange={(checked) => updateSetting('showFilters', checked)}
              />
            </div>
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
      case 'premium_video':
        return (
          <>
            {editedSection.type === 'premium_video' && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2 text-primary">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-medium">Sección Premium Enterprise</span>
                </div>
              </div>
            )}
            
            {editedSection.type === 'premium_video' && (
              <div className="space-y-2">
                <Label>Estilo de diseño</Label>
                <Select
                  value={editedSection.settings.layoutStyle || 'fullwidth'}
                  onValueChange={(value) => updateSetting('layoutStyle', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">🎬 Cinematográfico (Pantalla completa)</SelectItem>
                    <SelectItem value="split">📐 Dividido (Video + Contenido)</SelectItem>
                    <SelectItem value="floating">✨ Flotante (Con tarjetas animadas)</SelectItem>
                    <SelectItem value="fullwidth">📺 Ancho completo (Elegante)</SelectItem>
                    <SelectItem value="grid">🎞️ Galería (Múltiples videos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
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
            
            {editedSection.type === 'premium_video' && (
              <div className="space-y-2">
                <Label>Etiqueta/Badge (opcional)</Label>
                <Input
                  value={editedSection.settings.badge || ''}
                  onChange={(e) => updateSetting('badge', e.target.value)}
                  placeholder="ej: Nuevo, Exclusivo, Destacado"
                />
              </div>
            )}
            
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
            
            {editedSection.type === 'premium_video' && (
              <>
                <div className="flex items-center justify-between">
                  <Label>Mostrar overlay con gradiente</Label>
                  <Switch
                    checked={editedSection.settings.showGradientOverlay !== false}
                    onCheckedChange={(checked) => updateSetting('showGradientOverlay', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Mostrar tarjetas flotantes</Label>
                  <Switch
                    checked={editedSection.settings.floatingCards}
                    onCheckedChange={(checked) => updateSetting('floatingCards', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Mostrar botón de acción</Label>
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
                      placeholder="Ver Colección"
                    />
                  </div>
                )}
              </>
            )}
            
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

      case 'parallax_hero':
        return (
          <>
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Hero Parallax Premium</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Título principal</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Experiencia Premium"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Descubre una nueva forma de comprar"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge/Etiqueta</Label>
              <Input
                value={editedSection.settings.badge || ''}
                onChange={(e) => updateSetting('badge', e.target.value)}
                placeholder="ej: Nueva Colección, Exclusivo"
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen de fondo (URL)</Label>
              <Input
                value={editedSection.settings.backgroundImage || ''}
                onChange={(e) => updateSetting('backgroundImage', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label>Imagen frontal (URL, opcional)</Label>
              <Input
                value={editedSection.settings.foregroundImage || ''}
                onChange={(e) => updateSetting('foregroundImage', e.target.value)}
                placeholder="https://..."
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
              <>
                <div className="space-y-2">
                  <Label>Texto del botón</Label>
                  <Input
                    value={editedSection.settings.buttonText || ''}
                    onChange={(e) => updateSetting('buttonText', e.target.value)}
                    placeholder="Explorar"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Botón secundario (opcional)</Label>
                  <Input
                    value={editedSection.settings.secondaryButtonText || ''}
                    onChange={(e) => updateSetting('secondaryButtonText', e.target.value)}
                    placeholder="Ver más"
                  />
                </div>
              </>
            )}
            <div className="flex items-center justify-between">
              <Label>Mostrar badges de confianza</Label>
              <Switch
                checked={editedSection.settings.showTrustBadges}
                onCheckedChange={(checked) => updateSetting('showTrustBadges', checked)}
              />
            </div>
          </>
        );

      case 'animated_stats':
        return (
          <>
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Estadísticas Animadas</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Nuestros Números"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Los resultados hablan por sí solos"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge/Etiqueta</Label>
              <Input
                value={editedSection.settings.badge || ''}
                onChange={(e) => updateSetting('badge', e.target.value)}
                placeholder="ej: Estadísticas"
              />
            </div>
            <div className="space-y-2">
              <Label>Estilo de diseño</Label>
              <Select
                value={editedSection.settings.layoutStyle || 'cards'}
                onValueChange={(value) => updateSetting('layoutStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cards">🎴 Tarjetas (con iconos)</SelectItem>
                  <SelectItem value="minimal">✨ Minimalista (solo números)</SelectItem>
                  <SelectItem value="banner">🎨 Banner (con fondo de color)</SelectItem>
                  <SelectItem value="circular">⭕ Circular (con progreso)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Las estadísticas se configuran en la sección avanzada del editor.
            </p>
          </>
        );

      case 'interactive_gallery':
        return (
          <>
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-4 w-4" />
                <span className="text-sm font-medium">Galería Interactiva</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={editedSection.settings.headline || ''}
                onChange={(e) => updateSetting('headline', e.target.value)}
                placeholder="Nuestra Galería"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Input
                value={editedSection.settings.subtitle || ''}
                onChange={(e) => updateSetting('subtitle', e.target.value)}
                placeholder="Explora nuestras mejores imágenes"
              />
            </div>
            <div className="space-y-2">
              <Label>Badge/Etiqueta</Label>
              <Input
                value={editedSection.settings.badge || ''}
                onChange={(e) => updateSetting('badge', e.target.value)}
                placeholder="ej: Galería"
              />
            </div>
            <div className="space-y-2">
              <Label>Estilo de diseño</Label>
              <Select
                value={editedSection.settings.layoutStyle || 'masonry'}
                onValueChange={(value) => updateSetting('layoutStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masonry">🧱 Masonry (alturas variables)</SelectItem>
                  <SelectItem value="grid">📐 Grid (tamaños iguales)</SelectItem>
                  <SelectItem value="carousel">🎠 Carrusel (deslizable)</SelectItem>
                  <SelectItem value="featured">⭐ Destacado (una grande + pequeñas)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Las imágenes de la galería se configuran en la sección avanzada.
            </p>
          </>
        );

      default:
        return null;
    }
  };

  const renderStyleFields = () => {
    return (
      <div className="space-y-4">
        {/* Background Color */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Color de fondo
          </Label>
          <Select
            value={editedSection.settings.backgroundColor || 'transparent'}
            onValueChange={(value) => updateSetting('backgroundColor', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BACKGROUND_COLORS.map((bg) => (
                <SelectItem key={bg.value} value={bg.value}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-4 w-4 rounded border"
                      style={{ 
                        backgroundColor: bg.color === 'primary-light' ? `${primaryColor}15` : bg.color,
                        borderColor: bg.color === 'transparent' ? '#e5e7eb' : 'transparent'
                      }}
                    />
                    {bg.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {editedSection.settings.backgroundColor === 'custom' && (
            <div className="space-y-2">
              <Label>Color personalizado</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={editedSection.settings.customBgColor || '#ffffff'}
                  onChange={(e) => updateSetting('customBgColor', e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={editedSection.settings.customBgColor || '#ffffff'}
                  onChange={(e) => updateSetting('customBgColor', e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {editedSection.settings.backgroundColor === 'primary-light' && (
            <div className="space-y-2">
              <Label>Opacidad ({editedSection.settings.bgOpacity || 10}%)</Label>
              <Slider
                value={[editedSection.settings.bgOpacity || 10]}
                onValueChange={([value]) => updateSetting('bgOpacity', value)}
                min={5}
                max={30}
                step={5}
              />
            </div>
          )}
        </div>

        {/* Background Pattern */}
        <div className="space-y-2">
          <Label>Patrón de fondo</Label>
          <Select
            value={editedSection.settings.backgroundPattern || 'none'}
            onValueChange={(value) => updateSetting('backgroundPattern', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin patrón</SelectItem>
              <SelectItem value="dots">Puntos</SelectItem>
              <SelectItem value="grid">Cuadrícula</SelectItem>
              <SelectItem value="diagonal">Líneas diagonales</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Padding */}
        <div className="space-y-2">
          <Label>Espaciado interno</Label>
          <Select
            value={editedSection.settings.padding || 'normal'}
            onValueChange={(value) => updateSetting('padding', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin espaciado</SelectItem>
              <SelectItem value="compact">Compacto</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="relaxed">Amplio</SelectItem>
              <SelectItem value="spacious">Extra amplio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Border */}
        <div className="flex items-center justify-between">
          <Label>Mostrar borde</Label>
          <Switch
            checked={editedSection.settings.showBorder || false}
            onCheckedChange={(checked) => updateSetting('showBorder', checked)}
          />
        </div>

        {editedSection.settings.showBorder && (
          <div className="space-y-2">
            <Label>Estilo de borde</Label>
            <Select
              value={editedSection.settings.borderStyle || 'subtle'}
              onValueChange={(value) => updateSetting('borderStyle', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="subtle">Sutil</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="strong">Pronunciado</SelectItem>
                <SelectItem value="primary">Color primario</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };

  const renderAnimationFields = () => {
    return (
      <div className="space-y-4">
        {/* Animation Type */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Tipo de animación
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {ANIMATION_OPTIONS.map((anim) => (
              <button
                key={anim.value}
                type="button"
                className={`p-3 text-left rounded-lg border-2 transition-all text-sm ${
                  editedSection.settings.animation === anim.value
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => updateSetting('animation', anim.value)}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Duration */}
        {editedSection.settings.animation && editedSection.settings.animation !== 'none' && (
          <>
            <div className="space-y-2">
              <Label>Duración ({editedSection.settings.animationDuration || 0.5}s)</Label>
              <Slider
                value={[editedSection.settings.animationDuration || 0.5]}
                onValueChange={([value]) => updateSetting('animationDuration', value)}
                min={0.2}
                max={1.5}
                step={0.1}
              />
            </div>

            <div className="space-y-2">
              <Label>Retraso ({editedSection.settings.animationDelay || 0}s)</Label>
              <Slider
                value={[editedSection.settings.animationDelay || 0]}
                onValueChange={([value]) => updateSetting('animationDelay', value)}
                min={0}
                max={1}
                step={0.1}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Animar elementos individualmente</Label>
              <Switch
                checked={editedSection.settings.staggerChildren || false}
                onCheckedChange={(checked) => updateSetting('staggerChildren', checked)}
              />
            </div>

            {editedSection.settings.staggerChildren && (
              <div className="space-y-2">
                <Label>Intervalo entre elementos ({editedSection.settings.staggerDelay || 0.1}s)</Label>
                <Slider
                  value={[editedSection.settings.staggerDelay || 0.1]}
                  onValueChange={([value]) => updateSetting('staggerDelay', value)}
                  min={0.05}
                  max={0.3}
                  step={0.05}
                />
              </div>
            )}
          </>
        )}

        {/* Preview */}
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground text-center">
              La animación se activará cuando el usuario haga scroll y la sección sea visible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar: {editedSection.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre de la sección</Label>
              <Input
                value={editedSection.title}
                onChange={(e) => setEditedSection({ ...editedSection, title: e.target.value })}
              />
            </div>
            
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="content" className="gap-1 text-xs">
                  <Settings2 className="h-3 w-3" />
                  Contenido
                </TabsTrigger>
                <TabsTrigger value="style" className="gap-1 text-xs">
                  <Palette className="h-3 w-3" />
                  Estilo
                </TabsTrigger>
                <TabsTrigger value="animation" className="gap-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Animación
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1 text-xs">
                  <Eye className="h-3 w-3" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-4 space-y-4">
                {renderSettingsFields() || (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No hay configuraciones de contenido para esta sección.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="style" className="mt-4">
                {renderStyleFields()}
              </TabsContent>
              
              <TabsContent value="animation" className="mt-4">
                {renderAnimationFields()}
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <SectionPreview 
                  section={editedSection} 
                  primaryColor={primaryColor}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
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
