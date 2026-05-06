import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2, Loader2, Store, Building2, Banknote, Wallet, AlertCircle, Clock, User, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import CopyButton from "@/components/store/CopyButton";
import PaymentProofUpload from "@/components/store/PaymentProofUpload";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/useStores";
import { supabase } from "@/integrations/supabase/client";
import { useMercadoPagoPayment } from "@/hooks/useMercadoPagoPayment";
import { usePayPalStorePayment } from "@/hooks/usePayPalStorePayment";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dynamic schema based on available payment methods
const createShippingSchema = (availablePaymentMethods: string[]) => z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido").max(15),
  address: z.string().min(5, "Dirección muy corta").max(200),
  city: z.string().min(2, "Ciudad requerida").max(100),
  state: z.string().min(1, "Estado requerido"),
  zipCode: z.string().min(5, "Código postal inválido").max(10),
  paymentMethod: z.enum(availablePaymentMethods as [string, ...string[]]),
});

interface PaymentMethods {
  card?: boolean;
  transfer?: boolean;
  cash?: boolean;
  paypal?: boolean;
  mercadopago?: boolean;
}

interface BankInfo {
  bank_name?: string;
  account_holder?: string;
  clabe?: string;
  account_number?: string;
}

// Default schema for initial render
const defaultShippingSchema = createShippingSchema(["card", "transfer", "cash"]);
type ShippingForm = z.infer<typeof defaultShippingSchema>;

const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const StoreCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | 'pending' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    id: string;
    paymentMethod: string;
    total: number;
  } | null>(null);
  
  const { data: store, isLoading: storeLoading } = useStore(slug || "");
  const { createPreference, isProcessing: isMPProcessing } = useMercadoPagoPayment();
  const { createPayPalOrder, isProcessing: isPayPalProcessing } = usePayPalStorePayment();

  // Check for payment status from URL (MercadoPago redirect)
  useEffect(() => {
    const status = searchParams.get('status') as 'success' | 'failure' | 'pending' | null;
    const orderId = searchParams.get('order');
    
    if (status && orderId) {
      setPaymentStatus(status);
      if (status === 'success') {
        setOrderComplete(true);
        clearCart();
      }
    }
  }, [searchParams, clearCart]);

  // Get available payment methods from store config
  const availablePaymentMethods = useMemo(() => {
    const methods: string[] = [];
    const paymentConfig = (store?.payment_methods as PaymentMethods) || { card: true, transfer: true, cash: true };
    
    if (paymentConfig.card) methods.push("card");
    if (paymentConfig.transfer) methods.push("transfer");
    if (paymentConfig.cash) methods.push("cash");
    if (paymentConfig.paypal) methods.push("paypal");
    if (paymentConfig.mercadopago) methods.push("mercadopago");
    
    return methods.length > 0 ? methods : ["card"];
  }, [store?.payment_methods]);

  const shippingCost = store ? (totalPrice >= (store.free_shipping_threshold || 999) ? 0 : (store.shipping_cost || 99)) : 99;
  const finalTotal = totalPrice + shippingCost;

  const shippingSchema = useMemo(() => createShippingSchema(availablePaymentMethods), [availablePaymentMethods]);

  const form = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: availablePaymentMethods[0] || "card",
    },
  });

  const isMobile = useIsMobile();
  const [wizardStep, setWizardStep] = useState(0); // 0=datos, 1=envío, 2=pago

  const wizardSteps = [
    { label: "Datos", icon: User, fields: ["firstName", "lastName", "email", "phone"] as const },
    { label: "Envío", icon: MapPin, fields: ["address", "city", "state", "zipCode"] as const },
    { label: "Pago", icon: CreditCard, fields: ["paymentMethod"] as const },
  ];

  const validateCurrentStep = useCallback(async () => {
    const currentFields = wizardSteps[wizardStep].fields;
    const result = await form.trigger(currentFields as any);
    return result;
  }, [wizardStep, form]);

  const handleNextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && wizardStep < 2) {
      setWizardStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [validateCurrentStep, wizardStep]);

  const handlePrevStep = useCallback(() => {
    if (wizardStep > 0) {
      setWizardStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [wizardStep]);

  // Apply store colors
  useEffect(() => {
    if (store) {
      document.documentElement.style.setProperty('--store-primary', store.primary_color);
      document.documentElement.style.setProperty('--store-secondary', store.secondary_color);
    }
    return () => {
      document.documentElement.style.removeProperty('--store-primary');
      document.documentElement.style.removeProperty('--store-secondary');
    };
  }, [store]);

  const onSubmit = async (data: ShippingForm) => {
    if (!store) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const subtotal = Number(totalPrice);
      const shipping = Number(shippingCost);
      const total = Number(finalTotal);

      if (!Number.isFinite(subtotal) || !Number.isFinite(shipping) || !Number.isFinite(total)) {
        throw new Error("Totales inválidos. Por favor recarga e intenta de nuevo.");
      }

      const orderPayload = {
        store_id: store.id,
        user_id: user?.id || null,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        payment_method: data.paymentMethod,
        subtotal,
        shipping_cost: shipping,
        total,
        status: (data.paymentMethod === 'mercadopago' || data.paymentMethod === 'paypal') ? 'awaiting_payment' : 'pending',
      };

      // Create the order with store_id
      console.log('[checkout] inserting order', {
        store_id: orderPayload.store_id,
        user_id: orderPayload.user_id,
        email: orderPayload.email,
        first_name: orderPayload.first_name,
        last_name: orderPayload.last_name,
        total: orderPayload.total,
        subtotal: orderPayload.subtotal,
        shipping_cost: orderPayload.shipping_cost,
        payment_method: orderPayload.payment_method,
      });

       const { data: createOrderRes, error: createOrderInvokeError } = await supabase.functions.invoke(
         "create-order",
         {
           body: {
             ...orderPayload,
             items: items.map((item) => ({
               product_id: item.id.includes("-") ? null : item.id,
               product_name: item.name,
               product_image: item.image,
               selected_color: item.selectedColor || null,
               quantity: item.quantity,
               price: item.price,
             })),
           },
         },
       );

       if (createOrderInvokeError) {
         console.error("[checkout] create-order invoke error", { createOrderInvokeError, orderPayload });
         throw createOrderInvokeError;
       }

       if (!createOrderRes?.success || !createOrderRes?.order?.id) {
         console.error("[checkout] create-order unexpected response", createOrderRes);
         throw new Error(createOrderRes?.error || "No se pudo crear el pedido");
       }

       const order = createOrderRes.order as { id: string };

      // Handle MercadoPago payment
      if (data.paymentMethod === 'mercadopago') {
        // Check if store has MercadoPago configured
        if (!store.mercadopago_access_token) {
          toast({
            title: "MercadoPago no configurado",
            description: "Esta tienda no tiene MercadoPago configurado. Por favor selecciona otro método de pago.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const mpItems = items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        // Add shipping as an item if not free
        if (shippingCost > 0) {
          mpItems.push({
            title: 'Envío',
            quantity: 1,
            unit_price: shippingCost,
          });
        }

        await createPreference(
          store.id,
          order.id,
          mpItems,
          {
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
          },
          slug || ''
        );
        // The hook will redirect to MercadoPago
        return;
      }

      // Handle PayPal payment
      if (data.paymentMethod === 'paypal') {
        if (!store.paypal_email) {
          toast({
            title: "PayPal no configurado",
            description: "Esta tienda no tiene PayPal configurado. Por favor selecciona otro método de pago.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const ppItems = items.map(item => ({
          title: item.name,
          quantity: item.quantity,
          unit_price: item.price,
        }));

        if (shippingCost > 0) {
          ppItems.push({
            title: 'Envío',
            quantity: 1,
            unit_price: shippingCost,
          });
        }

        await createPayPalOrder(
          store.id,
          order.id,
          ppItems,
          {
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
          },
          finalTotal,
          (store as any).currency || 'MXN'
        );
        // The hook will redirect to PayPal
        return;
      }

      // Send notifications (email + WhatsApp) to store owner
      try {
        const notificationResponse = await supabase.functions.invoke('send-order-notification', {
          body: {
            order_id: order.id,
            store_name: store.name,
            store_email: store.email,
            store_logo: store.logo_url,
            primary_color: store.primary_color,
            whatsapp_number: store.whatsapp_number,
            customer: {
              first_name: data.firstName,
              last_name: data.lastName,
              email: data.email,
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              zip_code: data.zipCode,
            },
            items: items.map(item => ({
              product_name: item.name,
              quantity: item.quantity,
              price: item.price,
              selected_color: item.selectedColor,
            })),
            subtotal: totalPrice,
            shipping_cost: shippingCost,
            total: finalTotal,
            payment_method: data.paymentMethod,
            notify_store: true,
            notify_customer: true,
            notify_whatsapp: true,
          },
        });

        console.log('Notification response:', notificationResponse);

        // If WhatsApp URL is returned and store has WhatsApp, open it automatically
        if (notificationResponse.data?.results?.whatsapp?.url && store.whatsapp_number) {
          // Open WhatsApp in a new tab for the store owner notification
          window.open(notificationResponse.data.results.whatsapp.url, '_blank');
        }
      } catch (notificationError) {
        // Don't fail the order if notifications fail
        console.error('Notification error:', notificationError);
      }

      // For card, transfer, cash, paypal - show order confirmation with payment instructions
       setCompletedOrder({
         id: order.id,
         paymentMethod: data.paymentMethod,
         total: finalTotal,
       });
      setOrderComplete(true);
      clearCart();

      toast({
        title: "¡Pedido realizado!",
        description: "Tu pedido ha sido registrado correctamente.",
      });
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: "Error al procesar pedido",
        description:
          error?.message ||
          error?.details ||
          error?.hint ||
          (typeof error === 'string' ? error : "Por favor intenta de nuevo."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Tienda no encontrada</h1>
          <Button onClick={() => navigate("/")}>Ir al inicio</Button>
        </div>
      </div>
    );
  }

  const primaryColor = store.primary_color || "#8B4513";

  // Handle payment failure from MercadoPago
  if (paymentStatus === 'failure') {
    return (
      <div className="min-h-screen bg-background">
        <header 
          className="border-b py-4"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="container mx-auto px-4 flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              <Store className="h-6 w-6" style={{ color: primaryColor }} />
            )}
            <span className="font-heading text-lg" style={{ color: primaryColor }}>{store.name}</span>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-4xl font-heading mb-4">Pago no completado</h1>
            <p className="text-muted-foreground mb-8">
              Hubo un problema con tu pago. Por favor intenta de nuevo o elige otro método de pago.
            </p>
            <Link to={`/tienda/${slug}`}>
              <Button size="lg" style={{ backgroundColor: primaryColor }}>
                Volver a la tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle pending payment from MercadoPago (e.g., OXXO)
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-background">
        <header 
          className="border-b py-4"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="container mx-auto px-4 flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              <Store className="h-6 w-6" style={{ color: primaryColor }} />
            )}
            <span className="font-heading text-lg" style={{ color: primaryColor }}>{store.name}</span>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-yellow-100">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-heading mb-4">Pago pendiente</h1>
            <p className="text-muted-foreground mb-4">
              Tu pago está siendo procesado. Si elegiste pagar en OXXO u otro punto de pago, 
              recuerda completar el pago antes de la fecha límite.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Te enviaremos un correo cuando el pago sea confirmado.
            </p>
            <Link to={`/tienda/${slug}`}>
              <Button size="lg" style={{ backgroundColor: primaryColor }}>
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <header 
          className="border-b py-4"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="container mx-auto px-4 flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              <Store className="h-6 w-6" style={{ color: primaryColor }} />
            )}
            <span className="font-heading text-lg" style={{ color: primaryColor }}>{store.name}</span>
          </div>
        </header>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-heading mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agrega productos antes de continuar al checkout</p>
          <Link to={`/tienda/${slug}`}>
            <Button style={{ backgroundColor: primaryColor }}>Volver a la tienda</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    const bankInfo = store.bank_info as BankInfo | null;
    
    return (
      <div className="min-h-screen bg-background">
        <header 
          className="border-b py-4"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="container mx-auto px-4 flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              <Store className="h-6 w-6" style={{ color: primaryColor }} />
            )}
            <span className="font-heading text-lg" style={{ color: primaryColor }}>{store.name}</span>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-8">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
              </div>
              <h1 className="text-4xl font-heading mb-4">¡Gracias por tu compra!</h1>
              <p className="text-muted-foreground">
                Tu pedido ha sido registrado correctamente.
              </p>
              {completedOrder && (
                <p className="text-sm text-muted-foreground mt-2">
                  Número de pedido: <span className="font-mono font-semibold">{completedOrder.id.slice(0, 8).toUpperCase()}</span>
                </p>
              )}
            </div>

            {/* Payment Instructions based on method */}
            {completedOrder && (
              <div className="bg-card rounded-xl p-6 border border-border/50 mb-8">
                {completedOrder.paymentMethod === 'transfer' && (
                  <>
                    <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
                      Instrucciones de Pago - Transferencia
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Realiza tu pago por transferencia bancaria con los siguientes datos:
                    </p>
                    {bankInfo ? (
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        {bankInfo.bank_name && (
                          <div className="flex items-center justify-between">
                            <p><span className="text-muted-foreground">Banco:</span> <span className="font-semibold">{bankInfo.bank_name}</span></p>
                          </div>
                        )}
                        {bankInfo.account_holder && (
                          <div className="flex items-center justify-between">
                            <p><span className="text-muted-foreground">Titular:</span> <span className="font-semibold">{bankInfo.account_holder}</span></p>
                            <CopyButton text={bankInfo.account_holder} label="Titular" primaryColor={primaryColor} />
                          </div>
                        )}
                        {bankInfo.clabe && (
                          <div className="flex items-center justify-between">
                            <p><span className="text-muted-foreground">CLABE:</span> <span className="font-mono font-semibold">{bankInfo.clabe}</span></p>
                            <CopyButton text={bankInfo.clabe} label="CLABE" primaryColor={primaryColor} />
                          </div>
                        )}
                        {bankInfo.account_number && (
                          <div className="flex items-center justify-between">
                            <p><span className="text-muted-foreground">No. cuenta:</span> <span className="font-mono font-semibold">{bankInfo.account_number}</span></p>
                            <CopyButton text={bankInfo.account_number} label="Cuenta" primaryColor={primaryColor} />
                          </div>
                        )}
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <p><span className="text-muted-foreground">Monto a pagar:</span> <span className="font-bold text-lg" style={{ color: primaryColor }}>${completedOrder.total.toLocaleString()} MXN</span></p>
                          <CopyButton text={completedOrder.total.toFixed(2)} label="Monto" primaryColor={primaryColor} />
                        </div>
                        <div className="flex items-center justify-between">
                          <p><span className="text-muted-foreground">Referencia:</span> <span className="font-mono font-semibold">{completedOrder.id.slice(0, 8).toUpperCase()}</span></p>
                          <CopyButton text={completedOrder.id.slice(0, 8).toUpperCase()} label="Referencia" primaryColor={primaryColor} />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-muted-foreground">
                          El vendedor te contactará con los datos bancarios para realizar el pago.
                        </p>
                        <Separator className="my-3" />
                        <div className="flex items-center justify-between">
                          <p><span className="text-muted-foreground">Monto a pagar:</span> <span className="font-bold text-lg" style={{ color: primaryColor }}>${completedOrder.total.toLocaleString()} MXN</span></p>
                          <CopyButton text={completedOrder.total.toFixed(2)} label="Monto" primaryColor={primaryColor} />
                        </div>
                      </div>
                    )}
                    
                    {/* Payment Proof Upload */}
                    <PaymentProofUpload orderId={completedOrder.id} primaryColor={primaryColor} />
                    
                    <p className="text-sm text-muted-foreground mt-4">
                      📸 Sube tu comprobante arriba para agilizar la verificación de tu pago.
                    </p>
                  </>
                )}

                {completedOrder.paymentMethod === 'cash' && (
                  <>
                    <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                      <Banknote className="w-5 h-5" style={{ color: primaryColor }} />
                      Pago en Efectivo
                    </h2>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-muted-foreground mb-4">
                        {store.cash_instructions || "Realizarás el pago en efectivo al momento de recibir tu pedido."}
                      </p>
                      <Separator className="my-3" />
                      <p><span className="text-muted-foreground">Monto a pagar:</span> <span className="font-bold text-lg" style={{ color: primaryColor }}>${completedOrder.total.toLocaleString()} MXN</span></p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Te contactaremos para coordinar la entrega.
                    </p>
                  </>
                )}

                {completedOrder.paymentMethod === 'card' && (
                  <>
                    <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                      Pago con Tarjeta
                    </h2>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-muted-foreground mb-4">
                        Tu pedido ha sido registrado. El vendedor te contactará para coordinar el pago con tarjeta.
                      </p>
                      <Separator className="my-3" />
                      <p><span className="text-muted-foreground">Monto a pagar:</span> <span className="font-bold text-lg" style={{ color: primaryColor }}>${completedOrder.total.toLocaleString()} MXN</span></p>
                    </div>
                  </>
                )}

                {completedOrder.paymentMethod === 'paypal' && (
                  <>
                    <h2 className="text-xl font-heading mb-4 flex items-center gap-2">
                      <Wallet className="w-5 h-5" style={{ color: primaryColor }} />
                      Pago con PayPal - Completado
                    </h2>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-muted-foreground mb-4">
                        Tu pago ha sido procesado exitosamente a través de PayPal. 
                        Recibirás un correo de confirmación.
                      </p>
                      <Separator className="my-3" />
                      <p><span className="text-muted-foreground">Monto pagado:</span> <span className="font-bold text-lg" style={{ color: primaryColor }}>${completedOrder.total.toLocaleString()}</span></p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contact info */}
            <div className="text-center">
              {store.phone && (
                <p className="text-sm text-muted-foreground mb-2">
                  ¿Dudas? Contáctanos: <a href={`tel:${store.phone}`} className="font-semibold hover:underline" style={{ color: primaryColor }}>{store.phone}</a>
                </p>
              )}
              {store.whatsapp_number && (
                <a 
                  href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Acabo de realizar el pedido ${completedOrder?.id.slice(0, 8).toUpperCase() || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white mb-4"
                  style={{ backgroundColor: '#25D366' }}
                >
                  Contactar por WhatsApp
                </a>
              )}
              <div className="mt-4">
                <Link to={`/tienda/${slug}`}>
                  <Button size="lg" style={{ backgroundColor: primaryColor }}>
                    Seguir comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Header */}
      <header 
        className="border-b py-4 sticky top-0 z-50 backdrop-blur-xl"
        style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}30` }}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="h-8 w-auto" />
            ) : (
              <Store className="h-6 w-6" style={{ color: primaryColor }} />
            )}
            <span className="font-heading text-lg" style={{ color: primaryColor }}>{store.name}</span>
          </div>
          <Link 
            to={`/tienda/${slug}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading mb-8" style={{ color: primaryColor }}>
          Finalizar Compra
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact Info */}
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h2 className="text-xl font-heading mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5" style={{ color: primaryColor }} />
                    Información de Envío
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="55 1234 5678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="mt-4 space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle, número, colonia" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ciudad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mexicanStates.map((state) => (
                                  <SelectItem key={state} value={state}>
                                    {state}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>C.P.</FormLabel>
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h2 className="text-xl font-heading mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                    Método de Pago
                  </h2>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="space-y-3"
                          >
                            {availablePaymentMethods.includes("card") && (
                              <div 
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                                style={{ borderColor: field.value === "card" ? primaryColor : undefined }}
                              >
                                <RadioGroupItem value="card" id="card" />
                                <Label htmlFor="card" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Tarjeta de crédito/débito</div>
                                  <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                                </Label>
                                <CreditCard className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            {availablePaymentMethods.includes("transfer") && (
                              <div 
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                                style={{ borderColor: field.value === "transfer" ? primaryColor : undefined }}
                              >
                                <RadioGroupItem value="transfer" id="transfer" />
                                <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Transferencia bancaria</div>
                                  <div className="text-sm text-muted-foreground">SPEI o depósito bancario</div>
                                </Label>
                                <Building2 className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            {availablePaymentMethods.includes("cash") && (
                              <div 
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                                style={{ borderColor: field.value === "cash" ? primaryColor : undefined }}
                              >
                                <RadioGroupItem value="cash" id="cash" />
                                <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                  <div className="font-medium">Pago en efectivo</div>
                                  <div className="text-sm text-muted-foreground">{store?.cash_instructions || "Pago contra entrega"}</div>
                                </Label>
                                <Banknote className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            {availablePaymentMethods.includes("paypal") && (
                              <div 
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                                style={{ borderColor: field.value === "paypal" ? primaryColor : undefined }}
                              >
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                  <div className="font-medium">PayPal / Tarjeta</div>
                                  <div className="text-sm text-muted-foreground">Paga con tarjeta o saldo PayPal de forma segura</div>
                                </Label>
                                <Wallet className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            {availablePaymentMethods.includes("mercadopago") && (
                              <div 
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                                style={{ borderColor: field.value === "mercadopago" ? primaryColor : undefined }}
                              >
                                <RadioGroupItem value="mercadopago" id="mercadopago" />
                                <Label htmlFor="mercadopago" className="flex-1 cursor-pointer">
                                  <div className="font-medium">MercadoPago</div>
                                  <div className="text-sm text-muted-foreground">Tarjeta, OXXO y más</div>
                                </Label>
                                <div className="w-5 h-5 bg-[#00b1ea] rounded flex items-center justify-center text-white text-xs font-bold">MP</div>
                              </div>
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Tus datos están protegidos con encriptación SSL de 256 bits</span>
                </div>

                {/* Submit Button - Mobile */}
                <div className="lg:hidden">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isSubmitting || isMPProcessing || isPayPalProcessing}
                  >
                    {isSubmitting || isMPProcessing || isPayPalProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {isMPProcessing ? 'Redirigiendo a MercadoPago...' : isPayPalProcessing ? 'Redirigiendo a PayPal...' : 'Procesando...'}
                      </>
                    ) : (
                      `Pagar $${finalTotal.toLocaleString()}`
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border/50 sticky top-24">
              <h2 className="text-xl font-heading mb-6">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.selectedColor && (
                        <p className="text-xs text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Cantidad: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className={shippingCost === 0 ? "text-green-500 font-semibold" : ""}>
                    {shippingCost === 0 ? "GRATIS" : `$${shippingCost}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Envío gratis en compras mayores a ${store.free_shipping_threshold || 999}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span style={{ color: primaryColor }}>${finalTotal.toLocaleString()}</span>
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block mt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  style={{ backgroundColor: primaryColor }}
                  disabled={isSubmitting || isMPProcessing || isPayPalProcessing}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting || isMPProcessing || isPayPalProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isMPProcessing ? 'Redirigiendo a MercadoPago...' : isPayPalProcessing ? 'Redirigiendo a PayPal...' : 'Procesando...'}
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>
              </div>

              {/* Store contact info */}
              {(store.phone || store.email) && (
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground mb-2">¿Necesitas ayuda?</p>
                  {store.phone && (
                    <p className="text-sm font-medium">{store.phone}</p>
                  )}
                  {store.email && (
                    <p className="text-sm text-muted-foreground">{store.email}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreCheckout;
