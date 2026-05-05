export interface TrialInfo {
  effectivePlan: string;
  isTrialing: boolean;
  trialDaysLeft: number;
  trialExpired: boolean;
}

export function getEffectivePlan(profile: {
  plan: string;
  trial_ends_at?: string | null;
}): TrialInfo {
  const now = new Date();
  const trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const isTrialing = trialEnd ? now < trialEnd : false;
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isTrialing) {
    return { effectivePlan: "pro", isTrialing: true, trialDaysLeft, trialExpired: false };
  }

  const hasPaidPlan = profile.plan === "essentiel" || profile.plan === "pro";
  if (!hasPaidPlan) {
    return { effectivePlan: "expired", isTrialing: false, trialDaysLeft: 0, trialExpired: !!trialEnd };
  }

  return { effectivePlan: profile.plan, isTrialing: false, trialDaysLeft: 0, trialExpired: false };
}
