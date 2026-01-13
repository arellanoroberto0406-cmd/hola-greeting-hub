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
      // Get current session for auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Debes iniciar sesión para realizar reembolsos');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mercadopago-payment?action=refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
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
      queryClient.invalidateQueries({ queryKey: ['refunded-orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al procesar el reembolso');
    },
  });
};
