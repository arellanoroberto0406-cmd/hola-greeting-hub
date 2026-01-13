import { useStoreSubscription } from "./useSubscription";

export type PlanTier = "basic" | "professional" | "enterprise";

export const useStorePlanTier = (storeId: string | undefined) => {
  const { data: subscription, isLoading } = useStoreSubscription(storeId);

  const getPlanTier = (): PlanTier => {
    if (!subscription?.plan) return "basic";
    
    const planSlug = subscription.plan.slug?.toLowerCase();
    
    if (planSlug === "empresarial" || planSlug === "enterprise") {
      return "enterprise";
    }
    if (planSlug === "profesional" || planSlug === "professional") {
      return "professional";
    }
    return "basic";
  };

  const planTier = getPlanTier();

  // Check if subscription is active
  const isActive = () => {
    if (!subscription) return false;
    
    const now = new Date();
    
    if (subscription.status === 'trial' && subscription.trial_end_date) {
      const trialEnd = new Date(subscription.trial_end_date);
      return trialEnd > now;
    }
    
    if (subscription.status === 'active' || subscription.status === 'pending_renewal') {
      return true;
    }
    
    return false;
  };

  return {
    planTier: isActive() ? planTier : "basic",
    subscription,
    isLoading,
    isActive: isActive(),
    plan: subscription?.plan,
  };
};

export default useStorePlanTier;
