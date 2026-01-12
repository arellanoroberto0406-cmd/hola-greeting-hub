-- Create coupons table for discount codes
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  max_uses INTEGER DEFAULT NULL,
  uses_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id, code)
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Store owners can manage their coupons
CREATE POLICY "Store owners can view their coupons"
ON public.coupons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can create coupons"
ON public.coupons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update their coupons"
ON public.coupons
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete their coupons"
ON public.coupons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = coupons.store_id
    AND stores.owner_id = auth.uid()
  )
);

-- Public can validate coupons (read only active ones)
CREATE POLICY "Anyone can validate active coupons"
ON public.coupons
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();