"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

type Story = {
  id: number; slide1_type: string;
  poll_question?: string; info_text?: string;
  slide3_type: string; banner_text?: string;
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const PER = 20;

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => setStories(d.stories ?? []));
  }, []);

  const toggle = (id: number) =>
    setOpen(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const copy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const visible = stories.slice(page * PER, (page + 1) * PER);
  const totalPages = Math.ceil(stories.length / PER);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Stories</h1>
        <p className="text-gray-500 text-sm mt-1">{stories.length} stories · 3 slides chacune</p>
      </div>

      {visible.map(s => {
        const isOpen = open.has(s.id);
        const preview = (s.poll_question ?? "").slice(0, 80);
        return (
          <div key={s.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <button onClick={() => toggle(s.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                #{s.id}
              </span>
              <span className="text-sm text-gray-700 flex-1 truncate">{preview}</span>
              {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </button>

            {isOpen && (
              <div className="border-t border-gray-100 px-4 py-4 space-y-4">
                {s.poll_question && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Slide 1</span>
                      <button onClick={() => copy(s.poll_question!, s.id)}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700">
                        {copied === s.id ? <><Check className="h-3 w-3 text-green-500" /> Copié</> : <><Copy className="h-3 w-3" /> Copier</>}
                      </button>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{s.poll_question}</p>
                  </div>
                )}
                {s.info_text && (
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Slide 2 — Info</span>
                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 rounded-xl p-3 leading-relaxed">{s.info_text}</p>
                  </div>
                )}
                {s.banner_text && (
                  <div>
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Slide 3 — Bandeau</span>
                    <p className="text-sm font-semibold text-gray-800 mt-1 bg-gray-50 rounded-xl p-3">{s.banner_text}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40">
            ← Précédent
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
            className="text-sm px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-40">
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
