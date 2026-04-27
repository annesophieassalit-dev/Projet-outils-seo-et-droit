"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { Zap, RefreshCw, Eye, Copy, Check, ChevronLeft, ChevronRight, Download, Trash2, X } from "lucide-react";
import { PILLAR_LABELS } from "@/types/content";
import type { Content, ContentType, Pillar } from "@/types/content";

const PILLARS = Object.entries(PILLAR_LABELS) as [Pillar, string][];

function svgUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function svgToCanvas(svg: string): Promise<HTMLCanvasElement> {
  await Promise.allSettled([
    document.fonts.load('900 72px Montserrat'),
    document.fonts.load('800 72px Montserrat'),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d')!;
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => { ctx.drawImage(img, 0, 0); resolve(); };
    img.onerror = reject;
    img.src = svgUrl(svg);
  });
  return canvas;
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
  const [customTopic, setCustomTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [tab, setTab] = useState<'preview' | 'caption'>('preview');

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
    } catch {
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
        body: JSON.stringify({
          action: 'generate_one',
          type: customType,
          pillar: customPillar,
          topic: customTopic.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) alert('Erreur : ' + data.error);
      if (data.content) setContents((prev) => [data.content, ...prev]);
    } catch {
      alert('Erreur réseau. Vérifier la clé Anthropic dans Vercel.');
    }
    setGenerating(false);
  };

  const downloadAllSlides = async () => {
    if (!selected || downloading) return;
    setDownloading(true);
    try {
      const zip = new JSZip();
      const svgs = selected.image_svgs || [];
      await Promise.all(svgs.map(async (svg, i) => {
        try {
          const canvas = await svgToCanvas(svg);
          await new Promise<void>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) zip.file(`slide_${String(i + 1).padStart(2, '0')}.png`, blob);
              resolve();
            }, 'image/png');
          });
        } catch { /* skip */ }
      }));
      const safeName = selected.hook.replace(/[^\w\s]/g, '').trim().slice(0, 50).replace(/\s+/g, '_');
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${safeName || 'slides'}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Erreur ZIP. Essaie de régénérer le contenu.');
    }
    setDownloading(false);
  };

  useEffect(() => {
    if (window.location.search.includes('reset=true')) {
      localStorage.clear();
      window.location.replace('/');
      return;
    }
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

  const openContent = (c: Content) => { setSelected(c); setSlideIdx(0); setTab('preview'); };

  const copyCaption = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`${selected.caption}\n\n${selected.hashtags.join(' ')}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">

      {/* Header */}
      <header className="bg-[#243126] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-base tracking-wide">PRÉVOIR UTILE</h1>
          <p className="text-xs text-white/50 leading-none mt-0.5">TikTok Auto</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50 bg-white/10 px-2.5 py-1 rounded-full">
            {contents.length} contenu{contents.length > 1 ? 's' : ''}
          </span>
          {contents.length > 0 && (
            <button onClick={clearAll} className="text-xs text-red-400 px-2.5 py-1 rounded-full bg-white/10">
              Effacer
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Générer contenu du jour */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-bold text-gray-900 mb-0.5">Contenu du jour</h2>
          <p className="text-sm text-gray-400 mb-4">3 carrousels générés automatiquement</p>
          <button
            onClick={generateDaily}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-[#243126] rounded-xl text-white font-bold text-base hover:bg-black disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {loading ? 'Génération en cours...' : 'Générer le contenu du jour'}
          </button>
        </div>

        {/* Sujet libre */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <h2 className="font-bold text-gray-900 mb-3">Sujet libre</h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Ex: panne de courant et frigo, pénurie d'huile..."
                className="w-full px-4 py-3 text-base border border-stone-200 rounded-xl bg-stone-50 focus:outline-none focus:ring-2 focus:ring-[#D6B98C] pr-10"
              />
              {customTopic && (
                <button onClick={() => setCustomTopic('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={customPillar}
                onChange={(e) => setCustomPillar(e.target.value as Pillar)}
                disabled={!!customTopic.trim()}
                className="flex-1 px-3 py-3 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none disabled:opacity-40"
              >
                {PILLARS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as ContentType)}
                className="px-3 py-3 text-sm border border-stone-200 rounded-xl bg-stone-50 focus:outline-none"
              >
                <option value="carousel">Carrousel</option>
                <option value="video_long">Vidéo longue</option>
              </select>
            </div>
            <button
              onClick={generateOne}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#D6B98C] rounded-xl text-white font-bold text-base hover:bg-[#c4a07a] disabled:opacity-50 active:scale-95 transition-transform"
            >
              {generating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              {generating ? 'Génération...' : 'Générer ce sujet'}
            </button>
          </div>
        </div>

        {/* Liste des contenus */}
        {contents.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-bold text-gray-900">Mes contenus</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {contents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openContent(c)}
                  className="w-full flex items-center gap-4 px-4 py-4 hover:bg-stone-50 active:bg-stone-100 text-left transition-colors"
                >
                  <div className="w-10 h-16 rounded-lg bg-[#243126] shrink-0 overflow-hidden">
                    {c.image_svgs?.[0] ? (
                      <img src={svgUrl(c.image_svgs[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">▤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.hook}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{PILLAR_LABELS[c.pillar]}</p>
                  </div>
                  <Eye className="h-5 w-5 text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {contents.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-400 text-sm">
            Lance la génération pour commencer
          </div>
        )}
      </div>

      {/* Modal plein écran sur mobile */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col md:bg-black/60 md:items-center md:justify-center md:p-4">
          <div className="flex flex-col h-full md:h-auto md:max-h-[92vh] md:w-full md:max-w-3xl md:rounded-2xl md:overflow-hidden bg-white">

            {/* Header modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100 shrink-0">
              <p className="font-bold text-gray-900 truncate text-sm flex-1 mr-3">{selected.hook}</p>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full bg-stone-100 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs mobile */}
            <div className="flex border-b border-stone-100 shrink-0 md:hidden">
              <button
                onClick={() => setTab('preview')}
                className={`flex-1 py-3 text-sm font-semibold ${tab === 'preview' ? 'text-[#243126] border-b-2 border-[#243126]' : 'text-gray-400'}`}
              >
                Aperçu
              </button>
              <button
                onClick={() => setTab('caption')}
                className={`flex-1 py-3 text-sm font-semibold ${tab === 'caption' ? 'text-[#243126] border-b-2 border-[#243126]' : 'text-gray-400'}`}
              >
                Légende
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 md:p-6">

                {/* Colonne aperçu */}
                <div className={`space-y-3 p-4 md:p-0 ${tab === 'caption' ? 'hidden md:block' : ''}`}>
                  <div className="bg-stone-100 rounded-xl overflow-hidden aspect-[9/16] max-h-[55vh] md:max-h-none">
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
                  {/* Navigation slides */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                      disabled={slideIdx === 0}
                      className="p-3 rounded-xl bg-stone-100 disabled:opacity-30 active:scale-95 transition-transform"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-gray-500 font-medium">
                      {slideIdx + 1} / {selected.slides.length}
                    </span>
                    <button
                      onClick={() => setSlideIdx((i) => Math.min(selected.slides.length - 1, i + 1))}
                      disabled={slideIdx === selected.slides.length - 1}
                      className="p-3 rounded-xl bg-stone-100 disabled:opacity-30 active:scale-95 transition-transform"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Colonne légende */}
                <div className={`space-y-4 p-4 md:p-0 ${tab === 'preview' ? 'hidden md:block' : ''}`}>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Slides</p>
                    <div className="space-y-1.5">
                      {selected.slides.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => { setSlideIdx(i); setTab('preview'); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${i === slideIdx ? 'bg-[#243126] text-white' : 'bg-stone-50 text-gray-700 active:bg-stone-100'}`}
                        >
                          <span className="opacity-40 mr-1">{i + 1}.</span>{s.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Légende TikTok</p>
                      <button onClick={copyCaption} className="flex items-center gap-1 text-xs text-gray-400 active:text-green-500">
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3 text-sm text-gray-700 leading-relaxed">{selected.caption}</div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selected.hashtags.map((h) => (
                        <span key={h} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton download sticky en bas */}
            <div className="shrink-0 p-4 border-t border-stone-100 bg-white">
              <button
                onClick={downloadAllSlides}
                disabled={downloading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#243126] rounded-2xl text-white font-bold text-base hover:bg-black disabled:opacity-60 active:scale-95 transition-transform"
              >
                {downloading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {downloading ? 'Création du ZIP...' : '⬇ Télécharger le carrousel (PNG)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
