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

    // Try to pre-open popup synchronously from user click (best chance to avoid blockers)
    let checkoutWindow: Window | null = null;
    if (shouldUsePopupFlow) {
      checkoutWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (checkoutWindow) {
        checkoutWindow.document.write('<p style="font-family: sans-serif; padding: 16px;">Redirigiendo a PayPal...</p>');
      }
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

      if (!data?.approvalUrl) {
        throw new Error('No se recibió la URL de aprobación de PayPal');
      }

      console.log('Redirecting to PayPal subscription approval:', data.approvalUrl);
      const approvalUrl = data.approvalUrl as string;

      if (checkoutWindow && !checkoutWindow.closed) {
        try {
          checkoutWindow.location.href = approvalUrl;
          toast.info('Se abrió PayPal en una nueva pestaña para completar el pago.');
          setIsProcessing(false);
          return;
        } catch (windowError) {
          console.warn('Could not redirect pre-opened PayPal window:', windowError);
        }
      }

      if (shouldUsePopupFlow) {
        const popup = window.open(approvalUrl, '_blank', 'noopener,noreferrer');
        if (popup) {
          toast.info('Se abrió PayPal en una nueva pestaña para completar el pago.');
          setIsProcessing(false);
          return;
        }

        const msg = 'No se pudo abrir PayPal automáticamente. Usa el botón "Abrir PayPal" para continuar el pago.';
        setError(msg);
        setManualApprovalUrl(approvalUrl);
        toast.warning(msg);
        setIsProcessing(false);
        return;
      }

      window.location.href = approvalUrl;
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
    clearManualApprovalUrl,
    manualApprovalUrl,
    // Keep legacy name for backward compat
    createOrder: createSubscription,
    isProcessing,
    error,
  };
};
