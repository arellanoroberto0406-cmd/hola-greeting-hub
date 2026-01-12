import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export const useProductReviews = (productId?: string) => {
  return useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: async () => {
      if (!productId) return [];

      // Get reviews
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Get user profiles for reviews
      const userIds = [...new Set(reviews.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return reviews.map((review) => ({
        ...review,
        profiles: profilesMap.get(review.user_id) || null,
      })) as Review[];
    },
    enabled: !!productId,
  });
};

export const useProductReviewStats = (productId?: string) => {
  return useQuery({
    queryKey: ["product-review-stats", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", productId);

      if (error) throw error;

      if (!data.length) return { averageRating: 0, totalReviews: 0, distribution: {} };

      const total = data.reduce((sum, r) => sum + r.rating, 0);
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((r) => {
        distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      });

      return {
        averageRating: total / data.length,
        totalReviews: data.length,
        distribution,
      };
    },
    enabled: !!productId,
  });
};

export const useUserReview = (productId?: string, userId?: string) => {
  return useQuery({
    queryKey: ["user-review", productId, userId],
    queryFn: async () => {
      if (!productId || !userId) return null;

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data as Review | null;
    },
    enabled: !!productId && !!userId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      product_id: string;
      user_id: string;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["product-review-stats", variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.product_id] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      productId,
      ...updates
    }: {
      id: string;
      productId: string;
      rating?: number;
      title?: string;
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product-review-stats", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.productId] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, productId }: { id: string; productId: string }) => {
      const { error } = await supabase.from("reviews").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product-reviews", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["product-review-stats", variables.productId] });
      queryClient.invalidateQueries({ queryKey: ["user-review", variables.productId] });
    },
  });
};
