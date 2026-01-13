-- Add payment configuration columns to stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '{"card": true, "transfer": true, "cash": true, "paypal": false, "mercadopago": false}'::jsonb,
ADD COLUMN IF NOT EXISTS bank_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS paypal_email text,
ADD COLUMN IF NOT EXISTS mercadopago_access_token text,
ADD COLUMN IF NOT EXISTS cash_instructions text;

-- Add comment for payment_methods
COMMENT ON COLUMN public.stores.payment_methods IS 'JSON object with enabled payment methods: card, transfer, cash, paypal, mercadopago';
COMMENT ON COLUMN public.stores.bank_info IS 'Bank account info for transfers: bank_name, account_holder, clabe, account_number';
COMMENT ON COLUMN public.stores.cash_instructions IS 'Instructions for cash payment (pickup address, hours, etc)';