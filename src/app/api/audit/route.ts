import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { analyzeSeo } from "@/lib/analyzers/seo-analyzer";
import { analyzeLegal } from "@/lib/analyzers/legal-analyzer";
import { getEffectivePlan } from "@/lib/trial";
import type { AuditResult } from "@/types/audit";

const auditSchema = z.object({
  url: z
    .string()
    .url("URL invalide")
    .refine(
      (u) => u.startsWith("http://") || u.startsWith("https://"),
      "L'URL doit commencer par http:// ou https://"
    ),
  profession: z.string().optional(),
  includeLegal: z.boolean().default(true),
  includeAI: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour lancer un audit." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = auditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { url, profession, includeLegal, includeAI } = parsed.data;

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, trial_ends_at, audits_used_this_month, audits_reset_date")
      .eq("id", user.id)
      .single();

    const { effectivePlan, trialExpired } = getEffectivePlan({
      plan: profile?.plan || "gratuit",
      trial_ends_at: profile?.trial_ends_at,
    });

    if (effectivePlan === "expired") {
      return NextResponse.json(
        {
          error: "Votre essai gratuit est terminé. Abonnez-vous pour continuer.",
          trialExpired: true,
        },
        { status: 403 }
      );
    }

    // Réinitialisation mensuelle
    const now = new Date();
    const resetDate = profile?.audits_reset_date
      ? new Date(profile.audits_reset_date)
      : null;
    if (resetDate && now > resetDate) {
      await supabase
        .from("profiles")
        .update({
          audits_used_this_month: 0,
          audits_reset_date: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
          ).toISOString(),
        })
        .eq("id", user.id);
    }

    const auditsUsed = profile?.audits_used_this_month || 0;
    const limits: Record<string, number> = {
      essentiel: 10,
      pro: -1,
    };
    const limit = limits[effectivePlan] ?? -1;

    if (limit !== -1 && auditsUsed >= limit) {
      return NextResponse.json(
        {
          error: `Vous avez utilisé vos ${limit} diagnostics ce mois-ci. Passez au plan Pro pour des diagnostics illimités.`,
          limitReached: true,
        },
        { status: 403 }
      );
    }

    const canDoAI = effectivePlan === "pro";

    const { data: audit, error: insertError } = await supabase
      .from("audits")
      .insert({ user_id: user.id, url, status: "running", profession })
      .select()
      .single();

    if (insertError || !audit) {
      throw new Error("Impossible de créer l'audit en base de données.");
    }

    await Promise.all([
      supabase.from("profiles").update({ audits_used_this_month: auditsUsed + 1 }).eq("id", user.id),
      supabase.from("usage_events").insert({ user_id: user.id, type: "diagnostic" }),
    ]);

    const [seoResult, legalResult] = await Promise.allSettled([
      analyzeSeo(url, { profession, useAI: canDoAI && includeAI }),
      includeLegal
        ? analyzeLegal(url, { useAI: canDoAI && includeAI, profession })
        : Promise.resolve(null),
    ]);

    const seo = seoResult.status === "fulfilled" ? seoResult.value : null;
    const legal = legalResult.status === "fulfilled" ? legalResult.value : null;

    const globalScore =
      seo && legal
        ? Math.round((seo.score + legal.score) / 2)
        : seo
        ? seo.score
        : null;

    await supabase
      .from("audits")
      .update({
        status: "completed",
        seo_score: seo?.score ?? null,
        seo_grade: seo?.grade ?? null,
        legal_score: legal?.score ?? null,
        legal_grade: legal?.grade ?? null,
        legal_risk_level: legal?.riskLevel ?? null,
        global_score: globalScore,
        seo_data: seo,
        legal_data: legal,
        pages_analyzed: 1,
        completed_at: new Date().toISOString(),
      })
      .eq("id", audit.id);

    const result: AuditResult = {
      id: audit.id,
      userId: user.id,
      url,
      createdAt: audit.created_at,
      status: "completed",
      seo,
      legal,
      globalScore,
      pagesAnalyzed: 1,
    };

    return NextResponse.json({ audit: result });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de l'analyse.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const { data } = await supabase
      .from("audits")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!data) {
      return NextResponse.json({ error: "Audit non trouvé" }, { status: 404 });
    }
    return NextResponse.json({ audit: data });
  }

  const { data } = await supabase
    .from("audits")
    .select("id, url, status, seo_score, seo_grade, legal_score, legal_grade, global_score, legal_risk_level, created_at, completed_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ audits: data || [] });
}
