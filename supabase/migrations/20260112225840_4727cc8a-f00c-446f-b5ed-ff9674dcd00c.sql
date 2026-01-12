-- Agregar store_id a orders
ALTER TABLE public.orders ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;

-- Tabla de clientes por tienda
CREATE TABLE public.store_customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, user_id)
);

ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their customers" 
ON public.store_customers FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
  OR user_id = auth.uid()
);

CREATE POLICY "Customers can register to stores" 
ON public.store_customers FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Categorías por tienda
CREATE TABLE public.store_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" 
ON public.store_categories FOR SELECT 
USING (true);

CREATE POLICY "Store owners can insert categories" 
ON public.store_categories FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

CREATE POLICY "Store owners can update categories" 
ON public.store_categories FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

CREATE POLICY "Store owners can delete categories" 
ON public.store_categories FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Actualizar RLS de orders para multi-tienda
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;

CREATE POLICY "Users can view their orders or store owners can view store orders" 
ON public.orders FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Clientes autenticados pueden crear pedidos
CREATE POLICY "Authenticated users can create orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Store owners can update orders" 
ON public.orders FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Arreglar order_items también
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;

CREATE POLICY "Users can view order items of their orders" 
ON public.order_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.stores WHERE stores.id = orders.store_id AND stores.owner_id = auth.uid()
    ))
  )
);

CREATE POLICY "Authenticated users can insert order items" 
ON public.order_items FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);