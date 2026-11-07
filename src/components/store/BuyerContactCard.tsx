import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserRound, Mail, Phone, ShieldCheck, Pencil, Save, Loader2 } from 'lucide-react';
import { buyerContactSchema } from '@/lib/buyerContact';
import { toast } from 'sonner';

export type BuyerContact = { full_name: string; email: string; phone: string };
export function BuyerContactDetails({ contact }: { contact: BuyerContact }) {
  return <div className="space-y-3 min-w-0">
    <p className="font-semibold flex items-start gap-2 break-words"><UserRound className="h-4 w-4 mt-1 shrink-0" />{contact.full_name}</p>
    <a className="text-sm text-muted-foreground flex items-start gap-2 break-all hover:text-primary" href={`mailto:${contact.email}`}><Mail className="h-4 w-4 mt-0.5 shrink-0" />{contact.email}</a>
    {contact.phone && <a className="text-sm text-muted-foreground flex items-center gap-2 hover:text-primary" href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`}><Phone className="h-4 w-4 shrink-0" />{contact.phone}</a>}
  </div>;
}
export default function BuyerContactCard({ storeId, userId, initial }: { storeId: string; userId: string; initial: BuyerContact }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BuyerContact | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { data, isLoading, isError } = useQuery({
    queryKey: ['buyer-contact', storeId, userId],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_buyer_contacts').select('full_name,email,phone').eq('store_id', storeId).eq('user_id', userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const contact = data ?? initial;
  const values = draft ?? contact;
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = buyerContactSchema.safeParse(values);
    if (!parsed.success) { setMessage(parsed.error.issues[0]?.message ?? 'Revisa los datos.'); return; }
    setSaving(true); setMessage('');
    const { error } = await supabase.from('store_buyer_contacts').upsert({ ...parsed.data, store_id: storeId, user_id: userId, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { setMessage('No se pudieron guardar tus datos.'); return; }
    await queryClient.invalidateQueries({ queryKey: ['buyer-contact', storeId, userId] });
    queryClient.invalidateQueries({ queryKey: ['store-buyer-contacts', storeId] });
    setEditing(false); setDraft(null); toast.success('Tarjeta de comprador guardada');
  };
  return <Card className="rounded-lg">
    <CardHeader className="flex flex-row items-center justify-between gap-2">
      <CardTitle className="text-lg flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />Tarjeta de comprador</CardTitle>
      {!editing && <Button variant="ghost" size="icon" aria-label="Editar tarjeta de comprador" disabled={isLoading || isError} onClick={() => { setDraft(contact); setEditing(true); setMessage(''); }}><Pencil className="h-4 w-4" /></Button>}
    </CardHeader>
    <CardContent className="space-y-4">
      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isError ? <p role="alert">No se pudieron cargar tus datos de contacto.</p> : editing ?
        <form onSubmit={save} className="space-y-4">
          {([{ key: 'full_name', label: 'Nombre de contacto', type: 'text', max: 120 }, { key: 'email', label: 'Correo de contacto', type: 'email', max: 254 }, { key: 'phone', label: 'Teléfono de contacto (opcional)', type: 'tel', max: 30 }] as const).map(field => <div key={field.key} className="space-y-2"><Label htmlFor={`buyer-${field.key}`}>{field.label}</Label><Input id={`buyer-${field.key}`} type={field.type} maxLength={field.max} value={values[field.key]} onChange={e => setDraft({ ...values, [field.key]: e.target.value })} disabled={saving} required={field.key !== 'phone'} /></div>)}
          {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Guardar contacto</Button><Button type="button" variant="outline" disabled={saving} onClick={() => { setEditing(false); setDraft(null); }}>Cancelar</Button></div>
        </form> : <BuyerContactDetails contact={contact} />}
      <p className="text-xs text-muted-foreground flex items-start gap-2"><ShieldCheck className="h-4 w-4 shrink-0" />Privado · Tú y el dueño de esta tienda</p>
    </CardContent>
  </Card>;
}