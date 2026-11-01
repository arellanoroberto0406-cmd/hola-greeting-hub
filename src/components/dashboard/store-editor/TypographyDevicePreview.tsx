import { useLayoutEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { typographyVariables } from '@/lib/storeTypography';
import type { GlobalStyles, TypographyDevice } from '@/types/storeLayout';
import '@/styles/typography-preview.css';

const DEVICES = [
  { id: 'mobile', label: 'Móvil', width: 390, icon: Smartphone },
  { id: 'tablet', label: 'Tablet', width: 768, icon: Tablet },
  { id: 'desktop', label: 'Escritorio', width: 1280, icon: Monitor },
] as const;

export function TypographyDevicePreview({ styles, device: selectedDevice, onDeviceChange }: { styles: GlobalStyles; device?: TypographyDevice; onDeviceChange?: (device: TypographyDevice) => void }) {
  const [localDevice, setLocalDevice] = useState<TypographyDevice>('mobile');
  const device = DEVICES.find(option => option.id === (selectedDevice ?? localDevice)) ?? DEVICES[0];
  const [actualSize, setActualSize] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(390);
  const [contentHeight, setContentHeight] = useState(420);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;
    const observer = new ResizeObserver(() => {
      setAvailableWidth(container.clientWidth);
      setContentHeight(content.offsetHeight);
    });
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const scale = actualSize ? 1 : Math.min(1, availableWidth / device.width);

  return (
    <section className="min-w-0 space-y-3" aria-label="Vista previa de tipografías">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">Vista previa</h4>
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Tamaño de pantalla">
          {DEVICES.map(option => (
            <Button key={option.id} size="sm" variant={device.id === option.id ? 'default' : 'ghost'}
              aria-pressed={device.id === option.id} onClick={() => { setLocalDevice(option.id); onDeviceChange?.(option.id); }}>
              <option.icon className="mr-2 h-4 w-4" />{option.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums">{device.label} · {device.width} px</span>
        <Button size="sm" variant="outline" aria-pressed={actualSize}
          aria-label={actualSize ? 'Ajustar vista previa al panel' : 'Ver vista previa al tamaño real'}
          onClick={() => setActualSize(value => !value)}>
          <Scan className="mr-2 h-4 w-4" />{actualSize ? 'Tamaño real · 100%' : 'Ajustada al panel'}
        </Button>
      </div>
      <div ref={containerRef} className="max-h-[560px] min-w-0 overflow-auto rounded-md border bg-muted/30">
        <div className="relative mx-auto" style={{ width: device.width * scale, height: contentHeight * scale }}>
          <div ref={contentRef} className="typography-device-sample bg-background text-foreground"
            data-preview-device={device.id}
            style={{ ...typographyVariables(styles, device.id), width: device.width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <header className="border-b"><span>Mi tienda</span></header>
            <div className="typography-device-content">
              <span className="text-muted-foreground">Nueva colección</span>
              <h2>Encuentra tu próximo favorito</h2>
              <p className="text-muted-foreground">Productos elegidos con cuidado para acompañarte todos los días.</p>
              <div className="typography-device-details border-t">
                <h3>Detalles que hacen la diferencia</h3>
                <p>Descubre nuestra selección y encuentra algo especial para ti. Calidad y atención en cada pedido.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}