CREATE TABLE public.product_recommendation_ai_state (
  scope text PRIMARY KEY,
  status integer NOT NULL,
  message text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.product_recommendation_ai_state TO service_role;
REVOKE ALL ON public.product_recommendation_ai_state FROM anon, authenticated;
ALTER TABLE public.product_recommendation_ai_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.product_recommendation_ai_state IS 'Server-only persistent pause for terminal AI access and credit failures; clear after access is restored.';