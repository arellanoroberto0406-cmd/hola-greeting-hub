-- 1. Variantes de productos (tallas, etc.)
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price_adjustment NUMERIC DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for product_variants
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Everyone can view variants
CREATE POLICY "Public can view product variants"
ON public.product_variants FOR SELECT USING (true);

-- Store owners can manage variants
CREATE POLICY "Store owners can manage product variants"
ON public.product_variants FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON p.store_id = s.id
    WHERE p.id = product_variants.product_id
    AND s.owner_id = auth.uid()
  )
);

-- 2. Tracking de envío en orders
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS tracking_url TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- 3. Carritos abandonados
CREATE TABLE public.abandoned_carts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL DEFAULT 0,
  recovered BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for abandoned_carts
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

-- Store owners can view their abandoned carts
CREATE POLICY "Store owners can view abandoned carts"
ON public.abandoned_carts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = abandoned_carts.store_id
    AND s.owner_id = auth.uid()
  )
);

-- Users can manage their own carts
CREATE POLICY "Users can manage their own abandoned carts"
ON public.abandoned_carts FOR ALL
USING (user_id = auth.uid());

-- 4. Wishlist persistente en DB
CREATE TABLE public.wishlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS for wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can manage their own wishlists
CREATE POLICY "Users can manage their wishlists"
ON public.wishlists FOR ALL
USING (user_id = auth.uid());

-- Store owners can view wishlists for their products
CREATE POLICY "Store owners can view wishlists for their products"
ON public.wishlists FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = wishlists.store_id
    AND s.owner_id = auth.uid()
  )
);

-- 5. Suscriptores newsletter
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, email)
);

-- Enable RLS for newsletter_subscribers
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Store owners can view their subscribers
CREATE POLICY "Store owners can view subscribers"
ON public.newsletter_subscribers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = newsletter_subscribers.store_id
    AND s.owner_id = auth.uid()
  )
);

-- Store owners can update subscribers
CREATE POLICY "Store owners can update subscribers"
ON public.newsletter_subscribers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = newsletter_subscribers.store_id
    AND s.owner_id = auth.uid()
  )
);

-- 6. Configuración de tema de tienda (modo oscuro)
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS dark_mode_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_theme TEXT DEFAULT 'light';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_store_id ON public.abandoned_carts(store_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user_id ON public.abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON public.wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_store_id ON public.newsletter_subscribers(store_id);