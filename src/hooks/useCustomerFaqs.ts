import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useCustomerFaqs(storeId: string) {
  return useQuery({
    queryKey: ['customer-faqs', storeId],
    queryFn: async () => {
      const { data, error } = await supabase.from('store_customer_faqs').select('id,question,answer,sort_order').eq('store_id', storeId).order('sort_order').order('created_at');
      if (error) throw error;
      return data;
    },
    enabled: !!storeId,
    refetchOnWindowFocus: true,
  });
}