"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Images, Camera, Zap, ChevronRight } from "lucide-react";

interface Stats {
  carousels: { type: string }[];
  flash_posts: unknown[];
  stories: unknown[];
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(setStats);
  }, []);

  const blanc = stats?.carousels.filter(c => c.type === "blanc").length ?? "…";
  const seo   = stats?.carousels.filter(c => c.type === "seo").length ?? "…";
  const rgpd  = stats?.carousels.filter(c => c.type === "rgpd").length ?? "…";

  const sections = [
    {
      href: "/carousels",
      icon: Images,
      label: "Carousels",
      desc: `${blanc} blanc · ${seo} SEO · ${rgpd} RGPD`,
      color: "border-rose-200 bg-rose-50",
      iconColor: "text-rose-500",
    },
    {
      href: "/stories",
      icon: Camera,
      label: "Stories",
      desc: `${stats?.stories.length ?? "…"} stories · 3 slides chacune`,
      color: "border-purple-200 bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      href: "/flash",
      icon: Zap,
      label: "Flash Posts",
      desc: `${stats?.flash_posts.length ?? "…"} posts · 2 variantes`,
      color: "border-amber-200 bg-amber-50",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour Anne-Sophie 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Ton contenu Instagram est prêt.</p>
      </div>

      <div className="space-y-3">
        {sections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-4 p-5 rounded-2xl border ${s.color} hover:shadow-sm transition-shadow`}
          >
            <s.icon className={`h-8 w-8 ${s.iconColor} shrink-0`} />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{s.label}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-900">Comment publier</p>
        <ol className="space-y-1.5 list-decimal list-inside text-gray-500">
          <li>Lance <code className="bg-gray-100 px-1 rounded text-xs">python export.py</code> sur ton ordi</li>
          <li>Envoie le ZIP sur ton téléphone</li>
          <li>Copie le caption depuis cette app</li>
          <li>Publie sur Instagram depuis l&apos;app</li>
        </ol>
      </div>
    </div>
  );
}
