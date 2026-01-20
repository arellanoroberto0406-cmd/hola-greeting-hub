-- Allow guest checkout inserts into orders/order_items (RLS)

-- Orders: permit inserts for all roles (anon + authenticated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND policyname = 'Anyone can create orders (guest checkout)'
  ) THEN
    CREATE POLICY "Anyone can create orders (guest checkout)"
    ON public.orders
    FOR INSERT
    TO public
    WITH CHECK (
      store_id IS NOT NULL
      AND (user_id IS NULL OR auth.uid() = user_id)
    );
  END IF;
END $$;

-- Order items: permit inserts for all roles (anon + authenticated)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'order_items'
      AND policyname = 'Anyone can insert order items (guest checkout)'
  ) THEN
    CREATE POLICY "Anyone can insert order items (guest checkout)"
    ON public.order_items
    FOR INSERT
    TO public
    WITH CHECK (
      EXISTS (
        SELECT 1
        FROM public.orders o
        WHERE o.id = order_items.order_id
          AND o.store_id IS NOT NULL
          AND (o.user_id IS NULL OR o.user_id = auth.uid())
      )
    );
  END IF;
END $$;