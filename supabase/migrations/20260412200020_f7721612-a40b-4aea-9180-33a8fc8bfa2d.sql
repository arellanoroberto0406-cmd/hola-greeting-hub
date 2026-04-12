
CREATE TABLE public.subscription_payment_proofs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  amount NUMERIC NOT NULL,
  proof_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_payment_proofs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their payment proofs"
  ON public.subscription_payment_proofs
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = subscription_payment_proofs.store_id AND stores.owner_id = auth.uid()
  ));

CREATE POLICY "Store owners can create payment proofs"
  ON public.subscription_payment_proofs
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores WHERE stores.id = subscription_payment_proofs.store_id AND stores.owner_id = auth.uid()
  ));

CREATE TRIGGER update_subscription_payment_proofs_updated_at
  BEFORE UPDATE ON public.subscription_payment_proofs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
