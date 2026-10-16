import { createClient } from "@/lib/supabase/server";
import GenerateurClient from "./GenerateurClient";
import { getEffectivePlan } from "@/lib/trial";

export default async function GenerateurPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("profession, themes_recurrents, ton_prefere, specificites, plan, trial_ends_at, free_posts_used")
    .eq("id", user!.id)
    .single();

  const { effectivePlan } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  const freePostsLeft = effectivePlan === "gratuit"
    ? Math.max(0, 3 - (profile?.free_posts_used ?? 0))
    : null;

  return <GenerateurClient profile={profile ?? {}} freePostsLeft={freePostsLeft} />;
}
