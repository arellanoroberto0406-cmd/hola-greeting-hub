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

    // Detect preview/embedded contexts where PayPal commonly fails in-place
    const userAgent = navigator.userAgent || '';
    const isInIframe = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();
    const isPreviewHost = /lovableproject\.com|lovable\.dev|id-preview--.*\.lovable\.app/i.test(window.location.hostname);
    const isEmbeddedWebView = /FBAN|FBAV|Instagram|Line|wv|WebView/i.test(userAgent);
    const shouldUsePopupFlow = isInIframe || isPreviewHost || isEmbeddedWebView;

    // Open popup synchronously from user click to avoid popup blockers
    let checkoutWindow: Window | null = null;
    if (shouldUsePopupFlow) {
      checkoutWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!checkoutWindow) {
        const msg = 'Tu navegador bloqueó la apertura de PayPal. Abre la app en Safari/Chrome y vuelve a intentar.';
        setError(msg);
        toast.error(msg);
        setIsProcessing(false);
        return;
      }

      checkoutWindow.document.write('<p style="font-family: sans-serif; padding: 16px;">Redirigiendo a PayPal...</p>');
    }

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
        console.error('PayPal API error:', data.error);
        throw new Error(data.error);
      }

      if (data?.approvalUrl) {
        console.log('Redirecting to PayPal subscription approval:', data.approvalUrl);
        const approvalUrl = data.approvalUrl as string;

        if (checkoutWindow && !checkoutWindow.closed) {
          checkoutWindow.location.href = approvalUrl;
          toast.info('Se abrió PayPal en una nueva pestaña para completar el pago.');
          setIsProcessing(false);
          return;
        }

        if (shouldUsePopupFlow) {
          const popup = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
          if (!popup) {
            const msg = 'No se pudo abrir PayPal en nueva pestaña. Abre el sitio en Safari/Chrome e intenta de nuevo.';
            setError(msg);
            toast.error(msg);
            setIsProcessing(false);
            return;
          }

          toast.info('Se abrió PayPal en una nueva pestaña para completar el pago.');
          setIsProcessing(false);
          return;
        }

        window.location.href = approvalUrl;
      } else {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }
    } catch (err) {
      if (checkoutWindow && !checkoutWindow.closed) {
        checkoutWindow.close();
      }
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
