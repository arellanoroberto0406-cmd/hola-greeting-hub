-- Fix checkout RLS: allow guest (anon) order creation while keeping reads restricted

-- ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Remove potentially conflicting policies (safe if they don't exist)
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', pol.policyname);
  END LOOP;
END$$;

-- Guests + authenticated users can create orders (guest checkout)
CREATE POLICY "orders_insert_public"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  store_id IS NOT NULL
  AND email IS NOT NULL
  AND first_name IS NOT NULL
  AND last_name IS NOT NULL
  AND total >= 0
);

-- Authenticated customers can read their own orders
CREATE POLICY "orders_select_own"
ON public.orders
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Store owners can read orders for stores they own
CREATE POLICY "orders_select_store_owner"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = orders.store_id
      AND s.owner_id = auth.uid()
  )
);

-- Store owners can update orders for stores they own (status, tracking, etc.)
CREATE POLICY "orders_update_store_owner"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = orders.store_id
      AND s.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.stores s
    WHERE s.id = orders.store_id
      AND s.owner_id = auth.uid()
  )
);

-- ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.order_items', pol.policyname);
  END LOOP;
END$$;

-- Helper: check order existence without depending on RLS SELECT on orders
CREATE OR REPLACE FUNCTION public.order_exists(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = _order_id
  );
$$;

-- Guests + authenticated users can create order items for an existing order
CREATE POLICY "order_items_insert_public"
ON public.order_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  public.order_exists(order_id)
);

-- Store owners can read items for their store's orders
CREATE POLICY "order_items_select_store_owner"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.stores s ON s.id = o.store_id
    WHERE o.id = order_items.order_id
      AND s.owner_id = auth.uid()
  )
);

-- Authenticated customers can read their own order items
CREATE POLICY "order_items_select_own"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = auth.uid()
  )
);
