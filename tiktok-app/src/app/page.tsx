"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, RefreshCw, Eye, Copy, Check, ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import { PILLAR_LABELS } from "@/types/content";
import type { Content, ContentType, Pillar } from "@/types/content";

const PILLARS = Object.entries(PILLAR_LABELS) as [Pillar, string][];

function svgUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function downloadSvgAsPng(svg: string, filename: string): void {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
  };
  img.src = svgUrl(svg);
}

const STORAGE_KEY = 'tiktok_contents';

export default function HomePage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Content | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [customPillar, setCustomPillar] = useState<Pillar>('checklist');
  const [customType, setCustomType] = useState<ContentType>('carousel');
  const [generating, setGenerating] = useState(false);

  const generateDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_daily' }),
      });
      const data = await res.json();
      if (data.error) alert('Erreur : ' + data.error);
      if (data.contents) setContents((prev) => [...data.contents, ...prev]);
    } catch (e) {
      alert('Erreur réseau. Vérifier la clé Anthropic dans Vercel.');
    }
    setLoading(false);
  };

  const generateOne = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_one', type: customType, pillar: customPillar }),
      });
      const data = await res.json();
      if (data.error) alert('Erreur : ' + data.error);
      if (data.content) setContents((prev) => [data.content, ...prev]);
    } catch (e) {
      alert('Erreur réseau. Vérifier la clé Anthropic dans Vercel.');
    }
    setGenerating(false);
  };

  const downloadAllSlides = () => {
    if (!selected) return;
    (selected.image_svgs || []).forEach((svg, i) => {
      setTimeout(() => {
        downloadSvgAsPng(svg, `slide_${i + 1}.png`);
      }, i * 600);
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setContents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (contents.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(contents));
  }, [contents]);

  const clearAll = () => {
    if (confirm('Supprimer tous les contenus ?')) {
      setContents([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const openContent = (c: Content) => { setSelected(c); setSlideIdx(0); };

  const copyCaption = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`${selected.caption}\n\n${selected.hashtags.join(' ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-[#2B2B2B] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg tracking-wide">PRÉVOIR SANS PANIQUER</h1>
          <p className="text-xs text-gray-400 mt-0.5">Organisation alimentaire simple — TikTok Auto</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Effacer tout
          </button>
          <Link href="/contenu" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10">
            Mes contenus ({contents.length})
          </Link>
          <Link href="/parametres" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10">
            Paramètres
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Generate daily */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-gray-900 mb-1">Génération quotidienne</h2>
          <p className="text-sm text-gray-500 mb-4">Génère 2 carrousels + 1 vidéo longue automatiquement</p>
          <button
            onClick={generateDaily}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2B2B2B] rounded-xl text-white text-sm font-medium hover:bg-black disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'Génération en cours...' : 'Générer le contenu du jour'}
          </button>
        </div>

        {/* Generate custom */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Générer un contenu spécifique</h2>
          <div className="flex gap-3 flex-wrap">
            <select
              value={customPillar}
              onChange={(e) => setCustomPillar(e.target.value as Pillar)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none"
            >
              {PILLARS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select
              value={customType}
              onChange={(e) => setCustomType(e.target.value as ContentType)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none"
            >
              <option value="carousel">Carrousel</option>
              <option value="video_long">Vidéo longue</option>
            </select>
            <button
              onClick={generateOne}
              disabled={generating}
              className="flex items-center gap-2 px-4 py-2 bg-[#D6A77A] rounded-lg text-white text-sm font-medium hover:bg-[#c49060] disabled:opacity-50"
            >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {generating ? 'Génération...' : 'Générer'}
            </button>
          </div>
        </div>

        {/* Content list */}
        {contents.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Contenus générés ({contents.length})</h2>
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500">
                <Trash2 className="h-3 w-3" />Effacer
              </button>
            </div>
            <div className="divide-y divide-stone-50">
              {contents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openContent(c)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 text-left transition-colors"
                >
                  <div className="w-10 h-16 rounded-lg bg-[#2B2B2B] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.image_svgs?.[0] ? (
                      <img src={svgUrl(c.image_svgs[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xs">{c.content_type === 'carousel' ? '▤' : '▶'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.hook}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{PILLAR_LABELS[c.pillar]} · {c.content_type === 'carousel' ? 'Carrousel' : 'Vidéo longue'}</p>
                  </div>
                  <Eye className="h-4 w-4 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {contents.length === 0 && !loading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Clique sur "Générer le contenu du jour" pour commencer
          </div>
        )}
      </div>

      {/* Content modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-bold text-gray-900 truncate">{selected.hook}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-6 p-6">
              {/* Slide preview */}
              <div className="space-y-3">
                <div className="bg-stone-100 rounded-xl overflow-hidden aspect-[9/16]">
                  {selected.image_svgs?.[slideIdx] ? (
                    <img
                      src={svgUrl(selected.image_svgs[slideIdx])}
                      alt={`Slide ${slideIdx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-4 text-center">
                      <p className="text-sm font-medium text-gray-600">{selected.slides[slideIdx]?.text}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-400">Slide {slideIdx + 1} / {selected.slides.length}</span>
                  <button onClick={() => setSlideIdx((i) => Math.min(selected.slides.length - 1, i + 1))} disabled={slideIdx === selected.slides.length - 1} className="p-1.5 rounded-lg hover:bg-stone-100 disabled:opacity-30">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button onClick={downloadAllSlides} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2B2B2B] rounded-xl text-white text-sm font-medium hover:bg-black">
                  <Download className="h-4 w-4" />Télécharger toutes les slides (PNG)
                </button>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Slides</p>
                  <div className="space-y-1.5">
                    {selected.slides.map((s, i) => (
                      <button key={i} onClick={() => setSlideIdx(i)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${i === slideIdx ? 'bg-[#2B2B2B] text-white' : 'bg-stone-50 text-gray-700 hover:bg-stone-100'}`}>
                        <span className="opacity-40 mr-1">{i + 1}.</span>{s.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase">Légende TikTok</p>
                    <button onClick={copyCaption} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <div className="bg-stone-50 rounded-lg p-3 text-sm text-gray-700">{selected.caption}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selected.hashtags.map((h) => (
                      <span key={h} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{h}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
