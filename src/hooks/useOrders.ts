import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CartItem } from "@/types/product";

interface OrderData {
  storeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData: OrderData) => {
      if (!orderData.storeId) {
        throw new Error("No se detectó la tienda para este pedido.");
      }

      const subtotal = Number(orderData.subtotal);
      const shippingCost = Number(orderData.shippingCost);
      const total = Number(orderData.total);

      if (!Number.isFinite(subtotal) || !Number.isFinite(shippingCost) || !Number.isFinite(total)) {
        throw new Error("Totales inválidos. Por favor recarga e intenta de nuevo.");
      }

      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          store_id: orderData.storeId,
          user_id: user?.id || null,
          first_name: orderData.firstName,
          last_name: orderData.lastName,
          email: orderData.email,
          phone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          state: orderData.state,
          zip_code: orderData.zipCode,
          payment_method: orderData.paymentMethod,
          subtotal,
          shipping_cost: shippingCost,
          total,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.id.includes("-") ? null : item.id, // UUID check
        product_name: item.name,
        product_image: item.image,
        selected_color: item.selectedColor || null,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
  });
};

export const useUserOrders = (email?: string) => {
  return useQuery({
    queryKey: ["orders", email],
    queryFn: async () => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("email", email)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!email,
  });
};
