import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Building2, 
  Banknote, 
  Loader2, 
  Save, 
  Info,
  Wallet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PaymentMethods {
  [key: string]: boolean;
  card: boolean;
  transfer: boolean;
  cash: boolean;
  paypal: boolean;
  mercadopago: boolean;
}

interface BankInfo {
  [key: string]: string | undefined;
  bank_name?: string;
  account_holder?: string;
  clabe?: string;
  account_number?: string;
}

interface PaymentSettingsPanelProps {
  storeId: string;
  primaryColor?: string;
}

const PaymentSettingsPanel = ({ storeId, primaryColor = "#8B4513" }: PaymentSettingsPanelProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payment methods toggles
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    card: true,
    transfer: true,
    cash: true,
    paypal: false,
    mercadopago: false,
  });
  
  // Bank info for transfers
  const [bankInfo, setBankInfo] = useState<BankInfo>({
    bank_name: "",
    account_holder: "",
    clabe: "",
    account_number: "",
  });
  
  // Other payment details
  const [paypalEmail, setPaypalEmail] = useState("");
  const [mercadopagoToken, setMercadopagoToken] = useState("");
  const [cashInstructions, setCashInstructions] = useState("");

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("payment_methods, bank_info, paypal_email, mercadopago_access_token, cash_instructions")
          .eq("id", storeId)
          .single();

        if (error) throw error;

        if (data) {
          if (data.payment_methods) {
            setPaymentMethods(data.payment_methods as PaymentMethods);
          }
          if (data.bank_info) {
            setBankInfo(data.bank_info as BankInfo);
          }
          setPaypalEmail(data.paypal_email || "");
          setMercadopagoToken(data.mercadopago_access_token || "");
          setCashInstructions(data.cash_instructions || "");
        }
      } catch (error) {
        console.error("Error loading payment settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [storeId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("stores")
        .update({
          payment_methods: paymentMethods,
          bank_info: bankInfo,
          paypal_email: paypalEmail || null,
          mercadopago_access_token: mercadopagoToken || null,
          cash_instructions: cashInstructions || null,
        })
        .eq("id", storeId);

      if (error) throw error;

      toast({
        title: "Configuración guardada",
        description: "Los métodos de pago se han actualizado correctamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const togglePaymentMethod = (method: keyof PaymentMethods) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: !prev[method],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" style={{ color: primaryColor }} />
            Métodos de Pago
          </CardTitle>
          <CardDescription>
            Configura los métodos de pago que aceptas en tu tienda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Methods Toggles */}
          <div className="space-y-4">
            {/* Card Payment */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Tarjeta de crédito/débito</p>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                </div>
              </div>
              <Switch
                checked={paymentMethods.card}
                onCheckedChange={() => togglePaymentMethod("card")}
              />
            </div>

            {/* Bank Transfer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Transferencia bancaria</p>
                    <p className="text-sm text-muted-foreground">SPEI o depósito bancario</p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.transfer}
                  onCheckedChange={() => togglePaymentMethod("transfer")}
                />
              </div>
              
              {paymentMethods.transfer && (
                <Accordion type="single" collapsible className="ml-4">
                  <AccordionItem value="bank-info" className="border rounded-lg px-4">
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <span className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Configurar datos bancarios
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nombre del banco</Label>
                          <Input
                            placeholder="BBVA, Santander, etc."
                            value={bankInfo.bank_name || ""}
                            onChange={(e) => setBankInfo(prev => ({ ...prev, bank_name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Titular de la cuenta</Label>
                          <Input
                            placeholder="Nombre completo"
                            value={bankInfo.account_holder || ""}
                            onChange={(e) => setBankInfo(prev => ({ ...prev, account_holder: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CLABE interbancaria</Label>
                          <Input
                            placeholder="18 dígitos"
                            value={bankInfo.clabe || ""}
                            onChange={(e) => setBankInfo(prev => ({ ...prev, clabe: e.target.value }))}
                            maxLength={18}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Número de cuenta (opcional)</Label>
                          <Input
                            placeholder="Número de cuenta"
                            value={bankInfo.account_number || ""}
                            onChange={(e) => setBankInfo(prev => ({ ...prev, account_number: e.target.value }))}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>

            {/* Cash Payment */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Pago en efectivo</p>
                    <p className="text-sm text-muted-foreground">Pago contra entrega o en tienda</p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.cash}
                  onCheckedChange={() => togglePaymentMethod("cash")}
                />
              </div>
              
              {paymentMethods.cash && (
                <div className="ml-4 p-4 border rounded-lg space-y-2">
                  <Label>Instrucciones para pago en efectivo</Label>
                  <Textarea
                    placeholder="Ej: Pago contra entrega disponible en CDMX. También puedes recoger en nuestra tienda ubicada en..."
                    value={cashInstructions}
                    onChange={(e) => setCashInstructions(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* PayPal */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-muted-foreground">Pago seguro con PayPal</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">Los clientes podrán pagar con su cuenta PayPal o tarjeta a través de PayPal</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  checked={paymentMethods.paypal}
                  onCheckedChange={() => togglePaymentMethod("paypal")}
                />
              </div>
              
              {paymentMethods.paypal && (
                <div className="ml-4 p-4 border rounded-lg space-y-2">
                  <Label>Email de PayPal</Label>
                  <Input
                    type="email"
                    placeholder="tu-email@paypal.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este email se mostrará a los clientes para que puedan enviarte el pago
                  </p>
                </div>
              )}
            </div>

            {/* MercadoPago */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-[#00b1ea] rounded flex items-center justify-center text-white text-xs font-bold">
                    MP
                  </div>
                  <div>
                    <p className="font-medium">MercadoPago</p>
                    <p className="text-sm text-muted-foreground">Pagos con MercadoPago</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">Acepta pagos con tarjeta, OXXO, y más a través de MercadoPago</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  checked={paymentMethods.mercadopago}
                  onCheckedChange={() => togglePaymentMethod("mercadopago")}
                />
              </div>
              
              {paymentMethods.mercadopago && (
                <div className="ml-4 p-4 border rounded-lg space-y-2">
                  <Label>Access Token de MercadoPago</Label>
                  <Input
                    type="password"
                    placeholder="APP_USR-..."
                    value={mercadopagoToken}
                    onChange={(e) => setMercadopagoToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Obtén tu Access Token desde el{" "}
                    <a 
                      href="https://www.mercadopago.com.mx/developers/panel" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: primaryColor }}
                    >
                      Panel de Desarrolladores
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            style={{ backgroundColor: primaryColor }}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar configuración de pagos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettingsPanel;
