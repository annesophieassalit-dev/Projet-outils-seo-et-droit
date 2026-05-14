import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateContent, generateVariant } from "@/lib/analyzers/content-generator";
import { getEffectivePlan } from "@/lib/trial";

const generateSchema = z.object({
  contentType: z.enum([
    "bio_instagram", "presentation_activite", "article_blog",
    "post_linkedin", "post_instagram", "post_facebook", "post_tiktok", "post_threads",
    "fiche_google", "post_google", "accroche_site", "hook_reseaux", "script_youtube",
  ]),
  profession: z.string().min(1, "Veuillez indiquer votre activité (ex : Naturopathe, Coach de vie…)"),
  themes: z.array(z.string()).default([]),
  specificites: z.string().max(500).optional(),
  tone: z.enum(["professionnel", "chaleureux", "sobre"]).default("chaleureux"),
  intention: z.enum(["faire_connaitre", "inviter_contact", "expliquer"]).default("faire_connaitre"),
});

const variantSchema = z.object({
  original: z.string().min(10).max(3000),
  contentType: z.string(),
  profession: z.string(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at, profession, posts_generated_this_month, audits_reset_date")
    .eq("id", user.id)
    .single();

  const { effectivePlan } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  if (effectivePlan === "expired") {
    return NextResponse.json(
      { error: "Votre essai gratuit est terminé. Abonnez-vous pour continuer.", trialExpired: true },
      { status: 403 }
    );
  }

  const now = new Date();
  const resetDate = profile?.audits_reset_date ? new Date(profile.audits_reset_date) : null;
  if (resetDate && now > resetDate) {
    await supabase
      .from("profiles")
      .update({
        posts_generated_this_month: 0,
        audits_reset_date: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      })
      .eq("id", user.id);
  }

  const body = await request.json();
  const { action } = body;

  if (action === "variant") {
    const parsed = variantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }
    const variant = await generateVariant(
      parsed.data.original,
      parsed.data.contentType as never,
      parsed.data.profession
    );
    return NextResponse.json({ variant });
  }

  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const input = {
    ...parsed.data,
    profession: parsed.data.profession || profile?.profession || "praticien bien-être",
  };

  const result = await generateContent(input);

  await Promise.all([
    supabase.from("profiles").update({ posts_generated_this_month: (profile?.posts_generated_this_month || 0) + 1 }).eq("id", user.id),
    supabase.from("usage_events").insert({ user_id: user.id, type: "post" }),
  ]);

  return NextResponse.json({ result });
}
