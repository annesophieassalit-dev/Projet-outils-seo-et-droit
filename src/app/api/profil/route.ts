import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data } = await supabase
    .from("profiles")
    .select("full_name, profession, ville, themes_recurrents, ton_prefere, specificites")
    .eq("id", user.id)
    .single();

  return NextResponse.json(data ?? {});
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { full_name, profession, ville, themes_recurrents, ton_prefere, specificites } = body;

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, profession, ville, themes_recurrents, ton_prefere, specificites })
    .eq("id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
