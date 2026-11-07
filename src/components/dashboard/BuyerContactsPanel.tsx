import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BuyerContactDetails } from '@/components/store/BuyerContactCard';
import { Loader2, UsersRound } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function BuyerContactsPanel({ storeId }: { storeId: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['store-buyer-contacts', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_buyer_contacts').select('user_id,full_name,email,phone,updated_at').eq('store_id', storeId).order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  return <section className="space-y-4 pt-6 border-t">
    <h2 className="text-xl font-semibold flex items-center gap-2"><UsersRound className="h-5 w-5 text-primary" />Tarjetas de compradores</h2>
    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isError ? <p role="alert" className="text-destructive">No se pudieron cargar los contactos.</p> : !data?.length ? <p className="text-sm text-muted-foreground">Todavía no hay tarjetas de compradores guardadas.</p> :
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{data.map(contact => <Card key={contact.user_id} className="rounded-lg min-w-0"><CardHeader className="pb-2"><span className="text-xs text-muted-foreground">Contacto del comprador</span></CardHeader><CardContent><BuyerContactDetails contact={contact} /></CardContent></Card>)}</div>}
  </section>;
}