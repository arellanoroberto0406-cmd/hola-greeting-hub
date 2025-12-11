import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
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

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shippingCost = totalPrice >= 500 ? 0 : 99;
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

  const onSubmit = async (data: ShippingForm) => {
    setIsSubmitting(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setOrderComplete(true);
    clearCart();
    
    toast({
      title: "¡Pedido realizado!",
      description: "Recibirás un correo con los detalles de tu pedido.",
    });
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bebas text-foreground mb-4">Tu carrito está vacío</h1>
          <p className="text-muted-foreground mb-8">Agrega productos antes de continuar al checkout</p>
          <Link to="/">
            <Button>Explorar productos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-lg mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-bebas text-foreground mb-4">¡Gracias por tu compra!</h1>
            <p className="text-muted-foreground mb-8">
              Tu pedido ha sido recibido. Te enviaremos un correo con los detalles y seguimiento de tu envío.
            </p>
            <Link to="/">
              <Button size="lg">Seguir comprando</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>

        <h1 className="text-4xl font-bebas text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact Info */}
                <div className="bg-card rounded-xl p-6 border border-border/50">
                  <h2 className="text-xl font-bebas text-foreground mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
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
                  <h2 className="text-xl font-bebas text-foreground mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
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
                            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-colors cursor-pointer">
                              <RadioGroupItem value="card" id="card" />
                              <Label htmlFor="card" className="flex-1 cursor-pointer">
                                <div className="font-medium">Tarjeta de crédito/débito</div>
                                <div className="text-sm text-muted-foreground">Visa, Mastercard, Amex</div>
                              </Label>
                              <CreditCard className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-colors cursor-pointer">
                              <RadioGroupItem value="transfer" id="transfer" />
                              <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                                <div className="font-medium">Transferencia bancaria</div>
                                <div className="text-sm text-muted-foreground">SPEI o depósito bancario</div>
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 rounded-lg border border-border/50 p-4 hover:border-primary/50 transition-colors cursor-pointer">
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Procesando..." : `Pagar $${finalTotal.toLocaleString()}`}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-6 border border-border/50 sticky top-24">
              <h2 className="text-xl font-bebas text-foreground mb-6">Resumen del Pedido</h2>
              
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
                    Envío gratis en compras mayores a $500
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">${finalTotal.toLocaleString()}</span>
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block mt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
