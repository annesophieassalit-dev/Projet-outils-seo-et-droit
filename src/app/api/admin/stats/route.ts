import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
  }

  // ── Statistiques utilisateurs ──────────────────────────────────────────────
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, profession, plan, subscription_status, audits_used_this_month, scans_used_this_month, created_at")
    .order("created_at", { ascending: false });

  const total = profiles?.length || 0;
  const gratuit = profiles?.filter(p => p.plan === "gratuit").length || 0;
  const pro = profiles?.filter(p => p.plan === "pro").length || 0;
  const actifs30j = profiles?.filter(p => {
    const d = new Date(p.created_at);
    return Date.now() - d.getTime() < 30 * 24 * 60 * 60 * 1000;
  }).length || 0;

  // ── Statistiques audits ────────────────────────────────────────────────────
  const { count: totalAudits } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true });

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count: auditsThisMonth } = await supabase
    .from("audits")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth);

  // ── Revenus estimés ────────────────────────────────────────────────────────
  const mrr = pro * 19;

  return NextResponse.json({
    users: {
      total,
      gratuit,
      pro,
      actifs30j,
      recent: profiles?.slice(0, 20) || [],
    },
    audits: {
      total: totalAudits || 0,
      thisMonth: auditsThisMonth || 0,
    },
    revenue: {
      mrr,
      arr: mrr * 12,
    },
  });
}
