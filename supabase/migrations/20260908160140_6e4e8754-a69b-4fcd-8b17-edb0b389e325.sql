DO $$
DECLARE cols text;
BEGIN
  SELECT string_agg(format('%I', column_name), ', ') INTO cols
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'stores'
    AND column_name NOT IN ('mercadopago_access_token','paypal_email','bank_info');
  EXECUTE 'REVOKE SELECT ON public.stores FROM anon, authenticated';
  EXECUTE format('GRANT SELECT (%s) ON public.stores TO anon', cols);
  EXECUTE format('GRANT SELECT (%s) ON public.stores TO authenticated', cols);
END $$;

GRANT INSERT, UPDATE, DELETE ON public.stores TO authenticated;
GRANT ALL ON public.stores TO service_role;

CREATE OR REPLACE FUNCTION public.get_store_payment_config(_store_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'payment_methods', s.payment_methods,
    'cash_instructions', s.cash_instructions,
    'bank_info', s.bank_info,
    'paypal_email', s.paypal_email,
    'has_mercadopago', (s.mercadopago_access_token IS NOT NULL AND length(s.mercadopago_access_token) > 0)
  )
  FROM public.stores s
  WHERE s.id = _store_id AND s.is_active = true;
$$;

REVOKE ALL ON FUNCTION public.get_store_payment_config(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_store_payment_config(uuid) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_store_payment_settings(_store_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'payment_methods', s.payment_methods,
    'cash_instructions', s.cash_instructions,
    'bank_info', s.bank_info,
    'paypal_email', s.paypal_email,
    'mercadopago_access_token', s.mercadopago_access_token
  )
  FROM public.stores s
  WHERE s.id = _store_id AND s.owner_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_store_payment_settings(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_my_store_payment_settings(uuid) TO authenticated, service_role;