-- Ensure helper function used by RLS can see orders for guest checkouts
-- We implement it as SECURITY DEFINER so it can bypass RLS (table owner context)

CREATE OR REPLACE FUNCTION public.order_exists(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.orders o
    WHERE o.id = _order_id
  );
$$;

-- Backwards compatible overload (some clients/types referenced text)
CREATE OR REPLACE FUNCTION public.order_exists(_order_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.order_exists(_order_id::uuid);
$$;

REVOKE ALL ON FUNCTION public.order_exists(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.order_exists(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.order_exists(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.order_exists(text) TO anon, authenticated;
