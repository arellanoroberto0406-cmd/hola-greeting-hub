-- Add whatsapp_number column to stores table for WhatsApp button
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;