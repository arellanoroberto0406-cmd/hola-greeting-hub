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

  const createSubscription = async (
    storeId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Creating PayPal recurring subscription:', { storeId, planId, billingCycle });

      const { data, error: invokeError } = await supabase.functions.invoke('paypal-subscription', {
        body: {
          action: 'create-subscription',
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
        console.log('Redirecting to PayPal subscription approval:', data.approvalUrl);
        const approvalUrl = data.approvalUrl as string;

        // PayPal approval can fail in embedded previews/webviews, so prefer top-level navigation
        const isEmbedded = window.self !== window.top;
        if (isEmbedded && window.top) {
          try {
            window.top.location.href = approvalUrl;
            return;
          } catch (navigationError) {
            console.warn('Top-level navigation blocked, trying popup fallback', navigationError);
          }
        }

        const popup = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
        if (!popup) {
          window.location.href = approvalUrl;
        }
      } else {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('PayPal subscription error:', err);
      setError(errorMessage);
      toast.error('Error al procesar la suscripción: ' + errorMessage);
      options.onError?.(err as Error);
      setIsProcessing(false);
    }
  };

  const cancelSubscription = async (storeId: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('paypal-subscription', {
        body: {
          action: 'cancel-subscription',
          storeId,
        },
      });

      if (invokeError) throw new Error(invokeError.message);
      if (data?.error) throw new Error(data.error);

      toast.success('Suscripción cancelada. Tu plan seguirá activo hasta el fin del período.');
      options.onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error('Error al cancelar: ' + errorMessage);
      options.onError?.(err as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createSubscription,
    cancelSubscription,
    // Keep legacy name for backward compat
    createOrder: createSubscription,
    isProcessing,
    error,
  };
};
