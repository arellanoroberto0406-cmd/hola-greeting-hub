CREATE OR REPLACE FUNCTION public.claim_my_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _email text;
  _count integer := 0;
BEGIN
  IF _uid IS NULL THEN
    RETURN 0;
  END IF;

  SELECT lower(u.email) INTO _email FROM auth.users u WHERE u.id = _uid;
  IF _email IS NULL THEN
    RETURN 0;
  END IF;

  UPDATE public.orders o
  SET user_id = _uid
  WHERE o.user_id IS NULL
    AND lower(o.email) = _email;

  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_my_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_my_orders() TO authenticated;