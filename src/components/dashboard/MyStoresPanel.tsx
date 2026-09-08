import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ACCENT_PALETTES, AccentPalette, DEFAULT_GLOBAL_STYLES, DEFAULT_SECTIONS, GlobalStyles, StoreSection } from "@/types/storeLayout";
import { Loader2, Store as StoreIcon, Sun, Moon, Monitor, Layers, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "auto";

interface StoreRow {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
  is_active: boolean | null;
  default_theme: string | null;
}

interface StoreOverview extends StoreRow {
  sections: StoreSection[];
  globalStyles: GlobalStyles;
}

const THEMES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "auto", label: "Auto", icon: Monitor },
];

const MyStoresPanel = ({ userId }: { userId: string | undefined }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["my-stores-overview", userId],
    enabled: !!userId,
    queryFn: async (): Promise<StoreOverview[]> => {
      const { data: storeRows, error } = await supabase
        .from("stores")
        .select("id, name, slug, logo_url, primary_color, is_active, default_theme")
        .eq("owner_id", userId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      const rows = (storeRows || []) as StoreRow[];
      if (rows.length === 0) return [];

      const { data: layouts } = await supabase
        .from("store_layouts")
        .select("store_id, sections")
        .in("store_id", rows.map((r) => r.id));

      return rows.map((row) => {
        const layout = layouts?.find((l) => l.store_id === row.id);
        const raw = layout?.sections as unknown;
        let sections: StoreSection[] = DEFAULT_SECTIONS;
        let globalStyles: GlobalStyles = DEFAULT_GLOBAL_STYLES;
        if (Array.isArray(raw)) {
          sections = raw as StoreSection[];
        } else if (raw && typeof raw === "object") {
          const obj = raw as { sections?: StoreSection[]; globalStyles?: GlobalStyles };
          sections = obj.sections || DEFAULT_SECTIONS;
          globalStyles = { ...DEFAULT_GLOBAL_STYLES, ...(obj.globalStyles || {}) };
        }
        return { ...row, sections, globalStyles };
      });
    },
  });

  const updateTheme = async (store: StoreOverview, theme: ThemeMode) => {
    const { error } = await supabase
      .from("stores")
      .update({ default_theme: theme, dark_mode_enabled: theme !== "light" })
      .eq("id", store.id);
    if (error) {
      toast({ title: "No se pudo guardar el tema", description: error.message, variant: "destructive" });
      return;
    }
    try {
      localStorage.setItem(`store-dark-mode:${store.slug || store.id}`, theme === "auto" ? "" : theme);
      if (theme === "auto") localStorage.removeItem(`store-dark-mode:${store.slug || store.id}`);
    } catch { /* ignore */ }
    toast({ title: "Tema actualizado", description: `${store.name}: ${theme === "light" ? "Claro" : theme === "dark" ? "Oscuro" : "Auto"}` });
    queryClient.invalidateQueries({ queryKey: ["my-stores-overview"] });
    queryClient.invalidateQueries({ queryKey: ["my-store"] });
  };

  const updateAccent = async (store: StoreOverview, accent: AccentPalette) => {
    const payload = { sections: store.sections, globalStyles: { ...store.globalStyles, accentPalette: accent } };
    const { error } = await supabase
      .from("store_layouts")
      .upsert(
        { store_id: store.id, sections: payload as never, updated_at: new Date().toISOString() },
        { onConflict: "store_id" }
      );
    if (error) {
      toast({ title: "No se pudo guardar el acento", description: error.message, variant: "destructive" });
      return;
    }
    try {
      localStorage.setItem(`store-accent-palette:${store.slug || store.id}`, accent);
    } catch { /* ignore */ }
    toast({ title: "Acento actualizado", description: `${store.name}: ${accent}` });
    queryClient.invalidateQueries({ queryKey: ["my-stores-overview"] });
    queryClient.invalidateQueries({ queryKey: ["store-layout"] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">Aún no tienes tiendas creadas.</CardContent></Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stores.map((store) => {
        const theme = (store.default_theme === "dark" || store.default_theme === "light" ? store.default_theme : "auto") as ThemeMode;
        const accent = (store.globalStyles.accentPalette || "champagne") as AccentPalette;
        const visibleSections = store.sections.filter((s) => s.enabled !== false).length;

        return (
          <Card key={store.id} className="overflow-hidden border-border/60">
            <CardContent className="p-5 space-y-5">
              <div className="flex items-start gap-3">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                  style={{ backgroundColor: store.primary_color || "#111" }}
                >
                  {store.logo_url
                    ? <img src={store.logo_url} alt={`Logo de ${store.name}`} className="h-full w-full object-cover" />
                    : <StoreIcon className="h-5 w-5 text-white" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{store.name}</p>
                  <p className="text-xs text-muted-foreground truncate">/{store.slug}</p>
                </div>
                <Badge variant={store.is_active ? "default" : "secondary"}>{store.is_active ? "Activa" : "Pausada"}</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{visibleSections} de {store.sections.length} secciones visibles</span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Tema</p>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <Button
                      key={t.value}
                      size="sm"
                      variant={theme === t.value ? "default" : "outline"}
                      className="flex-1 gap-1.5"
                      onClick={() => updateTheme(store, t.value)}
                    >
                      <t.icon className="h-3.5 w-3.5" />{t.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Acento</p>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PALETTES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      aria-label={`Acento ${p.label}`}
                      aria-pressed={accent === p.value}
                      onClick={() => updateAccent(store, p.value)}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        accent === p.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                      )}
                      style={{ background: `linear-gradient(135deg, ${p.light}, ${p.dark})` }}
                      title={p.label}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Actual: {ACCENT_PALETTES.find((p) => p.value === accent)?.label}
                </p>
              </div>

              <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                <a href={`/${store.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />Ver tienda
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MyStoresPanel;
