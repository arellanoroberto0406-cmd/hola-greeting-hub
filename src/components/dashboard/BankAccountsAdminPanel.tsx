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
import { Landmark, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  clabe: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  notes: string | null;
  is_active: boolean;
  sort_order: number;
}

const emptyForm = {
  bank_name: "",
  account_holder: "",
  clabe: "",
  account_number: "",
  qr_image_url: "",
  notes: "",
  is_active: true,
  sort_order: 0,
};

const BankAccountsAdminPanel = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["admin-bank-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_bank_accounts")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as BankAccount[];
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (acc: BankAccount) => {
    setEditing(acc);
    setForm({
      bank_name: acc.bank_name,
      account_holder: acc.account_holder,
      clabe: acc.clabe || "",
      account_number: acc.account_number || "",
      qr_image_url: acc.qr_image_url || "",
      notes: acc.notes || "",
      is_active: acc.is_active,
      sort_order: acc.sort_order,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.bank_name.trim() || !form.account_holder.trim()) {
      toast.error("Banco y titular son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bank_name: form.bank_name.trim(),
        account_holder: form.account_holder.trim(),
        clabe: form.clabe.trim() || null,
        account_number: form.account_number.trim() || null,
        qr_image_url: form.qr_image_url.trim() || null,
        notes: form.notes.trim() || null,
        is_active: form.is_active,
        sort_order: Number(form.sort_order) || 0,
      };
      const { error } = editing
        ? await supabase.from("platform_bank_accounts").update(payload).eq("id", editing.id)
        : await supabase.from("platform_bank_accounts").insert(payload);
      if (error) throw error;
      toast.success(editing ? "Cuenta actualizada" : "Cuenta agregada");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["platform-bank-accounts"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (acc: BankAccount) => {
    if (!confirm(`¿Eliminar ${acc.bank_name}?`)) return;
    const { error } = await supabase.from("platform_bank_accounts").delete().eq("id", acc.id);
    if (error) return toast.error(error.message);
    toast.success("Cuenta eliminada");
    qc.invalidateQueries({ queryKey: ["admin-bank-accounts"] });
    qc.invalidateQueries({ queryKey: ["platform-bank-accounts"] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Cuentas Bancarias</CardTitle>
            <CardDescription>Cuentas donde los clientes pueden transferir para activar planes. Puedes agregar QR de CoDi.</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" />Agregar cuenta</Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : !accounts?.length ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aún no hay cuentas bancarias.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div key={acc.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{acc.bank_name}</span>
                    {acc.is_active ? <Badge variant="secondary" className="text-xs">Activa</Badge> : <Badge variant="outline" className="text-xs">Inactiva</Badge>}
                    {acc.qr_image_url && <Badge variant="outline" className="text-xs">QR CoDi</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {acc.account_holder} {acc.clabe && `· CLABE ${acc.clabe}`}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(acc)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(acc)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar cuenta" : "Nueva cuenta bancaria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Banco *</Label>
              <Input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="BBVA, SPIN Oxxo, etc." />
            </div>
            <div>
              <Label>Titular *</Label>
              <Input value={form.account_holder} onChange={(e) => setForm({ ...form, account_holder: e.target.value })} />
            </div>
            <div>
              <Label>CLABE (18 dígitos)</Label>
              <Input value={form.clabe} onChange={(e) => setForm({ ...form, clabe: e.target.value })} maxLength={18} />
            </div>
            <div>
              <Label>Número de cuenta</Label>
              <Input value={form.account_number} onChange={(e) => setForm({ ...form, account_number: e.target.value })} />
            </div>
            <div>
              <Label>URL imagen QR CoDi (opcional)</Label>
              <Input value={form.qr_image_url} onChange={(e) => setForm({ ...form, qr_image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label>Orden</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Activa</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BankAccountsAdminPanel;
