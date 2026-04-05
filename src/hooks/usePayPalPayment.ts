import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UsePayPalPaymentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type PayPalFunctionResponse = {
  approvalUrl?: string;
  error?: string;
  errorCode?: string;
  debugId?: string | null;
  technicalDetails?: string;
};

export const usePayPalPayment = (options: UsePayPalPaymentOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualApprovalUrl, setManualApprovalUrl] = useState<string | null>(null);

  const clearManualApprovalUrl = () => setManualApprovalUrl(null);

  const createSubscription = async (
    storeId: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly'
  ) => {
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
        const invokeDetails = invokeError as { message?: string; context?: unknown };
        const contextText = typeof invokeDetails.context === 'string'
          ? invokeDetails.context
          : invokeDetails.context
            ? JSON.stringify(invokeDetails.context)
            : '';

        console.error('Function invoke error:', invokeError, 'Context:', invokeDetails.context);
        throw new Error(
          contextText
            ? `${invokeDetails.message || 'Error al conectar con PayPal'}: ${contextText}`
            : (invokeDetails.message || 'Error al conectar con PayPal')
        );
      }

      if (data?.error) {
        console.error('PayPal API error:', data.errorCode, data.technicalDetails || data.error);

        if (data.errorCode === 'PAYEE_ACCOUNT_RESTRICTED') {
          const msg = data.debugId
            ? `Tu cuenta de PayPal está restringida. Resuélvelo en PayPal y comparte este código si te lo piden: ${data.debugId}`
            : 'Tu cuenta de PayPal está restringida. Resuélvelo en PayPal para poder cobrar.';

          setError(msg);
          toast.error(msg);
          setIsProcessing(false);
          return;
        }

        throw new Error(data.error);
      }

      if (!data?.approvalUrl) {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }

      const approvalUrl = data.approvalUrl as string;
      console.log('PayPal approval URL received:', approvalUrl);

      // Always show the manual link as fallback - popups are unreliable in iframes/webviews
      setManualApprovalUrl(approvalUrl);

      // Try to open in a new tab
      const popup = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
      
      if (popup && !popup.closed) {
        toast.success('Se abrió PayPal en una nueva pestaña. Completa el pago allí.');
      } else {
        // Try top-level navigation for iframe contexts
        try {
          if (window.self !== window.top && window.top) {
            window.top.location.href = approvalUrl;
            return;
          }
        } catch {
          // Cross-origin iframe, can't navigate top
        }
        
        toast.warning('No se pudo abrir PayPal automáticamente. Usa el botón de abajo para continuar.');
      }

      setIsProcessing(false);
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
    clearManualApprovalUrl,
    manualApprovalUrl,
    // Keep legacy name for backward compat
    createOrder: createSubscription,
    isProcessing,
    error,
  };
};
