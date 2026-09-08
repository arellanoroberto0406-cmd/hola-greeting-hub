REVOKE ALL PRIVILEGES ON TABLE public.abandoned_carts FROM anon;
REVOKE ALL PRIVILEGES ON TABLE public.abandoned_carts FROM authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.abandoned_carts FROM PUBLIC;

GRANT SELECT (id, store_id, user_id, items, total, recovered, reminder_sent_at, created_at, updated_at)
ON public.abandoned_carts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.abandoned_carts TO authenticated;
GRANT ALL PRIVILEGES ON TABLE public.abandoned_carts TO service_role;

DROP POLICY IF EXISTS "Store owners can view abandoned carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can manage their own abandoned carts" ON public.abandoned_carts;

CREATE POLICY "Authenticated store owners can view abandoned carts"
ON public.abandoned_carts
FOR SELECT
TO authenticated
USING (public.is_store_owner(auth.uid(), store_id));

CREATE POLICY "Authenticated users can view their own abandoned carts"
ON public.abandoned_carts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create their own abandoned carts"
ON public.abandoned_carts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update their own abandoned carts"
ON public.abandoned_carts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete their own abandoned carts"
ON public.abandoned_carts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());