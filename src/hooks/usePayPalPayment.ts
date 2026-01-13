import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePayPalPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const usePayPalPayment = (options: UsePayPalPaymentOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async (
    storeId: string, 
    planId: string, 
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('paypal-subscription', {
        body: {
          action: 'create-order',
          storeId,
          planId,
          billingCycle,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Redirect to PayPal for payment
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No approval URL received');
      }

    } catch (error) {
      console.error('PayPal payment error:', error);
      toast.error('Error al procesar el pago con PayPal');
      options.onError?.(error as Error);
      setIsProcessing(false);
    }
  };

  return {
    createOrder,
    isProcessing,
  };
};
