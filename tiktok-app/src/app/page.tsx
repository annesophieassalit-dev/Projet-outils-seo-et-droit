"use client";

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { Zap, RefreshCw, Eye, Copy, Check, ChevronLeft, ChevronRight, Download, X, Video, Mic } from "lucide-react";
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
  // Fond opaque par défaut — évite les PNG transparents qui s'affichent noirs sur TikTok
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, 1080, 1920);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // rAF garantit que le SVG est entièrement rendu avant drawImage
      requestAnimationFrame(() => {
        ctx.drawImage(img, 0, 0, 1080, 1920);
        URL.revokeObjectURL(url);
        resolve();
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
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
  const [exportingVideo, setExportingVideo] = useState(false);
  const [exportingVoice, setExportingVoice] = useState(false);
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

  const exportAsVideo = async () => {
    if (!selected || exportingVideo) return;
    const svgs = selected.image_svgs;
    if (!svgs || svgs.length === 0) return;
    setExportingVideo(true);
    try {
      const canvases = await Promise.all(svgs.map(svg => svgToCanvas(svg)));
      const display = document.createElement('canvas');
      display.width = 1080;
      display.height = 1920;
      const ctx = display.getContext('2d')!;
      const mimeType =
        MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ? 'video/mp4;codecs=avc1' :
        MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=vp9';
      const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
      const stream = display.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start();
      await new Promise(r => setTimeout(r, 80));
      for (const canvas of canvases) {
        ctx.drawImage(canvas, 0, 0);
        await new Promise(r => setTimeout(r, 4000));
      }
      await new Promise<void>(resolve => { recorder.onstop = () => resolve(); recorder.stop(); });
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: mimeType });
      const safeName = selected.hook.replace(/[^\w\s]/g, '').trim().slice(0, 50).replace(/\s+/g, '_');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${safeName || 'video'}.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Export vidéo non supporté. Utilise Chrome ou Edge.');
    }
    setExportingVideo(false);
  };

  const exportAsVideoWithVoice = async () => {
    if (!selected || exportingVoice) return;
    const svgs = selected.image_svgs;
    if (!svgs || svgs.length === 0) return;
    setExportingVoice(true);
    try {
      const canvases = await Promise.all(svgs.map(svg => svgToCanvas(svg)));
      const audioCtx = new AudioContext();
      const audioDest = audioCtx.createMediaStreamDestination();

      const ttsTexts = selected.slides.map(s =>
        s.type === 'conclusion' ? 'Retrouve le lien en bio pour accéder au guide PDF.' : s.text
      );
      const audioBuffers = await Promise.all(ttsTexts.map(async (text) => {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          if (!res.ok) return null;
          const ab = await res.arrayBuffer();
          return await audioCtx.decodeAudioData(ab);
        } catch { return null; }
      }));

      const display = document.createElement('canvas');
      display.width = 1080;
      display.height = 1920;
      const ctx = display.getContext('2d')!;
      const videoStream = display.captureStream(30);
      const combined = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks(),
      ]);

      const mimeType =
        MediaRecorder.isTypeSupported('video/mp4;codecs=avc1') ? 'video/mp4;codecs=avc1' :
        MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm;codecs=vp9';
      const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';
      const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start();
      await new Promise(r => setTimeout(r, 80));

      for (let i = 0; i < canvases.length; i++) {
        ctx.drawImage(canvases[i], 0, 0);
        const buf = audioBuffers[i];
        if (buf) {
          await new Promise<void>(resolve => {
            const src = audioCtx.createBufferSource();
            src.buffer = buf;
            src.connect(audioDest);
            src.onended = () => resolve();
            src.start();
          });
          await new Promise(r => setTimeout(r, 500));
        } else {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      await new Promise<void>(resolve => { recorder.onstop = () => resolve(); recorder.stop(); });
      combined.getTracks().forEach(t => t.stop());
      audioCtx.close();

      const blob = new Blob(chunks, { type: mimeType });
      const safeName = selected.hook.replace(/[^\w\s]/g, '').trim().slice(0, 50).replace(/\s+/g, '_');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${safeName || 'video'}_voix.${ext}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Erreur voix. Vérifier la clé OPENAI_API_KEY dans Vercel.');
    }
    setExportingVoice(false);
  };

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
    <div className="min-h-screen" style={{ background: '#0D0D0D' }}>

      {/* Header */}
      <header style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        className="text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-black text-base tracking-widest text-white">PRÉVOIR UTILE</h1>
          <p className="text-xs leading-none mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>TikTok Auto</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
            {contents.length} contenu{contents.length > 1 ? 's' : ''}
          </span>
          {contents.length > 0 && (
            <button onClick={clearAll} className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,60,60,0.12)', color: '#ff6b6b' }}>
              Effacer
            </button>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Générer contenu du jour */}
        <div className="rounded-2xl p-5" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white mb-0.5">Contenu du jour</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>3 carrousels générés automatiquement</p>
          <button
            onClick={generateDaily}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wide disabled:opacity-40 active:scale-95 transition-transform"
            style={{ background: '#D4A843', color: '#0D0D0D' }}
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {loading ? 'Génération en cours...' : 'Générer le contenu du jour'}
          </button>
        </div>

        {/* Sujet libre */}
        <div className="rounded-2xl p-5" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-bold text-white mb-3">Sujet libre</h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Ex: panne de courant et frigo, pénurie d'huile..."
                className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none pr-10"
                style={{
                  background: '#252525',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#F5F1E8',
                }}
              />
              {customTopic && (
                <button onClick={() => setCustomTopic('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={customPillar}
                onChange={(e) => setCustomPillar(e.target.value as Pillar)}
                disabled={!!customTopic.trim()}
                className="flex-1 px-3 py-3 text-sm rounded-xl focus:outline-none disabled:opacity-30"
                style={{ background: '#252525', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F1E8' }}
              >
                {PILLARS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as ContentType)}
                className="px-3 py-3 text-sm rounded-xl focus:outline-none"
                style={{ background: '#252525', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F1E8' }}
              >
                <option value="carousel">Carrousel</option>
                <option value="video_long">Vidéo longue</option>
              </select>
            </div>
            <button
              onClick={generateOne}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm tracking-wide disabled:opacity-40 active:scale-95 transition-transform"
              style={{ background: '#7A9E72', color: '#0D0D0D' }}
            >
              {generating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              {generating ? 'Génération...' : 'Générer ce sujet'}
            </button>
          </div>
        </div>

        {/* Liste des contenus */}
        {contents.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h2 className="font-bold text-white">Mes contenus</h2>
            </div>
            <div>
              {contents.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => openContent(c)}
                  className="w-full flex items-center gap-4 px-4 py-4 text-left transition-colors active:opacity-70"
                  style={{ borderBottom: idx < contents.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                >
                  <div className="w-10 h-16 rounded-lg shrink-0 overflow-hidden" style={{ background: '#252525' }}>
                    {c.image_svgs?.[0] ? (
                      <img src={svgUrl(c.image_svgs[0])} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>▤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-white">{c.hook}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{PILLAR_LABELS[c.pillar]}</p>
                  </div>
                  <Eye className="h-5 w-5 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {contents.length === 0 && !loading && (
          <div className="text-center py-20 text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Lance la génération pour commencer
          </div>
        )}
      </div>

      {/* Modal plein écran sur mobile */}
      {selected && (
        <div className="fixed inset-0 z-50 flex flex-col md:items-center md:justify-center md:p-4" style={{ background: '#0D0D0D' }}>
          <div className="flex flex-col h-full md:h-auto md:max-h-[92vh] md:w-full md:max-w-3xl md:rounded-2xl md:overflow-hidden" style={{ background: '#141414' }}>

            {/* Header modal */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="font-bold text-white truncate text-sm flex-1 mr-3">{selected.hook}</p>
              <button onClick={() => setSelected(null)} className="p-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs mobile */}
            <div className="flex shrink-0 md:hidden" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={() => setTab('preview')}
                className="flex-1 py-3 text-sm font-semibold transition-colors"
                style={tab === 'preview' ? { color: '#D4A843', borderBottom: '2px solid #D4A843' } : { color: 'rgba(255,255,255,0.35)' }}
              >
                Aperçu
              </button>
              <button
                onClick={() => setTab('caption')}
                className="flex-1 py-3 text-sm font-semibold transition-colors"
                style={tab === 'caption' ? { color: '#D4A843', borderBottom: '2px solid #D4A843' } : { color: 'rgba(255,255,255,0.35)' }}
              >
                Légende
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 md:p-6">

                {/* Colonne aperçu */}
                <div className={`space-y-3 p-4 md:p-0 ${tab === 'caption' ? 'hidden md:block' : ''}`}>
                  <div className="rounded-xl overflow-hidden aspect-[9/16] max-h-[55vh] md:max-h-none" style={{ background: '#0D0D0D' }}>
                    {selected.image_svgs?.[slideIdx] ? (
                      <img
                        src={svgUrl(selected.image_svgs[slideIdx])}
                        alt={`Slide ${slideIdx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full p-4 text-center">
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{selected.slides[slideIdx]?.text}</p>
                      </div>
                    )}
                  </div>
                  {/* Navigation slides */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}
                      disabled={slideIdx === 0}
                      className="p-3 rounded-xl disabled:opacity-20 active:scale-95 transition-transform"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {slideIdx + 1} / {selected.slides.length}
                    </span>
                    <button
                      onClick={() => setSlideIdx((i) => Math.min(selected.slides.length - 1, i + 1))}
                      disabled={slideIdx === selected.slides.length - 1}
                      className="p-3 rounded-xl disabled:opacity-20 active:scale-95 transition-transform"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Colonne légende */}
                <div className={`space-y-4 p-4 md:p-0 ${tab === 'preview' ? 'hidden md:block' : ''}`}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Slides</p>
                    <div className="space-y-1.5">
                      {selected.slides.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => { setSlideIdx(i); setTab('preview'); }}
                          className="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors"
                          style={i === slideIdx
                            ? { background: '#D4A843', color: '#0D0D0D' }
                            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)' }}
                        >
                          <span className="opacity-40 mr-1">{i + 1}.</span>{s.text}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Légende TikTok</p>
                      <button onClick={copyCaption} className="flex items-center gap-1 text-xs transition-colors" style={{ color: copied ? '#7A9E72' : 'rgba(255,255,255,0.35)' }}>
                        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? 'Copié !' : 'Copier'}
                      </button>
                    </div>
                    <div className="rounded-xl p-3 text-sm leading-relaxed" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.75)' }}>
                      {selected.caption}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selected.hashtags.map((h) => (
                        <span key={h} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(122,158,114,0.15)', color: '#7A9E72' }}>{h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons sticky en bas */}
            <div className="shrink-0 p-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={downloadAllSlides}
                disabled={downloading || exportingVideo}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm tracking-wide disabled:opacity-40 active:scale-95 transition-transform"
                style={{ background: '#D4A843', color: '#0D0D0D' }}
              >
                {downloading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                {downloading ? 'Création du ZIP...' : '⬇ Carrousel PNG (Instagram / TikTok)'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={exportAsVideo}
                  disabled={exportingVideo || downloading || exportingVoice}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                >
                  {exportingVideo ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
                  {exportingVideo ? 'Export...' : 'MP4'}
                </button>
                <button
                  onClick={exportAsVideoWithVoice}
                  disabled={exportingVoice || downloading || exportingVideo}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
                  style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}
                >
                  {exportingVoice ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  {exportingVoice ? 'Voix...' : 'MP4 + Voix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
