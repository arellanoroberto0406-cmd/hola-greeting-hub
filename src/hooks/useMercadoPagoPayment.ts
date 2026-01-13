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

interface UseMercadoPagoPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useMercadoPagoPayment = (options: UseMercadoPagoPaymentOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPreference = async (
    storeId: string,
    orderId: string,
    items: PaymentItem[],
    payer: PayerInfo,
    storeSlug: string
  ) => {
    setIsProcessing(true);
    
    try {
      const baseUrl = window.location.origin;
      const backUrls = {
        success: `${baseUrl}/tienda/${storeSlug}/checkout?status=success&order=${orderId}`,
        failure: `${baseUrl}/tienda/${storeSlug}/checkout?status=failure&order=${orderId}`,
        pending: `${baseUrl}/tienda/${storeSlug}/checkout?status=pending&order=${orderId}`,
      };

      const { data, error } = await supabase.functions.invoke('mercadopago-payment', {
        body: {
          storeId,
          orderId,
          items,
          payer,
          backUrls,
        },
      });

      if (error) throw error;

      if (data?.initPoint) {
        // Redirect to MercadoPago checkout
        window.location.href = data.initPoint;
      } else {
        throw new Error('No se recibió la URL de pago');
      }

    } catch (error) {
      console.error('MercadoPago payment error:', error);
      toast.error('Error al procesar el pago con MercadoPago');
      options.onError?.(error as Error);
      setIsProcessing(false);
    }
  };

  return {
    createPreference,
    isProcessing,
  };
};
