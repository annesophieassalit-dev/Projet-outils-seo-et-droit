import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, profession, plan, audits_used_this_month")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar plan={profile?.plan || "gratuit"} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          user={{
            email: user.email || "",
            fullName: profile?.full_name || "",
            plan: profile?.plan || "gratuit",
          }}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
