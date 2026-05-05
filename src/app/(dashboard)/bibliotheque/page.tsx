import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/trial";
import BibliothequeClient from "./BibliothequeClient";

export default async function BibliothequePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at")
    .eq("id", user!.id)
    .single();

  const { effectivePlan } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  return <BibliothequeClient plan={effectivePlan} />;
}
