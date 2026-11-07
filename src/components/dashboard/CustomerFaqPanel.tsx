import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerFaqs } from '@/hooks/useCustomerFaqs';
import { customerFaqSchema } from '@/lib/buyerContact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, Plus, Save, Loader2, MessageCircleQuestion } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerFaqPanel({ storeId }: { storeId: string }) {
  const { data, isLoading, isError } = useCustomerFaqs(storeId);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<{ id?: string; question: string; answer: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const refresh = () => qc.invalidateQueries({ queryKey: ['customer-faqs', storeId] });
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!draft) return;
    const parsed = customerFaqSchema.safeParse(draft);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Revisa la pregunta y respuesta.'); return; }
    setSaving(true); setError('');
    const result = draft.id ? await supabase.from('store_customer_faqs').update(parsed.data).eq('id', draft.id).eq('store_id', storeId) : await supabase.from('store_customer_faqs').insert({ ...parsed.data, store_id: storeId, sort_order: (data?.reduce((max, item) => Math.max(max, item.sort_order), -1) ?? -1) + 1 });
    setSaving(false);
    if (result.error) { setError('No se pudo guardar la pregunta.'); return; }
    await refresh(); setDraft(null); toast.success('Pregunta publicada en tu tienda');
  };
  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar esta pregunta de tu tienda?')) return;
    setSaving(true);
    const { error } = await supabase.from('store_customer_faqs').delete().eq('id', id).eq('store_id', storeId);
    setSaving(false);
    if (error) { toast.error('No se pudo eliminar la pregunta.'); return; }
    await refresh();
  };
  return <section className="space-y-5 py-6 border-t">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold flex items-center gap-2"><MessageCircleQuestion className="h-5 w-5 text-primary" />Preguntas de clientes</h2><Button variant="outline" disabled={saving || isLoading || isError} onClick={() => { setDraft({ question: '', answer: '' }); setError(''); }}><Plus className="h-4 w-4 mr-2" />Añadir pregunta</Button></div>
    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isError ? <p role="alert" className="text-destructive">No se pudieron cargar las preguntas.</p> : <div className="divide-y">{!data?.length && <p className="text-sm text-muted-foreground">Aún no has publicado preguntas de clientes.</p>}{data?.map(item => <div key={item.id} className="py-4 flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-medium break-words">{item.question}</h3><p className="text-sm text-muted-foreground whitespace-pre-wrap break-words mt-2">{item.answer}</p></div><div className="flex shrink-0"><Button size="icon" variant="ghost" aria-label={`Editar ${item.question}`} disabled={saving} onClick={() => { setDraft(item); setError(''); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" aria-label={`Eliminar ${item.question}`} disabled={saving} onClick={() => remove(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></div>)}</div>}
    {draft && <form onSubmit={save} className="space-y-4 border-l-2 border-primary pl-4">
      <div className="space-y-2"><Label htmlFor="customer-question">Pregunta</Label><Input id="customer-question" maxLength={200} value={draft.question} onChange={e => setDraft({ ...draft, question: e.target.value })} required disabled={saving} /></div>
      <div className="space-y-2"><Label htmlFor="customer-answer">Respuesta</Label><Textarea id="customer-answer" rows={4} maxLength={2000} value={draft.answer} onChange={e => setDraft({ ...draft, answer: e.target.value })} required disabled={saving} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Guardar pregunta</Button><Button type="button" variant="outline" disabled={saving} onClick={() => setDraft(null)}>Cancelar</Button></div>
    </form>}
  </section>;
}