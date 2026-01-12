-- Remover política permisiva de order_items
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- También remover la política antigua de products si existe
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;