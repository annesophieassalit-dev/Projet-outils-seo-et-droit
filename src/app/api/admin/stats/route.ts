import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  // Période personnalisée ou mois en cours par défaut
  const dateFrom = searchParams.get("from") || startOfMonth;
  const dateTo = searchParams.get("to") || new Date().toISOString();

  // ── Utilisateurs ───────────────────────────────────────────────────────────
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, profession, plan, audits_used_this_month, scans_used_this_month, posts_generated_this_month, created_at")
    .order("created_at", { ascending: false });

  const total = profiles?.length || 0;
  const gratuit = profiles?.filter(p => p.plan === "gratuit").length || 0;
  const pro = profiles?.filter(p => p.plan === "pro").length || 0;
  const nouveauxSurPeriode = profiles?.filter(p => p.created_at >= dateFrom && p.created_at <= dateTo).length || 0;

  // ── Événements sur la période ──────────────────────────────────────────────
  const { data: events } = await supabase
    .from("usage_events")
    .select("type, created_at")
    .gte("created_at", dateFrom)
    .lte("created_at", dateTo);

  const diagnosticsPeriode = events?.filter(e => e.type === "diagnostic").length || 0;
  const scansPeriode = events?.filter(e => e.type === "scan").length || 0;
  const postsPeriode = events?.filter(e => e.type === "post").length || 0;

  // ── Totaux depuis le lancement ─────────────────────────────────────────────
  const { count: totalDiagnostics } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("type", "diagnostic");

  const { count: totalScans } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("type", "scan");

  const { count: totalPosts } = await supabase
    .from("usage_events")
    .select("*", { count: "exact", head: true })
    .eq("type", "post");

  // ── Revenus ────────────────────────────────────────────────────────────────
  const mrr = pro * 19;

  // ── Derniers inscrits (sans email — RGPD) ─────────────────────────────────
  const recent = profiles?.slice(0, 20).map(p => ({
    id: p.id,
    fullName: p.full_name || "Anonyme",
    profession: p.profession || "—",
    plan: p.plan,
    auditsThisMonth: p.audits_used_this_month || 0,
    scansThisMonth: p.scans_used_this_month || 0,
    postsThisMonth: p.posts_generated_this_month || 0,
    createdAt: p.created_at,
  })) || [];

  return NextResponse.json({
    periode: { from: dateFrom, to: dateTo },
    users: { total, gratuit, pro, nouveauxSurPeriode, recent },
    usage: {
      periode: { diagnostics: diagnosticsPeriode, scans: scansPeriode, posts: postsPeriode },
      total: { diagnostics: totalDiagnostics || 0, scans: totalScans || 0, posts: totalPosts || 0 },
    },
    revenue: { mrr, arr: mrr * 12 },
  });
}
