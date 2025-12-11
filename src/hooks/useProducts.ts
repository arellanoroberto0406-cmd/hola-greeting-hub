import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";

// Mapear datos de DB a tipo Product
const mapDbProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  price: Number(dbProduct.price),
  originalPrice: dbProduct.original_price ? Number(dbProduct.original_price) : undefined,
  image: dbProduct.image,
  images: dbProduct.images || [],
  colors: dbProduct.colors || [],
  collection: dbProduct.collection,
  stock: dbProduct.stock,
  description: dbProduct.description || "",
  isNew: dbProduct.is_new || false,
  isOnSale: dbProduct.is_on_sale || false,
  rating: Number(dbProduct.rating) || 0,
  reviewCount: dbProduct.review_count || 0,
  materials: dbProduct.materials || "",
  features: dbProduct.features || [],
});

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(mapDbProduct);
    },
  });
};

export const useProductsByBrand = (brand: string) => {
  return useQuery({
    queryKey: ["products", "brand", brand],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("brand", brand)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(mapDbProduct);
    },
    enabled: !!brand,
  });
};

export const useProductsByCollection = (collection: string) => {
  return useQuery({
    queryKey: ["products", "collection", collection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("collection", collection)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(mapDbProduct);
    },
    enabled: !!collection,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      return mapDbProduct(data);
    },
    enabled: !!id,
  });
};

export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      const newStock = Math.max(0, product.stock - quantity);
      
      const { error } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};
