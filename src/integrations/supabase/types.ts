export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abandoned_carts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          items: Json
          recovered: boolean | null
          reminder_sent_at: string | null
          store_id: string
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          recovered?: boolean | null
          reminder_sent_at?: string | null
          store_id: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          recovered?: boolean | null
          reminder_sent_at?: string | null
          store_id?: string
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abandoned_carts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_purchase: number | null
          store_id: string
          updated_at: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase?: number | null
          store_id: string
          updated_at?: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_purchase?: number | null
          store_id?: string
          updated_at?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_templates: {
        Row: {
          created_at: string
          description: string | null
          global_styles: Json
          id: string
          name: string
          section_ids: string[]
          store_id: string
          thumbnail: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          global_styles: Json
          id?: string
          name: string
          section_ids: string[]
          store_id: string
          thumbnail?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          global_styles?: Json
          id?: string
          name?: string
          section_ids?: string[]
          store_id?: string
          thumbnail?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_templates_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean | null
          store_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean | null
          store_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          product_image: string
          product_name: string
          quantity: number
          selected_color: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          product_image: string
          product_name: string
          quantity: number
          selected_color?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          product_image?: string
          product_name?: string
          quantity?: number
          selected_color?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          carrier: string | null
          city: string
          created_at: string
          email: string
          estimated_delivery: string | null
          first_name: string
          id: string
          last_name: string
          payment_method: string
          phone: string
          shipping_cost: number
          state: string
          status: string
          store_id: string | null
          subtotal: number
          total: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          carrier?: string | null
          city: string
          created_at?: string
          email: string
          estimated_delivery?: string | null
          first_name: string
          id?: string
          last_name: string
          payment_method: string
          phone: string
          shipping_cost?: number
          state: string
          status?: string
          store_id?: string | null
          subtotal: number
          total: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          carrier?: string | null
          city?: string
          created_at?: string
          email?: string
          estimated_delivery?: string | null
          first_name?: string
          id?: string
          last_name?: string
          payment_method?: string
          phone?: string
          shipping_cost?: number
          state?: string
          status?: string
          store_id?: string | null
          subtotal?: number
          total?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      paypal_pending_orders: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          paypal_order_id: string
          plan_id: string
          store_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string
          created_at?: string
          id?: string
          paypal_order_id: string
          plan_id: string
          store_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          paypal_order_id?: string
          plan_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "paypal_pending_orders_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paypal_pending_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          name: string
          price_adjustment: number | null
          product_id: string
          sku: string | null
          stock: number
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price_adjustment?: number | null
          product_id: string
          sku?: string | null
          stock?: number
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price_adjustment?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          collection: string
          colors: string[] | null
          created_at: string
          description: string | null
          features: string[] | null
          id: string
          image: string
          images: string[] | null
          is_new: boolean | null
          is_on_sale: boolean | null
          materials: string | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          stock: number
          store_id: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          collection: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image: string
          images?: string[] | null
          is_new?: boolean | null
          is_on_sale?: boolean | null
          materials?: string | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          stock?: number
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          collection?: string
          colors?: string[] | null
          created_at?: string
          description?: string | null
          features?: string[] | null
          id?: string
          image?: string
          images?: string[] | null
          is_new?: boolean | null
          is_on_sale?: boolean | null
          materials?: string | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          stock?: number
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      store_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          sort_order: number | null
          store_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
          store_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_customers: {
        Row: {
          created_at: string
          id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      store_layouts: {
        Row: {
          created_at: string
          id: string
          sections: Json
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          sections?: Json
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          sections?: Json
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_layouts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_subscriptions: {
        Row: {
          created_at: string
          id: string
          last_payment_date: string | null
          next_payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          plan_id: string
          status: string
          store_id: string
          subscription_end_date: string | null
          subscription_start_date: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id: string
          status?: string
          store_id: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_payment_date?: string | null
          next_payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string
          status?: string
          store_id?: string
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          accent_color: string | null
          address: string | null
          announcement_active: boolean | null
          announcement_text: string | null
          bank_info: Json | null
          banner_url: string | null
          cash_instructions: string | null
          created_at: string
          currency: string | null
          dark_mode_enabled: boolean | null
          default_theme: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          free_shipping_threshold: number | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          logo_url: string | null
          mercadopago_access_token: string | null
          min_order_amount: number | null
          name: string
          owner_id: string
          payment_methods: Json | null
          paypal_email: string | null
          phone: string | null
          primary_color: string | null
          return_policy: string | null
          secondary_color: string | null
          shipping_cost: number | null
          shipping_info: string | null
          show_reviews: boolean | null
          show_stock: boolean | null
          slug: string
          store_timezone: string | null
          tax_rate: number | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          website_url: string | null
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          announcement_active?: boolean | null
          announcement_text?: string | null
          bank_info?: Json | null
          banner_url?: string | null
          cash_instructions?: string | null
          created_at?: string
          currency?: string | null
          dark_mode_enabled?: boolean | null
          default_theme?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          free_shipping_threshold?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          mercadopago_access_token?: string | null
          min_order_amount?: number | null
          name: string
          owner_id: string
          payment_methods?: Json | null
          paypal_email?: string | null
          phone?: string | null
          primary_color?: string | null
          return_policy?: string | null
          secondary_color?: string | null
          shipping_cost?: number | null
          shipping_info?: string | null
          show_reviews?: boolean | null
          show_stock?: boolean | null
          slug: string
          store_timezone?: string | null
          tax_rate?: number | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          announcement_active?: boolean | null
          announcement_text?: string | null
          bank_info?: Json | null
          banner_url?: string | null
          cash_instructions?: string | null
          created_at?: string
          currency?: string | null
          dark_mode_enabled?: boolean | null
          default_theme?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          free_shipping_threshold?: number | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          mercadopago_access_token?: string | null
          min_order_amount?: number | null
          name?: string
          owner_id?: string
          payment_methods?: Json | null
          paypal_email?: string | null
          phone?: string | null
          primary_color?: string | null
          return_policy?: string | null
          secondary_color?: string | null
          shipping_cost?: number | null
          shipping_info?: string | null
          show_reviews?: boolean | null
          show_stock?: boolean | null
          slug?: string
          store_timezone?: string | null
          tax_rate?: number | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          website_url?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          can_customize_theme: boolean | null
          can_use_analytics: boolean | null
          can_use_coupons: boolean | null
          can_use_custom_domain: boolean | null
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_orders_per_month: number | null
          max_products: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          can_customize_theme?: boolean | null
          can_use_analytics?: boolean | null
          can_use_coupons?: boolean | null
          can_use_custom_domain?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_orders_per_month?: number | null
          max_products?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          can_customize_theme?: boolean | null
          can_use_analytics?: boolean | null
          can_use_coupons?: boolean | null
          can_use_custom_domain?: boolean | null
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_orders_per_month?: number | null
          max_products?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          store_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          store_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
