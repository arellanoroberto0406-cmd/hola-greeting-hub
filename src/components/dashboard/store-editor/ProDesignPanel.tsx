import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, MousePointer2, Image as ImageIcon, Wand2, Sparkles, Upload, Loader2, Check, Shuffle } from "lucide-react";
import { motion } from "framer-motion";
import { Store } from "@/types/store";
import { GlobalStyles, ButtonAnimation, DEFAULT_GLOBAL_STYLES } from "@/types/storeLayout";
import { useUpdateStore } from "@/hooks/useStores";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProDesignPanelProps {
  store: Store;
  styles: GlobalStyles;
  onChange: (styles: GlobalStyles) => void;
}

/* ---------------- Color helpers ---------------- */
const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};
const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const PALETTES = [
  { name: "Océano", colors: ["#0f766e", "#ecfeff", "#f97316"] },
  { name: "Atardecer", colors: ["#e11d48", "#fef2f2", "#f59e0b"] },
  { name: "Bosque", colors: ["#166534", "#f0fdf4", "#ca8a04"] },
  { name: "Uva", colors: ["#7c3aed", "#f5f3ff", "#ec4899"] },
  { name: "Grafito", colors: ["#111827", "#f3f4f6", "#3b82f6"] },
  { name: "Coral", colors: ["#fb7185", "#fff1f2", "#0ea5e9"] },
  { name: "Mostaza", colors: ["#a16207", "#fefce8", "#0f172a"] },
  { name: "Menta", colors: ["#10b981", "#ecfdf5", "#8b5cf6"] },
];

const BTN_ANIMS: { value: ButtonAnimation; label: string; description: string }[] = [
  { value: "none", label: "Sin animación", description: "Estática" },
  { value: "lift", label: "Elevar", description: "Sube al pasar el cursor" },
  { value: "pulse", label: "Pulso", description: "Latido continuo suave" },
  { value: "glow", label: "Brillo", description: "Aura luminosa al hover" },
  { value: "shimmer", label: "Destello", description: "Barrido de luz" },
  { value: "bounce", label: "Rebote", description: "Salto lúdico" },
  { value: "press", label: "Presión", description: "Se hunde al click" },
];

/* ---------------- Color Section ---------------- */
const ColorLab = ({ store }: { store: Store }) => {
  const update = useUpdateStore();
  const { toast } = useToast();
  const [primary, setPrimary] = useState(store.primary_color || "#6366f1");
  const [secondary, setSecondary] = useState(store.secondary_color || "#f5f5f5");
  const [accent, setAccent] = useState(store.accent_color || "#ec4899");

  useEffect(() => {
    setPrimary(store.primary_color || "#6366f1");
    setSecondary(store.secondary_color || "#f5f5f5");
    setAccent(store.accent_color || "#ec4899");
  }, [store.id]);

  const dirty =
    primary !== store.primary_color ||
    secondary !== store.secondary_color ||
    accent !== store.accent_color;

  const applyPalette = (colors: string[]) => {
    setPrimary(colors[0]); setSecondary(colors[1]); setAccent(colors[2]);
  };

  const mixColors = () => {
    const [h, s, l] = hexToHsl(primary);
    setSecondary(hslToHex(h, Math.max(10, s * 0.15), Math.min(97, l + 40)));
    setAccent(hslToHex((h + 180) % 360, Math.min(90, s + 10), Math.max(40, Math.min(60, l))));
    toast({ title: "Colores mezclados", description: "Secundario y acento generados desde el primario" });
  };

  const randomize = () => {
    const h = Math.floor(Math.random() * 360);
    setPrimary(hslToHex(h, 70, 50));
    setSecondary(hslToHex(h, 25, 95));
    setAccent(hslToHex((h + 150) % 360, 75, 55));
  };

  const save = async () => {
    await update.mutateAsync({ id: store.id, primary_color: primary, secondary_color: secondary, accent_color: accent });
    toast({ title: "Colores guardados", description: "Se aplicaron a tu tienda publicada" });
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="h-11 w-11 rounded-lg border-2 border-border cursor-pointer bg-transparent" />
        </div>
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono uppercase" maxLength={7} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: primary }} />
            Colores de la marca
          </CardTitle>
          <CardDescription>Elige o mezcla los colores base de tu tienda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <ColorPicker label="Primario" value={primary} onChange={setPrimary} />
            <ColorPicker label="Secundario" value={secondary} onChange={setSecondary} />
            <ColorPicker label="Acento" value={accent} onChange={setAccent} />
          </div>

          {/* Live preview strip */}
          <div className="rounded-xl overflow-hidden border shadow-sm">
            <div className="h-24 relative flex items-end p-4"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
              <span className="text-white font-bold text-lg drop-shadow">Vista previa de tu marca</span>
            </div>
            <div className="p-4 flex flex-wrap items-center gap-3" style={{ backgroundColor: secondary }}>
              <button className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-transform hover:scale-105"
                style={{ backgroundColor: primary }}>Comprar ahora</button>
              <button className="px-4 py-2 rounded-lg font-medium border-2 bg-transparent"
                style={{ borderColor: primary, color: primary }}>Ver más</button>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: accent }}>Nuevo</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={mixColors} className="gap-2">
              <Wand2 className="h-4 w-4" /> Mezclar desde primario
            </Button>
            <Button variant="outline" size="sm" onClick={randomize} className="gap-2">
              <Shuffle className="h-4 w-4" /> Aleatorio
            </Button>
            <Button size="sm" onClick={save} disabled={!dirty || update.isPending} className="gap-2 ml-auto">
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Guardar colores
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: primary }} />
            Paletas curadas
          </CardTitle>
          <CardDescription>Aplica una combinación profesional en un click</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            {PALETTES.map((p) => (
              <motion.button key={p.name} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => applyPalette(p.colors)}
                className="group rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all text-left">
                <div className="flex h-16">
                  {p.colors.map((c) => (
                    <div key={c} className="flex-1" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <div className="p-2 bg-muted/50 text-xs font-medium">{p.name}</div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ---------------- Button Animation Section ---------------- */
const ButtonLab = ({ styles, onChange, primaryColor }: { styles: GlobalStyles; onChange: (s: GlobalStyles) => void; primaryColor: string }) => {
  const current = styles.buttonAnimation || "lift";
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MousePointer2 className="h-5 w-5" style={{ color: primaryColor }} />
          Animaciones de botones
        </CardTitle>
        <CardDescription>Se aplican a todos los botones de tu tienda publicada</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BTN_ANIMS.map((anim) => {
            const active = current === anim.value;
            return (
              <div key={anim.value}
                onClick={() => onChange({ ...styles, buttonAnimation: anim.value })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  active ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"
                }`}>
                <div className="flex items-center justify-center h-16 mb-3" data-btn-anim={anim.value}>
                  <button className="store-btn px-5 py-2.5 rounded-lg font-semibold text-white shadow"
                    style={{ backgroundColor: primaryColor }}>
                    Comprar
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{anim.label}</p>
                    <p className="text-xs text-muted-foreground">{anim.description}</p>
                  </div>
                  {active && <Check className="h-4 w-4 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/* ---------------- Image Lab ---------------- */
type ImgSlot = "logo" | "banner";
const SLOT_CFG = {
  logo: { previewW: 280, previewH: 280, outW: 512, outH: 512, aspectClass: "aspect-square max-w-xs mx-auto" },
  banner: { previewW: 360, previewH: 120, outW: 1200, outH: 400, aspectClass: "aspect-[3/1]" },
} as const;

const ImageLab = ({ store }: { store: Store }) => {
  const update = useUpdateStore();
  const { uploadImage, uploading } = useImageUpload();
  const { toast } = useToast();
  const [slot, setSlot] = useState<ImgSlot>("logo");
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [filters, setFilters] = useState({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const cfg = SLOT_CFG[slot];

  const resetTransform = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  useEffect(() => {
    setSrc(slot === "logo" ? store.logo_url || null : store.banner_url || null);
    setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
    resetTransform();
  }, [slot, store.logo_url, store.banner_url]);

  // Load natural size whenever src changes
  useEffect(() => {
    if (!src) { setNatural(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const filterCss = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px)`;

  const onFile = (f: File) => {
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result as string);
    reader.readAsDataURL(f);
    setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0 });
    resetTransform();
  };

  // Clamp offset so image edges don't leave the crop box
  const clampOffset = (o: { x: number; y: number }, z: number) => {
    if (!natural) return o;
    const scale0 = Math.max(cfg.previewW / natural.w, cfg.previewH / natural.h);
    const dispW = natural.w * scale0 * z;
    const dispH = natural.h * scale0 * z;
    const maxX = Math.max(0, (dispW - cfg.previewW) / 2);
    const maxY = Math.max(0, (dispH - cfg.previewH) / 2);
    return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!src) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clampOffset({ x: dragRef.current.ox + dx, y: dragRef.current.oy + dy }, zoom));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
  };

  const onZoomChange = (v: number) => {
    setZoom(v);
    setOffset((o) => clampOffset(o, v));
  };

  const bakeAndSave = async () => {
    if (!src || !natural) return;
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });

      // Compute source crop from preview transform
      const scale0 = Math.max(cfg.previewW / img.naturalWidth, cfg.previewH / img.naturalHeight);
      const z = zoom;
      const srcW = cfg.previewW / (scale0 * z);
      const srcH = cfg.previewH / (scale0 * z);
      const cx = img.naturalWidth / 2 - offset.x / (scale0 * z);
      const cy = img.naturalHeight / 2 - offset.y / (scale0 * z);
      const sx = Math.max(0, Math.min(img.naturalWidth - srcW, cx - srcW / 2));
      const sy = Math.max(0, Math.min(img.naturalHeight - srcH, cy - srcH / 2));

      const canvas = document.createElement("canvas");
      canvas.width = cfg.outW; canvas.height = cfg.outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");
      // Apply filters to baked PNG
      ctx.filter = filterCss;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, srcW, srcH, 0, 0, cfg.outW, cfg.outH);

      const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b as Blob), "image/png", 0.95)!);
      const file = new File([blob], `${slot}-${Date.now()}.png`, { type: "image/png" });
      const url = await uploadImage(file, user.id);
      if (!url) throw new Error("No se pudo subir");

      await update.mutateAsync({ id: store.id, ...(slot === "logo" ? { logo_url: url } : { banner_url: url }) });
      toast({ title: "Imagen actualizada", description: slot === "logo" ? "Logo aplicado" : "Banner aplicado" });
      setSrc(url);
      resetTransform();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setBusy(false);
    }
  };

  // Preview base scale for CSS rendering
  const baseScale = natural ? Math.max(cfg.previewW / natural.w, cfg.previewH / natural.h) : 1;
  const dispW = natural ? natural.w * baseScale : 0;
  const dispH = natural ? natural.h * baseScale : 0;

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" style={{ color: store.primary_color }} />
          Editor de imágenes
        </CardTitle>
        <CardDescription>Sube, recorta y reposiciona con arrastre y zoom. Los filtros se aplican al PNG final.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {(["logo", "banner"] as ImgSlot[]).map((s) => (
            <Button key={s} size="sm" variant={slot === s ? "default" : "outline"} onClick={() => setSlot(s)}>
              {s === "logo" ? "Logo" : "Banner"}
            </Button>
          ))}
        </div>

        <div
          ref={boxRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`relative rounded-xl overflow-hidden border-2 bg-muted/30 mx-auto select-none ${src ? "cursor-grab active:cursor-grabbing" : ""}`}
          style={{ width: cfg.previewW, height: cfg.previewH, touchAction: "none" }}
        >
          {src && natural ? (
            <>
              <img
                src={src}
                alt={slot}
                draggable={false}
                className="absolute top-1/2 left-1/2 pointer-events-none max-w-none"
                style={{
                  width: dispW,
                  height: dispH,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  filter: filterCss,
                }}
              />
              {/* Crop guide */}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-white/40 shadow-[0_0_0_9999px_rgba(0,0,0,0.05)_inset]" />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}
        </div>

        {src && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Zoom</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{zoom.toFixed(2)}x</span>
            </div>
            <Slider value={[zoom]} min={1} max={4} step={0.01} onValueChange={(v) => onZoomChange(v[0])} />
          </div>
        )}

        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Subir imagen
          </Button>
          <Button size="sm" variant="outline" onClick={resetTransform} disabled={!src}>
            Centrar
          </Button>
          <Button size="sm" variant="outline" onClick={() => setFilters({ brightness: 100, contrast: 100, saturate: 100, blur: 0 })}>
            Restablecer filtros
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { key: "brightness", label: "Brillo", min: 50, max: 150 },
            { key: "contrast", label: "Contraste", min: 50, max: 150 },
            { key: "saturate", label: "Saturación", min: 0, max: 200 },
            { key: "blur", label: "Desenfoque", min: 0, max: 10 },
          ] as const).map((f) => (
            <div key={f.key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs">{f.label}</Label>
                <span className="text-xs text-muted-foreground tabular-nums">{filters[f.key]}{f.key === "blur" ? "px" : "%"}</span>
              </div>
              <Slider value={[filters[f.key]]} min={f.min} max={f.max} step={1}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, [f.key]: v[0] }))} />
            </div>
          ))}
        </div>

        <Button onClick={bakeAndSave} disabled={!src || busy || uploading} className="w-full gap-2">
          {(busy || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Guardar {slot === "logo" ? "logo" : "banner"} recortado
        </Button>
      </CardContent>
    </Card>
  );
};

/* ---------------- Main Panel ---------------- */
export const ProDesignPanel = ({ store, styles, onChange }: ProDesignPanelProps) => {
  return (
    <Tabs defaultValue="colors" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="colors" className="gap-2"><Palette className="h-4 w-4" />Colores</TabsTrigger>
        <TabsTrigger value="buttons" className="gap-2"><MousePointer2 className="h-4 w-4" />Botones</TabsTrigger>
        <TabsTrigger value="images" className="gap-2"><ImageIcon className="h-4 w-4" />Imágenes</TabsTrigger>
      </TabsList>
      <TabsContent value="colors"><ColorLab store={store} /></TabsContent>
      <TabsContent value="buttons">
        <ButtonLab styles={styles || DEFAULT_GLOBAL_STYLES} onChange={onChange} primaryColor={store.primary_color || "#6366f1"} />
      </TabsContent>
      <TabsContent value="images"><ImageLab store={store} /></TabsContent>
    </Tabs>
  );
};

export default ProDesignPanel;
