import { createClient } from "@/lib/supabase/server";
import BibliothequeClient from "./BibliothequeClient";

export default async function BibliothequePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user!.id)
    .single();

  const plan = profile?.plan || "gratuit";

  return <BibliothequeClient plan={plan} />;
}
