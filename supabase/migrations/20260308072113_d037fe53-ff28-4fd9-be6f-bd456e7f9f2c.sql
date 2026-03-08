
-- Allow anyone to upload payment proofs (customers may not be authenticated)
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- Store owners can view payment proofs for their orders
CREATE POLICY "Store owners can view payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs'
  AND (
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.stores s ON s.id = o.store_id
      WHERE s.owner_id = auth.uid()
      AND o.payment_proof_url LIKE '%' || storage.objects.name
    )
    OR auth.uid() IS NOT NULL
  )
);
