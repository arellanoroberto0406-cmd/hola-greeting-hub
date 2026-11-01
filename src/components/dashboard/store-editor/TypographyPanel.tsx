import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Type, RotateCcw, Smartphone, Tablet, Monitor } from 'lucide-react';
import { DEFAULT_GLOBAL_STYLES, FONT_OPTIONS, type GlobalStyles, type FontFamily, type TypographyDevice } from '@/types/storeLayout';
import { fontName, fontWeights, resolvedWeight, useStoreFonts, deviceTypography, updateDeviceTypography } from '@/lib/storeTypography';
import { TypographyDevicePreview } from './TypographyDevicePreview';

const WEIGHT_LABELS: Record<number, string> = { 300: 'Ligero', 400: 'Normal', 500: 'Medio', 600: 'Seminegrita', 700: 'Negrita', 800: 'Extra negrita' };

export function TypographyPanel({ styles, onChange }: { styles: GlobalStyles; onChange: (styles: GlobalStyles) => void }) {
  const [device, setDevice] = useState<TypographyDevice>('mobile');
  const settings = deviceTypography(styles, device);
  useStoreFonts(styles);
  const reset = () => {
    const next = { ...styles, headingFont: DEFAULT_GLOBAL_STYLES.headingFont, bodyFont: DEFAULT_GLOBAL_STYLES.bodyFont };
    delete next.headingSize; delete next.bodySize; delete next.headingWeight; delete next.bodyWeight;
    delete next.responsiveTypography;
    onChange(next);
  };
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2 text-lg"><Type className="h-5 w-5 text-primary" />Tipografías</CardTitle>
        <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="mr-2 h-4 w-4" />Restablecer</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Ajustar tipografías por pantalla">
          {([{ id: 'mobile', label: 'Móvil', icon: Smartphone }, { id: 'tablet', label: 'Tablet', icon: Tablet }, { id: 'desktop', label: 'Escritorio', icon: Monitor }] as const).map(screen => (
            <Button key={screen.id} size="sm" variant={device === screen.id ? 'default' : 'outline'} aria-pressed={device === screen.id} onClick={() => setDevice(screen.id)}><screen.icon className="mr-2 h-4 w-4" />{screen.label}</Button>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {(['heading', 'body'] as const).map(role => {
            const title = role === 'heading' ? 'Títulos' : 'Textos';
            const fontKey = role === 'heading' ? 'headingFont' : 'bodyFont';
            const sizeKey = role === 'heading' ? 'headingSize' : 'bodySize';
            const weightKey = role === 'heading' ? 'headingWeight' : 'bodyWeight';
            const size = settings[sizeKey] ?? (role === 'heading' ? 32 : 16);
            const weight = resolvedWeight(styles[fontKey], settings[weightKey] ?? (role === 'heading' ? 700 : 400));
            const weights = fontWeights(styles[fontKey]);
            return <div key={role} className="min-w-0 space-y-4">
              <h4 className="font-semibold">{title}</h4>
              <div className="space-y-2">
                <Label htmlFor={`${role}-font`}>Tipografía de {title.toLowerCase()}</Label>
                <Select value={styles[fontKey]} onValueChange={value => {
                  const font = value as FontFamily;
                  onChange({ ...styles, [fontKey]: font });
                }}>
                  <SelectTrigger id={`${role}-font`}><SelectValue /></SelectTrigger>
                  <SelectContent>{FONT_OPTIONS.map(font => <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label htmlFor={`${role}-size`}>Tamaño de {title.toLowerCase()}</Label><output className="text-sm tabular-nums text-muted-foreground">{size} px</output></div>
                <Slider id={`${role}-size`} aria-label={`Tamaño de ${title.toLowerCase()}`} value={[size]} min={role === 'heading' ? 20 : 12} max={role === 'heading' ? 56 : 22} step={1} onValueChange={values => { const value = values[0]; if (value !== undefined) onChange(updateDeviceTypography(styles, device, sizeKey, value)); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${role}-weight`}>Grosor de {title.toLowerCase()}</Label>
                <Select value={String(weight)} disabled={weights.length === 1} onValueChange={value => onChange(updateDeviceTypography(styles, device, weightKey, Number(value)))}>
                  <SelectTrigger id={`${role}-weight`}><SelectValue /></SelectTrigger>
                  <SelectContent>{weights.map(value => <SelectItem key={value} value={String(value)}>{WEIGHT_LABELS[value] || value}</SelectItem>)}</SelectContent>
                </Select>
                {weights.length === 1 && <p className="text-xs text-muted-foreground">{fontName(styles[fontKey])}: grosor único.</p>}
              </div>
            </div>;
          })}
        </div>
        <TypographyDevicePreview styles={styles} device={device} onDeviceChange={setDevice} />
      </CardContent>
    </Card>
  );
}