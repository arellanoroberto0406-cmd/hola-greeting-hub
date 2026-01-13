export interface Store {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  shipping_cost: number;
  free_shipping_threshold: number;
  phone?: string;
  email?: string;
  address?: string;
  instagram_url?: string;
  facebook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Payment configuration
  payment_methods?: {
    card?: boolean;
    transfer?: boolean;
    cash?: boolean;
    paypal?: boolean;
    mercadopago?: boolean;
  };
  bank_info?: {
    bank_name?: string;
    account_holder?: string;
    clabe?: string;
    account_number?: string;
  };
  paypal_email?: string;
  mercadopago_access_token?: string;
  cash_instructions?: string;
}

export interface StoreCategory {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  created_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}
