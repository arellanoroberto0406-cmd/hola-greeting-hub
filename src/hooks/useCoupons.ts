import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id: string;
  store_id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_purchase: number;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useStoreCoupons = (storeId?: string) => {
  return useQuery({
    queryKey: ["store-coupons", storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!storeId,
  });
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (coupon: Omit<Coupon, "id" | "created_at" | "updated_at" | "uses_count">) => {
      const { data, error } = await supabase
        .from("coupons")
        .insert(coupon)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-coupons"] });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Coupon> & { id: string }) => {
      const { data, error } = await supabase
        .from("coupons")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-coupons"] });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-coupons"] });
    },
  });
};

export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async ({ storeId, code, subtotal }: { storeId: string; code: string; subtotal: number }) => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("store_id", storeId)
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error) throw new Error("Cupón no válido");

      const coupon = data as Coupon;

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        throw new Error("Este cupón ha expirado");
      }

      // Check max uses
      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        throw new Error("Este cupón ha alcanzado su límite de usos");
      }

      // Check minimum purchase
      if (subtotal < coupon.min_purchase) {
        throw new Error(`Compra mínima de $${coupon.min_purchase} requerida`);
      }

      // Calculate discount
      const discount =
        coupon.discount_type === "percentage"
          ? (subtotal * coupon.discount_value) / 100
          : coupon.discount_value;

      return {
        coupon,
        discount: Math.min(discount, subtotal), // Can't discount more than subtotal
      };
    },
  });
};

export const useIncrementCouponUse = () => {
  return useMutation({
    mutationFn: async (couponId: string) => {
      // Get current uses and increment
      const { data: coupon } = await supabase
        .from("coupons")
        .select("uses_count")
        .eq("id", couponId)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({ uses_count: (coupon.uses_count || 0) + 1 })
          .eq("id", couponId);
      }
    },
  });
};
