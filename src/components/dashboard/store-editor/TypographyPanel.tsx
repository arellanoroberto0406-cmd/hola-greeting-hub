import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Type, RotateCcw } from 'lucide-react';
import { DEFAULT_GLOBAL_STYLES, FONT_OPTIONS, type GlobalStyles, type FontFamily } from '@/types/storeLayout';
import { fontName, fontWeights, resolvedWeight, typographyVariables, useStoreFonts } from '@/lib/storeTypography';

const WEIGHT_LABELS: Record<number, string> = { 300: 'Ligero', 400: 'Normal', 500: 'Medio', 600: 'Seminegrita', 700: 'Negrita', 800: 'Extra negrita' };

export function TypographyPanel({ styles, onChange }: { styles: GlobalStyles; onChange: (styles: GlobalStyles) => void }) {
  useStoreFonts(styles);
  const reset = () => {
    const next = { ...styles, headingFont: DEFAULT_GLOBAL_STYLES.headingFont, bodyFont: DEFAULT_GLOBAL_STYLES.bodyFont };
    delete next.headingSize; delete next.bodySize; delete next.headingWeight; delete next.bodyWeight;
    onChange(next);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-lg"><Type className="h-5 w-5 text-primary" />Tipografías</CardTitle>
        <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Restablecer</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {(['heading', 'body'] as const).map(role => {
            const title = role === 'heading' ? 'Títulos' : 'Textos';
            const fontKey = role === 'heading' ? 'headingFont' : 'bodyFont';
            const sizeKey = role === 'heading' ? 'headingSize' : 'bodySize';
            const weightKey = role === 'heading' ? 'headingWeight' : 'bodyWeight';
            const size = styles[sizeKey] ?? (role === 'heading' ? 32 : 16);
            const weight = resolvedWeight(styles[fontKey], styles[weightKey] ?? (role === 'heading' ? 700 : 400));
            const weights = fontWeights(styles[fontKey]);
            return <div key={role} className="min-w-0 space-y-4">
              <h4 className="font-semibold">{title}</h4>
              <div className="space-y-2">
                <Label htmlFor={`${role}-font`}>Tipografía de {title.toLowerCase()}</Label>
                <Select value={styles[fontKey]} onValueChange={value => {
                  const font = value as FontFamily;
                  onChange({ ...styles, [fontKey]: font, [weightKey]: resolvedWeight(font, weight) });
                }}>
                  <SelectTrigger id={`${role}-font`}><SelectValue /></SelectTrigger>
                  <SelectContent>{FONT_OPTIONS.map(font => <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label htmlFor={`${role}-size`}>Tamaño de {title.toLowerCase()}</Label><output className="text-sm tabular-nums text-muted-foreground">{size} px</output></div>
                <Slider id={`${role}-size`} aria-label={`Tamaño de ${title.toLowerCase()}`} value={[size]} min={role === 'heading' ? 20 : 12} max={role === 'heading' ? 56 : 22} step={1} onValueChange={values => { const value = values[0]; if (value !== undefined) onChange({ ...styles, [sizeKey]: value }); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${role}-weight`}>Grosor de {title.toLowerCase()}</Label>
                <Select value={String(weight)} disabled={weights.length === 1} onValueChange={value => onChange({ ...styles, [weightKey]: Number(value) })}>
                  <SelectTrigger id={`${role}-weight`}><SelectValue /></SelectTrigger>
                  <SelectContent>{weights.map(value => <SelectItem key={value} value={String(value)}>{WEIGHT_LABELS[value] || value}</SelectItem>)}</SelectContent>
                </Select>
                {weights.length === 1 && <p className="text-xs text-muted-foreground">{fontName(styles[fontKey])}: grosor único.</p>}
              </div>
            </div>;
          })}
        </div>
        <div className="space-y-3 overflow-hidden rounded-md border bg-muted/30 p-5" style={typographyVariables(styles)} aria-label="Vista previa de tipografías">
          <h2 className="break-words" style={{ fontFamily: 'var(--store-heading-font)', fontSize: 'var(--store-heading-size)', fontWeight: 'var(--store-heading-weight)', lineHeight: 1.2 }}>Encuentra tu próximo favorito</h2>
          <p className="break-words" style={{ fontFamily: 'var(--store-body-font)', fontSize: 'var(--store-body-size)', fontWeight: 'var(--store-body-weight)', lineHeight: 1.55 }}>Productos elegidos con cuidado para acompañarte todos los días.</p>
        </div>
      </CardContent>
    </Card>
  );
}