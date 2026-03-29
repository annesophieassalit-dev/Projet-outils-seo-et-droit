import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { scanTextBasic, scanTextWithAI } from "@/lib/analyzers/text-scanner";

const schema = z.object({
  text: z.string().min(10, "Le texte doit contenir au moins 10 caractères.").max(8000),
  useAI: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { text, useAI } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, profession")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "gratuit";
  const canUseAI = plan === "pro" && useAI;

  const result = canUseAI
    ? await scanTextWithAI(text, profile?.profession || "")
    : scanTextBasic(text);

  return NextResponse.json({ result });
}
