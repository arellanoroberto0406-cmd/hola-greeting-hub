import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RefundParams {
  storeId: string;
  orderId: string;
  amount?: number;
}

interface RefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

export const useMercadoPagoRefund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, orderId, amount }: RefundParams): Promise<RefundResponse> => {
      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: { storeId, orderId, amount },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add action=refund to the URL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-payment?action=refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ storeId, orderId, amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al procesar el reembolso');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Reembolso procesado correctamente');
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al procesar el reembolso');
    },
  });
};
