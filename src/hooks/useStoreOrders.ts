import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderWithItems {
  id: string;
  store_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    price: number;
    selected_color: string | null;
  }[];
}

export const useStoreOrders = (storeId?: string) => {
  return useQuery({
    queryKey: ["store-orders", storeId],
    queryFn: async () => {
      if (!storeId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!storeId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-orders"] });
    },
  });
};

export const useStoreOrdersStats = (storeId?: string) => {
  return useQuery({
    queryKey: ["store-orders-stats", storeId],
    queryFn: async () => {
      if (!storeId) return null;

      const { data: orders, error } = await supabase
        .from("orders")
        .select("total, status, created_at")
        .eq("store_id", storeId);

      if (error) throw error;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        completedOrders: orders.filter((o) => o.status === "delivered").length,
        thisMonthRevenue: orders
          .filter((o) => new Date(o.created_at) >= thisMonth)
          .reduce((sum, o) => sum + o.total, 0),
        lastMonthRevenue: orders
          .filter((o) => {
            const date = new Date(o.created_at);
            return date >= lastMonth && date < thisMonth;
          })
          .reduce((sum, o) => sum + o.total, 0),
      };

      return stats;
    },
    enabled: !!storeId,
  });
};
