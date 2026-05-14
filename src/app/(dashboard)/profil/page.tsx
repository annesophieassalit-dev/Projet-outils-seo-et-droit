import { createClient } from "@/lib/supabase/server";
import ProfilClient from "./ProfilClient";

export default async function ProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profession, ville, themes_recurrents, ton_prefere, specificites")
    .eq("id", user!.id)
    .single();

  return <ProfilClient profile={profile ?? {}} />;
}
