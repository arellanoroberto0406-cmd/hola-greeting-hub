-- Allow guest checkout by permitting inserts when user_id is NULL

-- ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;

CREATE POLICY "Users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  store_id IS NOT NULL
  AND (
    user_id IS NULL
    OR auth.uid() = user_id
  )
);

-- ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can insert order items" ON public.order_items;

CREATE POLICY "Users can insert order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND (
        o.user_id IS NULL
        OR o.user_id = auth.uid()
      )
  )
);
