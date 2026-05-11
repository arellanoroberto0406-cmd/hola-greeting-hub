ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS faq_returns text,
  ADD COLUMN IF NOT EXISTS faq_shipping text,
  ADD COLUMN IF NOT EXISTS faq_refunds text,
  ADD COLUMN IF NOT EXISTS faq_payments text,
  ADD COLUMN IF NOT EXISTS faq_support text;