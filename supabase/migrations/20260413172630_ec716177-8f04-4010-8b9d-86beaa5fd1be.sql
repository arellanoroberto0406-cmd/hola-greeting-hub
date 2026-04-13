
-- Add review tracking and duplicate prevention columns
ALTER TABLE public.subscription_payment_proofs 
  ADD COLUMN IF NOT EXISTS reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS file_hash text;

-- Unique constraint to prevent reusing the same proof file
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_proof_hash ON public.subscription_payment_proofs(file_hash) WHERE file_hash IS NOT NULL;

-- Admins can view all payment proofs
CREATE POLICY "Admins can view all payment proofs"
ON public.subscription_payment_proofs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update payment proof status (approve/reject)
CREATE POLICY "Admins can update payment proofs"
ON public.subscription_payment_proofs
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
