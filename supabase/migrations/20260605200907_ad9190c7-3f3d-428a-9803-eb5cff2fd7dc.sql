
-- 1. Bank accounts table
CREATE TABLE public.platform_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  clabe TEXT,
  account_number TEXT,
  qr_image_url TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.platform_bank_accounts TO anon, authenticated;
GRANT ALL ON public.platform_bank_accounts TO service_role;
ALTER TABLE public.platform_bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active bank accounts" ON public.platform_bank_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage bank accounts" ON public.platform_bank_accounts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER trg_bank_accounts_updated BEFORE UPDATE ON public.platform_bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_bank_accounts (bank_name, account_holder, clabe, sort_order)
VALUES ('SPIN Oxxo', 'GABRIEL ARELLANO', '728969000161610477', 0);

-- 2. Activation codes
CREATE TABLE public.subscription_activation_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  plan_id UUID NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly',
  duration_days INTEGER NOT NULL DEFAULT 30,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_activation_codes TO authenticated;
GRANT ALL ON public.subscription_activation_codes TO service_role;
ALTER TABLE public.subscription_activation_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage activation codes" ON public.subscription_activation_codes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Redemptions
CREATE TABLE public.subscription_code_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES public.subscription_activation_codes(id) ON DELETE CASCADE,
  store_id UUID NOT NULL,
  redeemed_by UUID NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_code_redemptions TO authenticated;
GRANT ALL ON public.subscription_code_redemptions TO service_role;
ALTER TABLE public.subscription_code_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all redemptions" ON public.subscription_code_redemptions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Store owners view their redemptions" ON public.subscription_code_redemptions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM stores WHERE stores.id = subscription_code_redemptions.store_id AND stores.owner_id = auth.uid()));

-- 4. Redeem function
CREATE OR REPLACE FUNCTION public.redeem_subscription_code(_code TEXT, _store_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _code_row public.subscription_activation_codes%ROWTYPE;
  _is_owner BOOLEAN;
  _end_date TIMESTAMPTZ;
  _existing UUID;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No autenticado');
  END IF;

  SELECT EXISTS(SELECT 1 FROM stores WHERE id = _store_id AND owner_id = _user_id) INTO _is_owner;
  IF NOT _is_owner THEN
    RETURN jsonb_build_object('success', false, 'error', 'No eres dueño de esta tienda');
  END IF;

  SELECT * INTO _code_row FROM public.subscription_activation_codes
  WHERE upper(code) = upper(trim(_code)) AND is_active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Código inválido o inactivo');
  END IF;

  IF _code_row.expires_at IS NOT NULL AND _code_row.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'El código ha expirado');
  END IF;

  IF _code_row.used_count >= _code_row.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'El código ya alcanzó su límite de usos');
  END IF;

  IF EXISTS(SELECT 1 FROM public.subscription_code_redemptions WHERE code_id = _code_row.id AND store_id = _store_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta tienda ya usó este código');
  END IF;

  _end_date := now() + (_code_row.duration_days || ' days')::interval;

  SELECT id INTO _existing FROM public.store_subscriptions WHERE store_id = _store_id;

  IF _existing IS NOT NULL THEN
    UPDATE public.store_subscriptions SET
      plan_id = _code_row.plan_id,
      status = 'active',
      payment_method = 'activation_code',
      payment_reference = _code_row.code,
      subscription_start_date = now(),
      subscription_end_date = _end_date,
      last_payment_date = now(),
      next_payment_date = _end_date,
      auto_renew = false,
      paypal_subscription_id = NULL,
      updated_at = now()
    WHERE store_id = _store_id;
  ELSE
    INSERT INTO public.store_subscriptions (store_id, plan_id, status, payment_method, payment_reference,
      subscription_start_date, subscription_end_date, last_payment_date, next_payment_date, auto_renew)
    VALUES (_store_id, _code_row.plan_id, 'active', 'activation_code', _code_row.code,
      now(), _end_date, now(), _end_date, false);
  END IF;

  UPDATE public.subscription_activation_codes SET used_count = used_count + 1 WHERE id = _code_row.id;

  INSERT INTO public.subscription_code_redemptions (code_id, store_id, redeemed_by)
  VALUES (_code_row.id, _store_id, _user_id);

  RETURN jsonb_build_object('success', true, 'message', 'Plan activado por ' || _code_row.duration_days || ' días',
    'end_date', _end_date);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_subscription_code(TEXT, UUID) TO authenticated;

-- 5. Realtime for instant admin notifications
ALTER TABLE public.subscription_payment_proofs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_payment_proofs;
