import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: string[];
  max_products: number;
  max_orders_per_month: number;
  can_use_coupons: boolean;
  can_use_analytics: boolean;
  can_customize_theme: boolean;
  can_use_custom_domain: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface StoreSubscription {
  id: string;
  store_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled' | 'pending_renewal' | 'trial_expired';
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  created_at: string;
  updated_at: string;
  paypal_subscription_id?: string | null;
  auto_renew?: boolean;
  plan?: SubscriptionPlan;
}

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });
};

export const useStoreSubscription = (storeId: string | undefined) => {
  return useQuery({
    queryKey: ["store-subscription", storeId],
    queryFn: async () => {
      if (!storeId) return null;
      
      const { data, error } = await supabase
        .from("store_subscriptions")
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq("store_id", storeId)
        .maybeSingle();

      if (error) throw error;
      return data as (StoreSubscription & { plan: SubscriptionPlan }) | null;
    },
    enabled: !!storeId,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, planId }: { storeId: string; planId: string }) => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .insert({
          store_id: storeId,
          plan_id: planId,
          status: 'trial',
          trial_start_date: new Date().toISOString(),
          trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["store-subscription", variables.storeId] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      updates 
    }: { 
      subscriptionId: string; 
      updates: Partial<StoreSubscription>;
    }) => {
      const { data, error } = await supabase
        .from("store_subscriptions")
        .update(updates)
        .eq("id", subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-subscription"] });
    },
  });
};

export const useSubscriptionStatus = (storeId: string | undefined) => {
  const { data: subscription, isLoading } = useStoreSubscription(storeId);

  const getStatus = () => {
    if (!subscription) return { isActive: false, status: 'none', daysLeft: 0 };

    const now = new Date();
    
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date);
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0) {
        return { isActive: true, status: 'trial', daysLeft };
      } else {
        return { isActive: false, status: 'trial_expired', daysLeft: 0 };
      }
    }

    if (subscription.status === 'active' || subscription.status === 'pending_renewal') {
      const endDate = subscription.subscription_end_date 
        ? new Date(subscription.subscription_end_date) 
        : null;
      
      if (!endDate || endDate > now) {
        const daysLeft = endDate 
          ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        return { 
          isActive: subscription.status === 'active', 
          status: subscription.status, 
          daysLeft 
        };
      }
    }

    return { isActive: false, status: subscription.status as 'trial' | 'active' | 'expired' | 'cancelled' | 'pending_renewal' | 'trial_expired', daysLeft: 0 };
  };

  return {
    subscription,
    isLoading,
    ...getStatus(),
    plan: subscription?.plan,
  };
};
