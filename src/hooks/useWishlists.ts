import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useWishlists = (storeId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["wishlists", user?.id, storeId],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from("wishlists")
        .select(`
          *,
          products (*)
        `)
        .eq("user_id", user.id);
      
      if (storeId) {
        query = query.eq("store_id", storeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addToWishlist = useMutation({
    mutationFn: async ({ productId, storeId }: { productId: string; storeId: string }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("wishlists")
        .insert({
          user_id: user.id,
          product_id: productId,
          store_id: storeId,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
      toast({
        title: "Agregado a favoritos",
        description: "El producto se agregó a tu lista de deseos",
      });
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast({
          title: "Ya está en favoritos",
          description: "Este producto ya está en tu lista de deseos",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlists"] });
      toast({
        title: "Eliminado de favoritos",
        description: "El producto se eliminó de tu lista de deseos",
      });
    },
  });

  const isInWishlist = (productId: string) => {
    return wishlistItems?.some((item) => item.product_id === productId) || false;
  };

  const toggleWishlist = async (productId: string, storeId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist.mutateAsync(productId);
    } else {
      await addToWishlist.mutateAsync({ productId, storeId });
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };
};
