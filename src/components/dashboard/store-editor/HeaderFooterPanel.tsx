import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Layout, Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";
import { Store } from "@/types/store";

export interface HeaderFooterValues {
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  whatsapp_number: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
  tiktok_url: string;
}

export const buildHeaderFooterValues = (store: Store): HeaderFooterValues => ({
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

interface Props {
  store: Store;
  values: HeaderFooterValues;
  onChange: (values: HeaderFooterValues) => void;
}

const HeaderFooterPanel = ({ store, values, onChange }: Props) => {
  const set = (k: keyof HeaderFooterValues, v: string) => onChange({ ...values, [k]: v });

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
            <Input value={values.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción / slogan</Label>
            <Textarea rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Layout className="h-5 w-5 rotate-180" style={{ color: store.primary_color }} />
            Pie de página
          </CardTitle>
          <CardDescription>
            Datos de contacto y redes sociales. Se guardan con el botón "Guardar cambios" del editor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+52 55 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label>Email de contacto</Label>
              <Input type="email" value={values.email} onChange={(e) => set("email", e.target.value)} placeholder="hola@mitienda.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Dirección</Label>
            <Input value={values.address} onChange={(e) => set("address", e.target.value)} placeholder="Calle, ciudad, país" />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp (con lada)</Label>
            <Input value={values.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="5215512345678" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 pt-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Instagram className="h-4 w-4" /> Instagram</Label>
              <Input value={values.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} placeholder="https://instagram.com/…" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Facebook className="h-4 w-4" /> Facebook</Label>
              <Input value={values.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} placeholder="https://facebook.com/…" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Twitter className="h-4 w-4" /> Twitter / X</Label>
              <Input value={values.twitter_url} onChange={(e) => set("twitter_url", e.target.value)} placeholder="https://x.com/…" />
            </div>
            <div className="space-y-2">
              <Label>TikTok</Label>
              <Input value={values.tiktok_url} onChange={(e) => set("tiktok_url", e.target.value)} placeholder="https://tiktok.com/@…" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderFooterPanel;
