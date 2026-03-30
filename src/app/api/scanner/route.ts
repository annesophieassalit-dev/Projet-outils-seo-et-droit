import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { scanTextBasic, scanTextWithAI } from "@/lib/analyzers/text-scanner";

const schema = z.object({
  text: z.string().min(10, "Le texte doit contenir au moins 10 caractères.").max(8000),
  useAI: z.boolean().default(false),
});

const SCAN_LIMITS: Record<string, number> = {
  gratuit: 5,
  essentiel: 20,
  pro: -1, // illimité
};

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
    .select("plan, profession, scans_used_this_month, audits_reset_date")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "gratuit";
  const limit = SCAN_LIMITS[plan] ?? 5;
  const scansUsed = profile?.scans_used_this_month || 0;

  // Réinitialisation mensuelle (même date que les audits)
  const now = new Date();
  const resetDate = profile?.audits_reset_date ? new Date(profile.audits_reset_date) : null;
  if (resetDate && now > resetDate) {
    await supabase
      .from("profiles")
      .update({
        scans_used_this_month: 0,
        audits_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      })
      .eq("id", user.id);
  }

  // Vérification limite
  if (limit !== -1 && scansUsed >= limit) {
    return NextResponse.json(
      {
        error: `Vous avez utilisé vos ${limit} scans gratuits ce mois-ci. Passez au plan Pro pour des scans illimités.`,
        limitReached: true,
        scansUsed,
        limit,
      },
      { status: 403 }
    );
  }

  const canUseAI = plan === "pro" && useAI;

  const result = canUseAI
    ? await scanTextWithAI(text, profile?.profession || "")
    : scanTextBasic(text);

  // Incrémenter le compteur + enregistrer l'événement
  await Promise.all([
    supabase.from("profiles").update({ scans_used_this_month: scansUsed + 1 }).eq("id", user.id),
    supabase.from("usage_events").insert({ user_id: user.id, type: "scan" }),
  ]);

  return NextResponse.json({ result, scansUsed: scansUsed + 1, limit });
}
