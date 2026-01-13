-- Create store_layout table for storing customizable section configurations
CREATE TABLE public.store_layouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id)
);

-- Enable Row Level Security
ALTER TABLE public.store_layouts ENABLE ROW LEVEL SECURITY;

-- Policy: Store owners can view their own layout
CREATE POLICY "Store owners can view their layout" 
ON public.store_layouts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_layouts.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Policy: Store owners can insert their layout
CREATE POLICY "Store owners can insert their layout" 
ON public.store_layouts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_layouts.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Policy: Store owners can update their layout
CREATE POLICY "Store owners can update their layout" 
ON public.store_layouts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_layouts.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Policy: Anyone can view active store layouts (for storefront display)
CREATE POLICY "Anyone can view active store layouts"
ON public.store_layouts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_layouts.store_id 
    AND stores.is_active = true
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_store_layouts_updated_at
BEFORE UPDATE ON public.store_layouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();