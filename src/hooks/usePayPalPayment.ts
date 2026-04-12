import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePayPalPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type PayPalFunctionResponse = {
  approvalUrl?: string;
  subscriptionId?: string;
  error?: string;
  errorCode?: string;
  debugId?: string | null;
  technicalDetails?: string;
};

export const usePayPalPayment = (options: UsePayPalPaymentOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualApprovalUrl, setManualApprovalUrl] = useState<string | null>(null);

  const clearManualApprovalUrl = () => {
    setManualApprovalUrl(null);
    setError(null);
  };

  const createSubscription = async (
    storeId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
    if (!storeId || !planId) {
      toast.error('Datos incompletos. Selecciona un plan válido.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setManualApprovalUrl(null);

    try {
      console.log('Creating PayPal payment:', { storeId, planId, billingCycle });

      const { data, error: invokeError } = await supabase.functions.invoke<PayPalFunctionResponse>('paypal-subscription', {
        body: {
          action: 'create-subscription',
          storeId,
          planId,
          billingCycle,
        },
      });

      if (invokeError) {
        console.error('Function invoke error:', invokeError);
        throw new Error(invokeError.message || 'Error al conectar con el servidor de pagos');
      }

      // The function always returns 200 but may have an error in the body
      if (data?.error) {
        console.error('PayPal API error:', data.errorCode, data.error);

        if (data.errorCode === 'PAYEE_ACCOUNT_RESTRICTED') {
          const msg = 'La cuenta de PayPal está restringida. Es necesario resolverlo desde PayPal.';
          setError(msg);
          setIsProcessing(false);
          return;
        }

        throw new Error(data.error);
      }

      if (!data?.approvalUrl) {
        throw new Error('No se recibió el enlace de pago de PayPal');
      }

      const approvalUrl = data.approvalUrl;
      console.log('PayPal approval URL received:', approvalUrl);

      // Always show the manual link
      setManualApprovalUrl(approvalUrl);

      // Try to open in a new tab
      try {
        const popup = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
        if (popup && !popup.closed) {
          toast.success('PayPal se abrió en una nueva pestaña. Completa el pago allí.');
        } else {
          // Try top-level navigation for iframe contexts
          try {
            if (window.self !== window.top && window.top) {
              window.top.location.href = approvalUrl;
              return;
            }
          } catch {
            // Cross-origin iframe
          }
          toast.info('Haz clic en "Ir a PayPal" para completar el pago.');
        }
      } catch {
        toast.info('Haz clic en "Ir a PayPal" para completar el pago.');
      }

      setIsProcessing(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('PayPal subscription error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
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
    clearManualApprovalUrl,
    manualApprovalUrl,
    createOrder: createSubscription,
    isProcessing,
    error,
  };
};
