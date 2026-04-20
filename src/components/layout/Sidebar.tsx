"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Search,
  FileText,
  CreditCard,
  Settings,
  Sparkles,
  ScanText,
  BookOpen,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
  },
  {
    href: "/audit/nouveau",
    label: "Nouveau diagnostic",
    icon: Search,
  },
  {
    href: "/scanner",
    label: "Scanner de texte",
    icon: ScanText,
  },
  {
    href: "/generateur",
    label: "Générateur",
    icon: Sparkles,
  },
  {
    href: "/bibliotheque",
    label: "Bibliothèque",
    icon: BookOpen,
  },
  {
    href: "/rapports",
    label: "Mes rapports",
    icon: FileText,
  },
  {
    href: "/tiktok",
    label: "TikTok Auto",
    icon: Video,
  },
  {
    href: "/abonnement",
    label: "Abonnement",
    icon: CreditCard,
  },
];

interface SidebarProps {
  plan: string;
}

export default function Sidebar({ plan }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex flex-col">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-zen-700" />
            <span className="font-bold text-gray-900 text-sm">Visible & Conforme</span>
          </div>
          <span className="text-xs text-gray-400 ml-8">Analysez. Ajustez. Communiquez.</span>
        </Link>
      </div>

      {/* Plan badge */}
      {plan !== "gratuit" && (
        <div className="mx-4 mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium",
              plan === "pro"
                ? "bg-gray-900 text-yellow-300"
                : "bg-zen-100 text-zen-800"
            )}
          >
            {plan === "pro" && <Sparkles className="h-3 w-3" />}
            Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-zen-50 text-zen-800"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-zen-700" : "text-gray-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer nav */}
      <div className="px-3 py-3 border-t border-gray-100">
        <Link
          href="/compte"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/compte"
              ? "bg-zen-50 text-zen-800"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings className="h-4 w-4 text-gray-400" />
          Paramètres
        </Link>
      </div>
    </aside>
  );
}
