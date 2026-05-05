import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/trial";

const postSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(1).max(5000),
  platform: z.enum(["instagram", "linkedin", "facebook", "tiktok", "threads", "autre"]).default("instagram"),
  content_type: z.string().optional(),
  scheduled_at: z.string().nullable().optional(),
  status: z.enum(["brouillon", "programme", "publie"]).default("brouillon"),
});

async function getUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function checkAccess(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, trial_ends_at")
    .eq("id", userId)
    .single();

  const { effectivePlan } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  return effectivePlan !== "expired";
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // format: 2026-05
  const status = searchParams.get("status");

  let query = supabase
    .from("planning_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (month) {
    const [year, m] = month.split("-");
    const start = `${year}-${m}-01`;
    const end = new Date(parseInt(year), parseInt(m), 0).toISOString().split("T")[0];
    query = query.gte("scheduled_at", start).lte("scheduled_at", end);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const hasAccess = await checkAccess(supabase, user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Votre essai est terminé. Abonnez-vous pour utiliser le planning.", trialExpired: true }, { status: 403 });
  }

  const body = await request.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("planning_posts")
    .insert({ ...parsed.data, user_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const parsed = postSchema.partial().safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("planning_posts")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const user = await getUser(supabase);
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const { error } = await supabase
    .from("planning_posts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
