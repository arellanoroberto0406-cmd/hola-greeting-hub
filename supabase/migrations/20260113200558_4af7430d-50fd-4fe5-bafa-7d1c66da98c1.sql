-- Create table for custom design templates
CREATE TABLE public.custom_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT DEFAULT '🎨',
  global_styles JSONB NOT NULL,
  section_ids TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for store owner access
CREATE POLICY "Store owners can view their own templates" 
ON public.custom_templates 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = custom_templates.store_id 
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can create their own templates" 
ON public.custom_templates 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = custom_templates.store_id 
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can update their own templates" 
ON public.custom_templates 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = custom_templates.store_id 
    AND stores.owner_id = auth.uid()
  )
);

CREATE POLICY "Store owners can delete their own templates" 
ON public.custom_templates 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = custom_templates.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_custom_templates_updated_at
BEFORE UPDATE ON public.custom_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();