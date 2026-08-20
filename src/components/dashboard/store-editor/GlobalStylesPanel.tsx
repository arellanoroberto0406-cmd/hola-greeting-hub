import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  GlobalStyles, 
  FontFamily, 
  FONT_OPTIONS,
  DEFAULT_GLOBAL_STYLES,
  ACCENT_PALETTES
} from "@/types/storeLayout";
import { Type, Radius, Layers, MousePointer, Square, Palette } from "lucide-react";

interface GlobalStylesPanelProps {
  styles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
  primaryColor?: string;
}

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sin bordes', preview: '0px' },
  { value: 'sm', label: 'Pequeño', preview: '4px' },
  { value: 'md', label: 'Mediano', preview: '8px' },
  { value: 'lg', label: 'Grande', preview: '12px' },
  { value: 'xl', label: 'Extra grande', preview: '16px' },
  { value: 'full', label: 'Completo', preview: '9999px' },
];

const SPACING_OPTIONS = [
  { value: 'compact', label: 'Compacto', description: 'Menor espacio entre secciones' },
  { value: 'normal', label: 'Normal', description: 'Espaciado estándar' },
  { value: 'relaxed', label: 'Relajado', description: 'Más espacio entre secciones' },
  { value: 'spacious', label: 'Amplio', description: 'Máximo espacio entre secciones' },
];

const BUTTON_STYLE_OPTIONS = [
  { value: 'solid', label: 'Sólido', description: 'Botones con fondo completo' },
  { value: 'outline', label: 'Borde', description: 'Botones solo con borde' },
  { value: 'ghost', label: 'Fantasma', description: 'Botones sin fondo ni borde' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Sin sombra' },
  { value: 'sm', label: 'Sutil' },
  { value: 'md', label: 'Mediana' },
  { value: 'lg', label: 'Pronunciada' },
  { value: 'xl', label: 'Dramática' },
];

export const GlobalStylesPanel = ({ 
  styles = DEFAULT_GLOBAL_STYLES, 
  onChange, 
  primaryColor = '#000000' 
}: GlobalStylesPanelProps) => {
  const updateStyle = <K extends keyof GlobalStyles>(key: K, value: GlobalStyles[K]) => {
    onChange({ ...styles, [key]: value });
  };

  const activePalette = styles.accentPalette || 'champagne';

  return (
    <div className="space-y-6">
      {/* Accent palette */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: primaryColor }} />
            Paleta de acentos
          </CardTitle>
          <CardDescription>
            Define el color de acento del estilo Bento Prestige (se adapta a modo claro y oscuro)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ACCENT_PALETTES.map((palette) => (
              <button
                key={palette.value}
                type="button"
                aria-pressed={activePalette === palette.value}
                onClick={() => updateStyle('accentPalette', palette.value)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  activePalette === palette.value
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: palette.light }}
                  />
                  <span
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: palette.dark }}
                  />
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Claro / Oscuro
                  </span>
                </div>
                <p className="font-medium text-sm">{palette.label}</p>
                <p className="text-xs text-muted-foreground">{palette.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5" style={{ color: primaryColor }} />
            Tipografía
          </CardTitle>
          <CardDescription>
            Personaliza las fuentes de tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Fuente de títulos</Label>
              <Select
                value={styles.headingFont}
                onValueChange={(value) => updateStyle('headingFont', value as FontFamily)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: `'${font.label}', sans-serif` }}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p 
                className="text-2xl font-bold mt-2" 
                style={{ fontFamily: `'${FONT_OPTIONS.find(f => f.value === styles.headingFont)?.label}', sans-serif` }}
              >
                Vista previa de título
              </p>
            </div>

            <div className="space-y-2">
              <Label>Fuente del cuerpo</Label>
              <Select
                value={styles.bodyFont}
                onValueChange={(value) => updateStyle('bodyFont', value as FontFamily)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fuente" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: `'${font.label}', sans-serif` }}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p 
                className="text-sm text-muted-foreground mt-2"
                style={{ fontFamily: `'${FONT_OPTIONS.find(f => f.value === styles.bodyFont)?.label}', sans-serif` }}
              >
                Vista previa del texto del cuerpo. Este es un ejemplo de cómo se verá el texto en tu tienda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Radius className="h-5 w-5" style={{ color: primaryColor }} />
            Bordes redondeados
          </CardTitle>
          <CardDescription>
            Define qué tan redondeados serán los elementos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Select
              value={styles.borderRadius}
              onValueChange={(value) => updateStyle('borderRadius', value as GlobalStyles['borderRadius'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar radio" />
              </SelectTrigger>
              <SelectContent>
                {BORDER_RADIUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label} ({option.preview})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Preview */}
            <div className="flex items-center gap-4 mt-4">
              {BORDER_RADIUS_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className={`w-12 h-12 border-2 transition-all cursor-pointer ${
                    styles.borderRadius === option.value 
                      ? 'border-primary shadow-md scale-110' 
                      : 'border-muted hover:border-muted-foreground'
                  }`}
                  style={{ 
                    borderRadius: option.preview,
                    backgroundColor: styles.borderRadius === option.value ? primaryColor : 'transparent'
                  }}
                  onClick={() => updateStyle('borderRadius', option.value as GlobalStyles['borderRadius'])}
                  title={option.label}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Spacing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" style={{ color: primaryColor }} />
            Espaciado entre secciones
          </CardTitle>
          <CardDescription>
            Controla el espacio vertical entre las secciones de tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {SPACING_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  styles.sectionSpacing === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => updateStyle('sectionSpacing', option.value as GlobalStyles['sectionSpacing'])}
              >
                <div>
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                <div 
                  className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    styles.sectionSpacing === option.value 
                      ? 'border-primary' 
                      : 'border-muted-foreground'
                  }`}
                >
                  {styles.sectionSpacing === option.value && (
                    <div 
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Style */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <MousePointer className="h-5 w-5" style={{ color: primaryColor }} />
            Estilo de botones
          </CardTitle>
          <CardDescription>
            Define el estilo visual de los botones en tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {BUTTON_STYLE_OPTIONS.map((option) => (
              <div
                key={option.value}
                className={`text-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  styles.buttonStyle === option.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
                onClick={() => updateStyle('buttonStyle', option.value as GlobalStyles['buttonStyle'])}
              >
                {/* Button Preview */}
                <div className="mb-3 flex justify-center">
                  {option.value === 'solid' && (
                    <button
                      className="px-4 py-2 text-white text-sm font-medium rounded-md"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Comprar
                    </button>
                  )}
                  {option.value === 'outline' && (
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md border-2 bg-transparent"
                      style={{ borderColor: primaryColor, color: primaryColor }}
                    >
                      Comprar
                    </button>
                  )}
                  {option.value === 'ghost' && (
                    <button
                      className="px-4 py-2 text-sm font-medium rounded-md bg-transparent hover:bg-muted"
                      style={{ color: primaryColor }}
                    >
                      Comprar
                    </button>
                  )}
                </div>
                <p className="font-medium text-sm">{option.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Card Shadows */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Square className="h-5 w-5" style={{ color: primaryColor }} />
            Sombra de tarjetas
          </CardTitle>
          <CardDescription>
            Ajusta la profundidad de las sombras en las tarjetas de productos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-5">
            {SHADOW_OPTIONS.map((option) => {
              const shadowStyles: Record<string, string> = {
                none: 'shadow-none',
                sm: 'shadow-sm',
                md: 'shadow-md',
                lg: 'shadow-lg',
                xl: 'shadow-xl',
              };
              
              return (
                <div
                  key={option.value}
                  className={`text-center p-4 rounded-lg cursor-pointer transition-all ${
                    styles.cardShadow === option.value 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : ''
                  }`}
                  onClick={() => updateStyle('cardShadow', option.value as GlobalStyles['cardShadow'])}
                >
                  <div className={`w-full aspect-square bg-card rounded-lg border ${shadowStyles[option.value]} mb-2`} />
                  <p className="text-xs font-medium">{option.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalStylesPanel;
