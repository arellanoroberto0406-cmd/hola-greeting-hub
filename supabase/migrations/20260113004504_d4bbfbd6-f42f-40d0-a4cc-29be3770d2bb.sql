-- Create table for pending PayPal orders
CREATE TABLE public.paypal_pending_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paypal_order_id TEXT NOT NULL UNIQUE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.paypal_pending_orders ENABLE ROW LEVEL SECURITY;

-- Create policy for store owners to view their pending orders
CREATE POLICY "Store owners can view their pending orders"
ON public.paypal_pending_orders
FOR SELECT
USING (
  store_id IN (
    SELECT id FROM public.stores WHERE owner_id = auth.uid()
  )
);

-- Create index for faster lookups
CREATE INDEX idx_paypal_pending_orders_paypal_id ON public.paypal_pending_orders(paypal_order_id);
CREATE INDEX idx_paypal_pending_orders_store_id ON public.paypal_pending_orders(store_id);