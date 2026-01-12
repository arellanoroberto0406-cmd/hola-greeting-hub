-- Agregar store_id a productos
ALTER TABLE public.products ADD COLUMN store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- Crear índice para mejorar consultas
CREATE INDEX idx_products_store_id ON public.products(store_id);

-- Actualizar RLS de productos para multi-tienda
DROP POLICY IF EXISTS "Enable read access for all users" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.products;

-- Cualquiera puede ver productos de tiendas activas o productos sin tienda
CREATE POLICY "Anyone can view products from active stores" 
ON public.products FOR SELECT 
USING (
  store_id IS NULL OR 
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.is_active = true)
);

-- Solo dueños de tienda pueden insertar productos en su tienda
CREATE POLICY "Store owners can insert products" 
ON public.products FOR INSERT 
WITH CHECK (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Solo dueños pueden actualizar productos de su tienda
CREATE POLICY "Store owners can update their products" 
ON public.products FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);

-- Solo dueños pueden eliminar productos de su tienda
CREATE POLICY "Store owners can delete their products" 
ON public.products FOR DELETE 
USING (
  EXISTS (SELECT 1 FROM public.stores WHERE stores.id = store_id AND stores.owner_id = auth.uid())
);