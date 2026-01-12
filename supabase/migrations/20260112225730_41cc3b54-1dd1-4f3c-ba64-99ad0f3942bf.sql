-- Crear tabla de tiendas
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#8B4513',
  secondary_color TEXT DEFAULT '#D4A574',
  accent_color TEXT DEFAULT '#2F1810',
  shipping_cost NUMERIC DEFAULT 99,
  free_shipping_threshold NUMERIC DEFAULT 999,
  phone TEXT,
  email TEXT,
  address TEXT,
  instagram_url TEXT,
  facebook_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede ver tiendas activas
CREATE POLICY "Anyone can view active stores" 
ON public.stores FOR SELECT 
USING (is_active = true);

-- Dueños pueden ver sus propias tiendas (incluso inactivas)
CREATE POLICY "Owners can view their own stores" 
ON public.stores FOR SELECT 
USING (auth.uid() = owner_id);

-- Solo dueños pueden modificar
CREATE POLICY "Owners can update their store" 
ON public.stores FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their store" 
ON public.stores FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their store" 
ON public.stores FOR DELETE 
USING (auth.uid() = owner_id);

-- Crear índices
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_stores_owner ON public.stores(owner_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();