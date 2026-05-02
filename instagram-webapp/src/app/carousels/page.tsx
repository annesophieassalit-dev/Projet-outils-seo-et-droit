"use client";

import { useEffect, useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

type Slide = { title: string; bold?: string; paragraphs?: string[] };
type Carousel = { id: number; type: string; slides: Slide[]; caption?: string };

const LABELS: Record<string, string> = { blanc: "Blanc", seo: "SEO", rgpd: "RGPD" };
const COLORS: Record<string, string> = {
  blanc: "bg-stone-100 text-stone-700",
  seo:   "bg-blue-100  text-blue-700",
  rgpd:  "bg-green-100 text-green-700",
};

export default function CarouselsPage() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/content").then(r => r.json()).then(d => setCarousels(d.carousels ?? []));
  }, []);

  const toggle = (k: string) =>
    setOpen(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const copy = (text: string, k: string) => {
    navigator.clipboard.writeText(text);
    setCopied(k);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Carousels</h1>
      {(["blanc", "seo", "rgpd"] as const).map(type => {
        const group = carousels.filter(c => c.type === type);
        if (!group.length) return null;
        return (
          <section key={type} className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {LABELS[type]} · {group.length}
            </h2>
            {group.map(c => {
              const k = `${type}-${c.id}`;
              const isOpen = open.has(k);
              return (
                <div key={k} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                  <button onClick={() => toggle(k)}
                    className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${COLORS[type]}`}>
                      {LABELS[type]} #{c.id}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {c.slides?.[0]?.title}
                    </span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {/* Slides */}
                      <div className="px-5 py-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{c.slides?.length} slides</p>
                        {c.slides?.map((s, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-gray-400 text-xs mr-2">#{i + 1}</span>
                            <span className="font-medium">{s.title}</span>
                            {s.bold && <p className="text-xs text-gray-500 ml-5 mt-0.5">{s.bold}</p>}
                          </div>
                        ))}
                      </div>
                      {/* Caption */}
                      {c.caption && (
                        <div className="px-5 pb-4 space-y-2 border-t border-gray-50">
                          <div className="flex items-center justify-between pt-3">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caption</span>
                            <button onClick={() => copy(c.caption!, k)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900">
                              {copied === k
                                ? <><Check className="h-3.5 w-3.5 text-green-500" /> Copié</>
                                : <><Copy className="h-3.5 w-3.5" /> Copier</>}
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 whitespace-pre-line bg-gray-50 rounded-xl p-3 leading-relaxed">
                            {c.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
