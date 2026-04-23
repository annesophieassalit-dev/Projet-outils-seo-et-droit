"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { PILLAR_LABELS } from "@/types/content";
import type { Content } from "@/types/content";

const STORAGE_KEY = 'tiktok_contents';

export default function ContenuPage() {
  const [contents, setContents] = useState<Content[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContents(JSON.parse(saved));
  }, []);

  const deleteOne = (id: string) => {
    const updated = contents.filter((c) => c.id !== id);
    setContents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="bg-[#2B2B2B] text-white px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="font-bold">Mes contenus ({contents.length})</h1>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {contents.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <p>Aucun contenu généré pour le moment.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-[#2B2B2B] underline">← Générer du contenu</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="divide-y divide-stone-50">
              {contents.map((c) => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-16 rounded-lg bg-[#2B2B2B] shrink-0 overflow-hidden">
                    {c.image_svgs?.[0] && (
                      <img src={`data:image/png;base64,${c.image_svgs[0]}`} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.hook}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {PILLAR_LABELS[c.pillar]} · {c.content_type === 'carousel' ? 'Carrousel' : 'Vidéo longue'} · {c.slides.length} slides
                    </p>
                    <p className="text-xs text-gray-300 mt-0.5">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/?open=${c.id}`} className="p-1.5 rounded-lg hover:bg-stone-100">
                      <Eye className="h-4 w-4 text-gray-400" />
                    </Link>
                    <button onClick={() => deleteOne(c.id)} className="p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 className="h-4 w-4 text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
