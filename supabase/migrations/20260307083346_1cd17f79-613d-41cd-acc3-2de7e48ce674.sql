
-- Table to store PayPal billing plan IDs mapped to our subscription plans
CREATE TABLE public.paypal_billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_plan_id uuid NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  paypal_plan_id text NOT NULL,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_plan_id, billing_cycle)
);

ALTER TABLE public.paypal_billing_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for checkout flow)
CREATE POLICY "Anyone can view active billing plans"
  ON public.paypal_billing_plans FOR SELECT
  USING (is_active = true);

-- Only admins can manage
CREATE POLICY "Admins can manage billing plans"
  ON public.paypal_billing_plans FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add paypal_subscription_id to store_subscriptions to track the PayPal subscription
ALTER TABLE public.store_subscriptions
  ADD COLUMN IF NOT EXISTS paypal_subscription_id text,
  ADD COLUMN IF NOT EXISTS auto_renew boolean DEFAULT true;
