-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage payments" ON public.mercadopago_payments;

-- The edge function uses service role key which bypasses RLS
-- So we only need the SELECT policy for store owners which is already in place