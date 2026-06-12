import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Ticket, Plus, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";

const genCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "PLAN-" + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const emptyForm = {
  code: genCode(),
  plan_id: "",
  billing_cycle: "monthly" as "monthly" | "yearly",
  duration_days: 30,
  max_uses: 1,
  expires_in_days: 30,
  notes: "",
  is_active: true,
};

const ActivationCodesAdminPanel = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["subscription-plans-admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_plans").select("id,name,slug").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: codes, isLoading } = useQuery({
    queryKey: ["admin-activation-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_activation_codes")
        .select("*, subscription_plans:plan_id(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const openCreate = () => {
    setForm({ ...emptyForm, code: genCode(), plan_id: plans?.[0]?.id || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.plan_id) return toast.error("Selecciona un plan");
    if (!form.code.trim()) return toast.error("Código requerido");
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const expires_at = form.expires_in_days > 0
        ? new Date(Date.now() + form.expires_in_days * 86400000).toISOString()
        : null;
      const { error } = await supabase.from("subscription_activation_codes").insert({
        code: form.code.trim().toUpperCase(),
        plan_id: form.plan_id,
        billing_cycle: form.billing_cycle,
        duration_days: Number(form.duration_days),
        max_uses: Number(form.max_uses),
        expires_at,
        notes: form.notes.trim() || null,
        is_active: form.is_active,
        created_by: userData.user?.id,
      });
      if (error) throw error;
      toast.success("Código creado");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-activation-codes"] });
    } catch (err: any) {
      toast.error(err.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este código?")) return;
    const { error } = await supabase.from("subscription_activation_codes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Código eliminado");
    qc.invalidateQueries({ queryKey: ["admin-activation-codes"] });
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("subscription_activation_codes").update({ is_active: !active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-activation-codes"] });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Código copiado"));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2"><Ticket className="h-5 w-5" />Códigos de Activación</CardTitle>
            <CardDescription>Genera códigos para activar planes manualmente (efectivo, WhatsApp, regalos, etc.).</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Nuevo código</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : !codes?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aún no hay códigos generados.</p>
        ) : (
          <div className="space-y-2">
            {codes.map((c) => {
              const exhausted = c.used_count >= c.max_uses;
              const expired = c.expires_at && new Date(c.expires_at) < new Date();
              const now = new Date();
              const expiresAt = c.expires_at ? new Date(c.expires_at) : null;
              const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000) : null;
              const expiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 7 && !expired;
              return (
                <div key={c.id} className={`border rounded-lg p-3 flex items-center justify-between gap-3 ${expired ? 'opacity-60 bg-muted/30 border-destructive/30' : ''} ${expiringSoon ? 'border-amber-300 bg-amber-50/40' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className={`font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded ${expired ? 'line-through text-muted-foreground' : ''}`}>{c.code}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(c.code)}><Copy className="h-3 w-3" /></Button>
                      {!c.is_active && <Badge variant="outline">Inactivo</Badge>}
                      {exhausted && <Badge variant="destructive">Agotado</Badge>}
                      {expired && <Badge variant="destructive">Expirado</Badge>}
                      {expiringSoon && <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-100">Vence en {daysLeft}d</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Plan: {c.subscription_plans?.name || "—"} · {c.duration_days} días ·
                      Usos: {c.used_count}/{c.max_uses}
                      {expired && daysLeft !== null && ` · Venció hace ${Math.abs(daysLeft)} días`}
                      {!expired && expiresAt && ` · Expira ${expiresAt.toLocaleDateString("es-MX")}`}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Switch checked={c.is_active} disabled={expired} onCheckedChange={() => toggleActive(c.id, c.is_active)} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo código de activación</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Código</Label>
              <div className="flex gap-2">
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="font-mono" />
                <Button variant="outline" type="button" onClick={() => setForm({ ...form, code: genCode() })}>Generar</Button>
              </div>
            </div>
            <div>
              <Label>Plan *</Label>
              <Select value={form.plan_id} onValueChange={(v) => setForm({ ...form, plan_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecciona un plan" /></SelectTrigger>
                <SelectContent>
                  {plans?.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Ciclo</Label>
                <Select value={form.billing_cycle} onValueChange={(v: any) => setForm({ ...form, billing_cycle: v, duration_days: v === "yearly" ? 365 : 30 })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duración (días)</Label>
                <Input type="number" min={1} value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Usos máximos</Label>
                <Input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Expira en (días, 0=nunca)</Label>
                <Input type="number" min={0} value={form.expires_in_days} onChange={(e) => setForm({ ...form, expires_in_days: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Para quién, por qué motivo..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Crear código</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ActivationCodesAdminPanel;
