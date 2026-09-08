// Columnas de tienda que pueden leerse desde el navegador.
// Los datos sensibles de cobro (bank_info, paypal_email, mercadopago_access_token)
// solo se obtienen mediante funciones seguras del backend.
export const STORE_PUBLIC_COLUMNS =
  "id, owner_id, slug, name, description, logo_url, banner_url, primary_color, secondary_color, accent_color, shipping_cost, free_shipping_threshold, phone, email, address, instagram_url, facebook_url, is_active, created_at, updated_at, welcome_message, announcement_text, announcement_active, show_reviews, show_stock, currency, tax_rate, min_order_amount, store_timezone, twitter_url, tiktok_url, website_url, return_policy, shipping_info, dark_mode_enabled, default_theme, payment_methods, cash_instructions, whatsapp_number, faq_returns, faq_shipping, faq_refunds, faq_payments, faq_support";
