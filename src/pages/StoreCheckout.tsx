import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2, Loader2, Store } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/hooks/useStores";
import { supabase } from "@/integrations/supabase/client";
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

const shippingSchema = z.object({
  firstName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  lastName: z.string().min(2, "Mínimo 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido").max(15),
  address: z.string().min(5, "Dirección muy corta").max(200),
  city: z.string().min(2, "Ciudad requerida").max(100),
  state: z.string().min(1, "Estado requerido"),
  zipCode: z.string().min(5, "Código postal inválido").max(10),
  paymentMethod: z.enum(["card", "transfer", "cash"]),
});

type ShippingForm = z.infer<typeof shippingSchema>;

const mexicanStates = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas",
  "Chihuahua", "Ciudad de México", "Coahuila", "Colima", "Durango", "Estado de México",
  "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán", "Morelos", "Nayarit",
  "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí",
  "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const StoreCheckout = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [orderComplete, setOrderComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: store, isLoading: storeLoading } = useStore(slug || "");

  const shippingCost = store ? (totalPrice >= (store.free_shipping_threshold || 999) ? 0 : (store.shipping_cost || 99)) : 99;
  const finalTotal = totalPrice + shippingCost;

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
      paymentMethod: "card",
    },
  });

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

      // Create the order with store_id
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
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
          subtotal: totalPrice,
          shipping_cost: shippingCost,
          total: finalTotal,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id.includes("-") ? null : item.id,
        product_name: item.name,
        product_image: item.image,
        selected_color: item.selectedColor || null,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderComplete(true);
      clearCart();

      toast({
        title: "¡Pedido realizado!",
        description: "Recibirás un correo con los detalles de tu pedido.",
      });
    } catch (error: any) {
      toast({
        title: "Error al procesar pedido",
        description: error.message || "Por favor intenta de nuevo.",
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
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <CheckCircle2 className="w-10 h-10" style={{ color: primaryColor }} />
            </div>
            <h1 className="text-4xl font-heading mb-4">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground mb-8">
              Tu pedido ha sido recibido. Te enviaremos un correo con los detalles y seguimiento de tu envío.
            </p>
            {store.phone && (
              <p className="text-sm text-muted-foreground mb-4">
                ¿Dudas? Contáctanos: {store.phone}
              </p>
            )}
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
                            <div 
                              className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                              style={{ borderColor: field.value === "transfer" ? primaryColor : undefined }}
                            >
                              <RadioGroupItem value="transfer" id="transfer" />
                              <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                                <div className="font-medium">Transferencia bancaria</div>
                                <div className="text-sm text-muted-foreground">SPEI o depósito bancario</div>
                              </Label>
                            </div>
                            <div 
                              className="flex items-center space-x-3 rounded-lg border p-4 hover:border-opacity-50 transition-colors cursor-pointer"
                              style={{ borderColor: field.value === "cash" ? primaryColor : undefined }}
                            >
                              <RadioGroupItem value="cash" id="cash" />
                              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                                <div className="font-medium">Pago en efectivo</div>
                                <div className="text-sm text-muted-foreground">OXXO, 7-Eleven, Farmacias</div>
                              </Label>
                            </div>
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Procesando...
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
                  disabled={isSubmitting}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Procesando...
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
