
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC,
  features JSONB DEFAULT '[]'::jsonb,
  max_products INTEGER DEFAULT 10,
  max_orders_per_month INTEGER DEFAULT 50,
  can_use_coupons BOOLEAN DEFAULT false,
  can_use_analytics BOOLEAN DEFAULT false,
  can_customize_theme BOOLEAN DEFAULT false,
  can_use_custom_domain BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store subscriptions table
CREATE TABLE public.store_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial', -- trial, active, expired, cancelled
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- transfer, paypal, other
  payment_reference TEXT,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  next_payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id)
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_subscriptions ENABLE ROW LEVEL SECURITY;

-- Plans are readable by everyone
CREATE POLICY "Plans are viewable by everyone" 
ON public.subscription_plans 
FOR SELECT 
USING (is_active = true);

-- Store owners can view their own subscription
CREATE POLICY "Store owners can view their subscription" 
ON public.store_subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_subscriptions.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Store owners can insert their subscription
CREATE POLICY "Store owners can create their subscription" 
ON public.store_subscriptions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_subscriptions.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Store owners can update their subscription
CREATE POLICY "Store owners can update their subscription" 
ON public.store_subscriptions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.stores 
    WHERE stores.id = store_subscriptions.store_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Insert default plans
INSERT INTO public.subscription_plans (name, slug, description, price_monthly, price_yearly, max_products, max_orders_per_month, can_use_coupons, can_use_analytics, can_customize_theme, can_use_custom_domain, features, sort_order) VALUES
('Básico', 'basico', 'Perfecto para empezar tu tienda online', 99, 999, 15, 100, false, false, false, false, '["Hasta 15 productos", "100 pedidos/mes", "Soporte por email", "SSL incluido"]', 1),
('Profesional', 'profesional', 'Para negocios en crecimiento', 249, 2499, 100, 500, true, true, true, false, '["Hasta 100 productos", "500 pedidos/mes", "Cupones de descuento", "Analíticas básicas", "Personalización de tema", "Soporte prioritario"]', 2),
('Empresarial', 'empresarial', 'Para grandes operaciones', 499, 4999, -1, -1, true, true, true, true, '["Productos ilimitados", "Pedidos ilimitados", "Todas las funciones Pro", "Dominio personalizado", "Analíticas avanzadas", "Soporte 24/7", "API access"]', 3);

-- Create trigger for updated_at
CREATE TRIGGER update_store_subscriptions_updated_at
BEFORE UPDATE ON public.store_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
