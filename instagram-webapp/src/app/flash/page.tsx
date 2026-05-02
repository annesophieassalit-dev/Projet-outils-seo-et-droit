"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

type FlashPost = {
  id: number; week: number;
  main_text: string; pill_text: string;
  label: string; caption?: string;
};

export default function FlashPage() {
  const [posts, setPosts] = useState<FlashPost[]>([]);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => setPosts(d.flash_posts ?? []));
  }, []);

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Flash Posts</h1>
        <p className="text-gray-500 text-sm mt-1">{posts.length} posts · variante jaune + bleue</p>
      </div>

      {posts.map(p => (
        <div key={p.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-400">Semaine {p.week} · #{p.id}</span>
              <div className="mt-1">
                <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {p.pill_text}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-300" title="Variante jaune" />
              <div className="w-5 h-5 rounded-full bg-blue-400"   title="Variante bleue" />
            </div>
          </div>

          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-medium whitespace-pre-line leading-relaxed">{p.main_text}</p>
            {p.caption && (
              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Caption</span>
                  <button onClick={() => copy(p.caption!, p.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900">
                    {copied === p.id
                      ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copié</>
                      : <><Copy className="h-3.5 w-3.5" /> Copier</>}
                  </button>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-xl p-3 leading-relaxed">
                  {p.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
