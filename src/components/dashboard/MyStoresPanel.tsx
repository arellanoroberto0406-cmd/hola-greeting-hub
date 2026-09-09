import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ACCENT_PALETTES, AccentPalette, DEFAULT_GLOBAL_STYLES, DEFAULT_SECTIONS, GlobalStyles, StoreSection } from "@/types/storeLayout";
import {
  Check, Copy, ExternalLink, Globe2, Instagram, Layers, Link2, Loader2, Mail,
  MapPin, MessageCircle, Monitor, Moon, Pencil, Phone, Save, Settings2,
  Store as StoreIcon, Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "auto";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  is_active: boolean | null;
  default_theme: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
}

interface StoreOverview extends StoreRow {
  sections: StoreSection[];
  globalStyles: GlobalStyles;
}

interface StoreForm {
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  website_url: string;
}

const PUBLIC_ORIGIN = "https://apptienda.lovable.app";
const THEMES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "auto", label: "Auto", icon: Monitor },
];

const emptyForm: StoreForm = {
  name: "", slug: "", description: "", phone: "", email: "", address: "",
  whatsapp_number: "", instagram_url: "", facebook_url: "", website_url: "",
};

const normalizeSlug = (value: string) => value
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const MyStoresPanel = ({ userId }: { userId: string | undefined }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStore, setSelectedStore] = useState<StoreOverview | null>(null);
  const [form, setForm] = useState<StoreForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["my-stores-overview", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<StoreOverview[]> => {
      if (!userId) return [];
      const { data: storeRows, error } = await supabase
        .from("stores")
        .select("id, name, slug, description, logo_url, primary_color, is_active, default_theme, phone, email, address, whatsapp_number, instagram_url, facebook_url, website_url")
        .eq("owner_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (storeRows || []) as StoreRow[];
      if (rows.length === 0) return [];

      const { data: layouts } = await supabase
        .from("store_layouts")
        .select("store_id, sections")
        .in("store_id", rows.map((row) => row.id));

      return rows.map((row) => {
        const layout = layouts?.find((item) => item.store_id === row.id);
        const raw = layout?.sections as unknown;
        let sections: StoreSection[] = DEFAULT_SECTIONS;
        let globalStyles: GlobalStyles = DEFAULT_GLOBAL_STYLES;
        if (Array.isArray(raw)) sections = raw as StoreSection[];
        else if (raw && typeof raw === "object") {
          const value = raw as { sections?: StoreSection[]; globalStyles?: GlobalStyles };
          sections = value.sections || DEFAULT_SECTIONS;
          globalStyles = { ...DEFAULT_GLOBAL_STYLES, ...(value.globalStyles || {}) };
        }
        return { ...row, sections, globalStyles };
      });
    },
  });

  const totals = useMemo(() => ({
    stores: stores?.length || 0,
    active: stores?.filter((store) => store.is_active).length || 0,
    domains: stores?.filter((store) => Boolean(store.website_url)).length || 0,
  }), [stores]);

  const refreshStores = () => {
    queryClient.invalidateQueries({ queryKey: ["my-stores-overview"] });
    queryClient.invalidateQueries({ queryKey: ["my-store"] });
  };

  const openSettings = (store: StoreOverview) => {
    setSelectedStore(store);
    setForm({
      name: store.name,
      slug: store.slug,
      description: store.description || "",
      phone: store.phone || "",
      email: store.email || "",
      address: store.address || "",
      whatsapp_number: store.whatsapp_number || "",
      instagram_url: store.instagram_url || "",
      facebook_url: store.facebook_url || "",
      website_url: store.website_url || "",
    });
  };

  const setField = (field: keyof StoreForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const saveStoreSettings = async () => {
    if (!selectedStore || !form.name.trim() || !form.slug.trim()) {
      toast({ title: "Faltan datos", description: "El nombre y el enlace de la tienda son obligatorios.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const payload = {
      name: form.name.trim(), slug: normalizeSlug(form.slug), description: form.description.trim() || null,
      phone: form.phone.trim() || null, email: form.email.trim() || null, address: form.address.trim() || null,
      whatsapp_number: form.whatsapp_number.trim() || null, instagram_url: form.instagram_url.trim() || null,
      facebook_url: form.facebook_url.trim() || null, website_url: form.website_url.trim() || null,
    };
    const { error } = await supabase.from("stores").update(payload).eq("id", selectedStore.id);
    setIsSaving(false);
    if (error) {
      toast({ title: "No se pudo guardar", description: error.message.includes("duplicate") ? "Ese enlace ya pertenece a otra tienda." : error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Configuración guardada", description: `${payload.name} ya tiene sus datos actualizados.` });
    setSelectedStore(null);
    refreshStores();
  };

  const updateTheme = async (store: StoreOverview, theme: ThemeMode) => {
    const { error } = await supabase.from("stores").update({ default_theme: theme, dark_mode_enabled: theme !== "light" }).eq("id", store.id);
    if (error) return toast({ title: "No se pudo guardar el tema", description: error.message, variant: "destructive" });
    try {
      if (theme === "auto") localStorage.removeItem(`store-dark-mode:${store.slug || store.id}`);
      else localStorage.setItem(`store-dark-mode:${store.slug || store.id}`, theme);
    } catch { /* Browser storage is optional. */ }
    toast({ title: "Tema actualizado", description: `${store.name}: ${theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Auto"}` });
    refreshStores();
  };

  const updateAccent = async (store: StoreOverview, accent: AccentPalette) => {
    const payload = { sections: store.sections, globalStyles: { ...store.globalStyles, accentPalette: accent } };
    const { error } = await supabase.from("store_layouts").upsert({ store_id: store.id, sections: payload as never, updated_at: new Date().toISOString() }, { onConflict: "store_id" });
    if (error) return toast({ title: "No se pudo guardar el acento", description: error.message, variant: "destructive" });
    try { localStorage.setItem(`store-accent-palette:${store.slug || store.id}`, accent); } catch { /* Browser storage is optional. */ }
    toast({ title: "Acento actualizado", description: `${store.name}: ${accent}` });
    refreshStores();
    queryClient.invalidateQueries({ queryKey: ["store-layout"] });
  };

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!stores?.length) return <Card className="dashboard-panel"><CardContent className="py-12 text-center text-muted-foreground">Aún no tienes tiendas creadas.</CardContent></Card>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <Summary label="Tiendas" value={totals.stores} icon={StoreIcon} />
        <Summary label="Activas" value={totals.active} icon={Check} />
        <Summary label="Dominios" value={totals.domains} icon={Globe2} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {stores.map((store) => {
          const theme = (store.default_theme === "dark" || store.default_theme === "light" ? store.default_theme : "auto") as ThemeMode;
          const accent = (store.globalStyles.accentPalette || "champagne") as AccentPalette;
          const visibleSections = store.sections.filter((section) => section.enabled !== false).length;
          const publicUrl = `${PUBLIC_ORIGIN}/tienda/${store.slug}`;
          return (
            <Card key={store.id} className="dashboard-panel overflow-hidden">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary">
                    {store.logo_url ? <img src={store.logo_url} alt={`Logo de ${store.name}`} className="h-full w-full object-cover" /> : <StoreIcon className="h-5 w-5 text-primary-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1"><p className="truncate text-lg font-bold">{store.name}</p><p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><Layers className="h-3.5 w-3.5" />{visibleSections} secciones visibles</p></div>
                  <Badge variant={store.is_active ? "default" : "secondary"}>{store.is_active ? "Activa" : "Pausada"}</Badge>
                </div>

                <div className="rounded-md border border-border/70 bg-secondary/35 p-3">
                  <div className="mb-2 flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /><p className="text-xs font-semibold uppercase text-muted-foreground">Enlace publicado</p></div>
                  <p className="truncate text-sm font-medium" title={publicUrl}>{publicUrl}</p>
                  {store.website_url && <p className="mt-1 truncate text-xs text-emerald-400"><Globe2 className="mr-1 inline h-3 w-3" />Dominio registrado: {store.website_url}</p>}
                  <div className="mt-3 flex gap-2"><CopyButton url={publicUrl} /><Button size="sm" className="flex-1 gap-2" asChild><a href={publicUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Abrir tienda</a></Button></div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Tema</p><div className="flex gap-1">{THEMES.map((item) => <Button key={item.value} size="sm" variant={theme === item.value ? "default" : "outline"} className="flex-1 gap-1" onClick={() => updateTheme(store, item.value)}><item.icon className="h-3.5 w-3.5" />{item.label}</Button>)}</div></div>
                  <div><p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Acento</p><div className="flex flex-wrap gap-2">{ACCENT_PALETTES.map((palette) => <button key={palette.value} type="button" aria-label={`Acento ${palette.label}`} aria-pressed={accent === palette.value} onClick={() => updateAccent(store, palette.value)} className={cn("h-8 w-8 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", accent === palette.value ? "scale-110 border-foreground" : "border-transparent hover:scale-105")} style={{ background: `linear-gradient(135deg, ${palette.light}, ${palette.dark})` }} title={palette.label} />)}</div></div>
                </div>

                <Button variant="outline" className="w-full gap-2" onClick={() => openSettings(store)}><Settings2 className="h-4 w-4" />Configurar tienda</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={Boolean(selectedStore)} onOpenChange={(open) => { if (!open) setSelectedStore(null); }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Pencil className="h-5 w-5 text-primary" />Configurar {selectedStore?.name}</DialogTitle><DialogDescription>Administra la información que verán tus clientes.</DialogDescription></DialogHeader>
          <Tabs defaultValue="store" className="mt-2">
            <TabsList className="grid h-auto w-full grid-cols-3"><TabsTrigger value="store">Tienda</TabsTrigger><TabsTrigger value="domain">Dominio</TabsTrigger><TabsTrigger value="contact">Contacto</TabsTrigger></TabsList>
            <TabsContent value="store" className="space-y-4 pt-3">
              <Field label="Nombre de la tienda"><Input value={form.name} onChange={(event) => setField("name", event.target.value)} /></Field>
              <Field label="Descripción"><Textarea value={form.description} onChange={(event) => setField("description", event.target.value)} placeholder="Cuenta a tus clientes qué vendes y qué hace especial a tu tienda." /></Field>
            </TabsContent>
            <TabsContent value="domain" className="space-y-4 pt-3">
              <Field label="Enlace de APP TIENDA"><div className="flex"><span className="flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">apptienda.lovable.app/tienda/</span><Input className="rounded-l-none" value={form.slug} onChange={(event) => setField("slug", normalizeSlug(event.target.value))} /></div></Field>
              <div className="rounded-md border border-border bg-secondary/30 p-4"><div className="flex gap-3"><Globe2 className="mt-0.5 h-5 w-5 text-primary" /><div><p className="font-semibold">Dominio propio</p><p className="mt-1 text-xs text-muted-foreground">Registra aquí el dominio que quieres usar. La conexión técnica se completa desde la configuración de publicación.</p></div></div><Field label="Dominio o sitio web"><Input value={form.website_url} onChange={(event) => setField("website_url", event.target.value)} placeholder="https://mitienda.com" /></Field></div>
            </TabsContent>
            <TabsContent value="contact" className="space-y-4 pt-3">
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Teléfono" icon={Phone}><Input value={form.phone} onChange={(event) => setField("phone", event.target.value)} placeholder="+52 669 000 0000" /></Field><Field label="Correo" icon={Mail}><Input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} placeholder="hola@mitienda.com" /></Field></div>
              <Field label="Dirección" icon={MapPin}><Input value={form.address} onChange={(event) => setField("address", event.target.value)} placeholder="Dirección visible para tus clientes" /></Field>
              <Field label="WhatsApp" icon={MessageCircle}><Input value={form.whatsapp_number} onChange={(event) => setField("whatsapp_number", event.target.value)} placeholder="+52 669 000 0000" /></Field>
              <div className="grid gap-4 sm:grid-cols-2"><Field label="Instagram" icon={Instagram}><Input value={form.instagram_url} onChange={(event) => setField("instagram_url", event.target.value)} placeholder="https://instagram.com/tu-tienda" /></Field><Field label="Facebook"><Input value={form.facebook_url} onChange={(event) => setField("facebook_url", event.target.value)} placeholder="https://facebook.com/tu-tienda" /></Field></div>
            </TabsContent>
          </Tabs>
          <DialogFooter><Button variant="outline" onClick={() => setSelectedStore(null)}>Cancelar</Button><Button onClick={saveStoreSettings} disabled={isSaving} className="gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Guardar configuración</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Summary = ({ label, value, icon: Icon }: { label: string; value: number; icon: typeof StoreIcon }) => <Card className="dashboard-panel"><CardContent className="flex items-center gap-3 p-4"><div className="dashboard-metric-icon hidden sm:flex"><Icon className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div></CardContent></Card>;

const Field = ({ label, icon: Icon, children }: { label: string; icon?: typeof Phone; children: ReactNode }) => <div className="space-y-2"><Label className="flex items-center gap-1.5">{Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}{label}</Label>{children}</div>;

const CopyButton = ({ url }: { url: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Enlace copiado", description: "Ya puedes compartir tu tienda." });
      window.setTimeout(() => setCopied(false), 2000);
    } catch { toast({ title: "No se pudo copiar", variant: "destructive" }); }
  };
  return <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copiado" : "Copiar"}</Button>;
};

export default MyStoresPanel;