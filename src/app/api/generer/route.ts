import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateContent, generateVariant } from "@/lib/analyzers/content-generator";

const generateSchema = z.object({
  contentType: z.enum([
    "bio_instagram", "presentation_activite", "description_programme",
    "post_linkedin", "fiche_google", "post_instagram", "accroche_site",
  ]),
  profession: z.string().min(1),
  themes: z.array(z.string()).default([]),
  specificites: z.string().max(500).optional(),
  tone: z.enum(["professionnel", "chaleureux", "sobre"]).default("chaleureux"),
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
    .select("plan, profession, posts_generated_total")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan || "gratuit";

  if (plan === "gratuit") {
    return NextResponse.json(
      { error: "Le générateur de contenus est disponible à partir du plan Pro (19€/mois).", upgradeRequired: true },
      { status: 403 }
    );
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

  // Génération principale
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  // Utiliser la profession du profil si non fournie
  const input = {
    ...parsed.data,
    profession: parsed.data.profession || profile?.profession || "praticien bien-être",
  };

  const result = await generateContent(input);

  // Incrémenter le compteur total de posts générés
  await supabase
    .from("profiles")
    .update({ posts_generated_total: (profile?.posts_generated_total || 0) + 1 })
    .eq("id", user.id);

  return NextResponse.json({ result });
}
