import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/trial";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import TrialBanner from "@/components/layout/TrialBanner";
import DashboardFooter from "@/components/layout/DashboardFooter";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profession, plan, trial_ends_at, audits_used_this_month")
    .eq("id", user.id)
    .single();

  const { effectivePlan, isTrialing, trialDaysLeft, trialExpired } = getEffectivePlan({
    plan: profile?.plan || "gratuit",
    trial_ends_at: profile?.trial_ends_at,
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar plan={effectivePlan} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          user={{
            email: user.email || "",
            fullName: profile?.full_name || "",
            plan: effectivePlan,
            isTrialing,
            trialDaysLeft,
          }}
        />
        {(isTrialing || trialExpired) && (
          <TrialBanner
            isTrialing={isTrialing}
            trialDaysLeft={trialDaysLeft}
            trialExpired={trialExpired}
          />
        )}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        <DashboardFooter />
      </div>
    </div>
  );
}
