import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // ── Utilisateurs ───────────────────────────────────────────────────────────
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, profession, plan, audits_used_this_month, scans_used_this_month, posts_generated_this_month, created_at")
    .order("created_at", { ascending: false });

  const total = profiles?.length || 0;
  const gratuit = profiles?.filter(p => p.plan === "gratuit").length || 0;
  const pro = profiles?.filter(p => p.plan === "pro").length || 0;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const nouveauxCeMois = profiles?.filter(p => p.created_at >= startOfMonth).length || 0;

  // ── Audits ─────────────────────────────────────────────────────────────────
  const { count: totalAudits } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true });

  const { count: auditsThisMonth } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth);

  // ── Usage agrégé ───────────────────────────────────────────────────────────
  const totalScans = profiles?.reduce((acc, p) => acc + (p.scans_used_this_month || 0), 0) || 0;
  const postsThisMonth = profiles?.reduce((acc, p) => acc + (p.posts_generated_this_month || 0), 0) || 0;

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
    users: { total, gratuit, pro, nouveauxCeMois, recent },
    audits: { total: totalAudits || 0, thisMonth: auditsThisMonth || 0 },
    usage: { scansThisMonth: totalScans, postsThisMonth },
    revenue: { mrr, arr: mrr * 12 },
  });
}
