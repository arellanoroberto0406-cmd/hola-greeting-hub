import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layout, Loader2, Check, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Store } from "@/types/store";
import { useUpdateStore } from "@/hooks/useStores";
import { useToast } from "@/hooks/use-toast";

interface Props {
  store: Store;
}

const HeaderFooterPanel = ({ store }: Props) => {
  const update = useUpdateStore();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: store.name || "",
    description: store.description || "",
    phone: store.phone || "",
    email: store.email || "",
    address: store.address || "",
    whatsapp_number: store.whatsapp_number || "",
    instagram_url: store.instagram_url || "",
    facebook_url: store.facebook_url || "",
    twitter_url: store.twitter_url || "",
    tiktok_url: store.tiktok_url || "",
  });

  useEffect(() => {
    setForm({
      name: store.name || "",
      description: store.description || "",
      phone: store.phone || "",
      email: store.email || "",
      address: store.address || "",
      whatsapp_number: store.whatsapp_number || "",
      instagram_url: store.instagram_url || "",
      facebook_url: store.facebook_url || "",
      twitter_url: store.twitter_url || "",
      tiktok_url: store.tiktok_url || "",
    });
  }, [store.id]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    await update.mutateAsync({ id: store.id, ...form });
    toast({ title: "Encabezado y pie guardados", description: "Se aplicaron a tu tienda publicada" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="h-5 w-5" style={{ color: store.primary_color }} />
            Encabezado de la tienda
          </CardTitle>
          <CardDescription>Nombre y descripción visibles en el navbar y meta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre de la tienda</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción / slogan</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="h-5 w-5 rotate-180" style={{ color: store.primary_color }} />
            Pie de página
          </CardTitle>
          <CardDescription>Datos de contacto y redes sociales que aparecen en el footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+52 55 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label>Email de contacto</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="hola@mitienda.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, ciudad, país" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp (con lada)</Label>
            <Input value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="5215512345678" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
              <Input value={form.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/…" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</Label>
              <Input value={form.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/…" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Twitter className="h-4 w-4" /> Twitter / X</Label>
              <Input value={form.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://x.com/…" />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={form.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@…" />
            </div>
          </div>

          <Button onClick={save} disabled={update.isPending} className="w-full gap-2">
            {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Guardar encabezado y pie
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderFooterPanel;
