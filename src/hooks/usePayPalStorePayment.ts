import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface PayerInfo {
  email: string;
  first_name: string;
  last_name: string;
}

export const usePayPalStorePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPayPalOrder = async (
    storeId: string,
    orderId: string,
    items: PaymentItem[],
    payer: PayerInfo,
    totalAmount: number,
    currency: string = 'MXN'
  ) => {
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('paypal-store-payment', {
        body: {
          storeId,
          orderId,
          items,
          payer,
          totalAmount,
          currency,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No se recibió la URL de pago de PayPal');
      }
    } catch (error) {
      console.error('PayPal store payment error:', error);
      const msg = error instanceof Error ? error.message : 'Error al procesar el pago con PayPal';
      toast.error(msg);
      setIsProcessing(false);
    }
  };

  return {
    createPayPalOrder,
    isProcessing,
  };
};
