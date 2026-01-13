import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePayPalPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const usePayPalPayment = (options: UsePayPalPaymentOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (
    storeId: string, 
    planId: string, 
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('Creating PayPal order:', { storeId, planId, billingCycle });
      
      const { data, error: invokeError } = await supabase.functions.invoke('paypal-subscription', {
        body: {
          action: 'create-order',
          storeId,
          planId,
          billingCycle,
        },
      });

      if (invokeError) {
        console.error('Supabase function error:', invokeError);
        throw new Error(invokeError.message || 'Error al conectar con PayPal');
      }

      if (data?.error) {
        console.error('PayPal API error:', data.error);
        throw new Error(data.error);
      }

      if (data?.approvalUrl) {
        console.log('Redirecting to PayPal:', data.approvalUrl);
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('PayPal payment error:', err);
      setError(errorMessage);
      toast.error('Error al procesar el pago: ' + errorMessage);
      options.onError?.(err as Error);
      setIsProcessing(false);
    }
  };

  return {
    createOrder,
    isProcessing,
    error,
  };
};
