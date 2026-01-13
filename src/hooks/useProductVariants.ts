import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  value: string;
  stock: number;
  price_adjustment: number;
  sku?: string;
  created_at: string;
}

export const useProductVariants = (productId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variants, isLoading } = useQuery({
    queryKey: ["product-variants", productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });

  const createVariant = useMutation({
    mutationFn: async (variant: Omit<ProductVariant, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("product_variants")
        .insert(variant)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      toast({ title: "Variante creada" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateVariant = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      const { data, error } = await supabase
        .from("product_variants")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      toast({ title: "Variante actualizada" });
    },
  });

  const deleteVariant = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      toast({ title: "Variante eliminada" });
    },
  });

  return {
    variants,
    isLoading,
    createVariant,
    updateVariant,
    deleteVariant,
  };
};
