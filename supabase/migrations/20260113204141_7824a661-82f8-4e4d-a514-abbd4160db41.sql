-- Create table to track MercadoPago payments
CREATE TABLE public.mercadopago_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  preference_id TEXT NOT NULL,
  mp_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mercadopago_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can view their payment records
CREATE POLICY "Store owners can view their payments"
ON public.mercadopago_payments
FOR SELECT
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE owner_id = auth.uid()
  )
);

-- Policy: System can insert payments (via service role in edge function)
CREATE POLICY "Service role can manage payments"
ON public.mercadopago_payments
FOR ALL
USING (true)
WITH CHECK (true);

-- Add index for faster lookups
CREATE INDEX idx_mercadopago_payments_order ON public.mercadopago_payments(order_id);
CREATE INDEX idx_mercadopago_payments_preference ON public.mercadopago_payments(preference_id);
CREATE INDEX idx_mercadopago_payments_mp_id ON public.mercadopago_payments(mp_payment_id);

-- Add updated_at trigger
CREATE TRIGGER update_mercadopago_payments_updated_at
BEFORE UPDATE ON public.mercadopago_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.mercadopago_payments IS 'Tracks MercadoPago payment preferences and their status';