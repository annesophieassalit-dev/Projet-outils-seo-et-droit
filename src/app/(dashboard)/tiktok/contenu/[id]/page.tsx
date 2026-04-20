"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, Calendar, Copy, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PILLAR_LABELS } from "@/types/tiktok";
import type { TikTokContent } from "@/types/tiktok";

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const [content, setContent] = useState<TikTokContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/tiktok/analytics')
      .then((r) => r.json())
      .then((data) => {
        const found = data.recent_content?.find((c: TikTokContent) => c.id === params.id);
        setContent(found || null);
        setLoading(false);
      });
  }, [params.id]);

  const handlePublish = async (scheduleAt?: string) => {
    if (!content) return;
    setPublishing(true);
    const res = await fetch('/api/tiktok/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content_id: content.id, schedule_at: scheduleAt }),
    });
    const data = await res.json();
    if (data.success) {
      setContent((prev) => prev ? { ...prev, status: scheduleAt ? 'scheduled' : 'published' } : null);
    }
    setPublishing(false);
  };

  const handleCopyCaption = () => {
    if (!content) return;
    const text = `${content.caption}\n\n${content.hashtags.join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto animate-pulse"><div className="h-8 bg-gray-100 rounded w-48 mb-6" /><div className="h-96 bg-gray-100 rounded-xl" /></div>;
  }

  if (!content) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <p className="text-gray-400">Contenu introuvable</p>
        <Link href="/tiktok/contenu" className="text-sm text-gray-600 mt-2 inline-block hover:underline">← Retour</Link>
      </div>
    );
  }

  const slides = content.slides || [];
  const images = content.image_urls || [];
  const currentImg = images[currentSlide];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tiktok/contenu" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4" />Retour
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-sm text-gray-700 font-medium truncate max-w-xs">{content.hook}</span>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Slide preview */}
        <div className="col-span-2 space-y-3">
          <div className="bg-stone-100 rounded-xl overflow-hidden aspect-[9/16] flex items-center justify-center border border-stone-200">
            {currentImg?.startsWith('data:image/svg') ? (
              <img src={currentImg} alt={`Slide ${currentSlide + 1}`} className="w-full h-full object-contain" />
            ) : (
              <div className="text-center p-4">
                <p className="text-sm font-medium text-stone-600 leading-relaxed">{slides[currentSlide]?.text}</p>
              </div>
            )}
          </div>

          {/* Slide navigation */}
          {slides.length > 1 && (
            <div className="flex items-center justify-between">
              <button onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))} disabled={currentSlide === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentSlide ? 'bg-gray-900' : 'bg-gray-200'}`} />
                ))}
              </div>
              <button onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))} disabled={currentSlide === slides.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <p className="text-center text-xs text-gray-400">Slide {currentSlide + 1} / {slides.length}</p>
        </div>

        {/* Content details */}
        <div className="col-span-3 space-y-4">
          {/* Meta */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${content.status === 'published' ? 'bg-green-100 text-green-700' : content.status === 'scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                {content.status === 'published' ? 'Publié' : content.status === 'scheduled' ? 'Programmé' : 'Brouillon'}
              </span>
              <span className="text-xs text-gray-400">{PILLAR_LABELS[content.pillar]}</span>
              <span className="text-xs text-gray-400">· {content.content_type === 'carousel' ? 'Carrousel' : 'Vidéo longue'}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{content.hook}</h2>
            <p className="text-sm text-gray-500">{content.title}</p>
          </div>

          {/* Slides list */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Slides ({slides.length})</h3>
            <div className="space-y-2">
              {slides.map((slide, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${i === currentSlide ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <span className="font-medium mr-2 opacity-50">{i + 1}.</span>
                  {slide.text}
                  {slide.highlight && slide.highlight.length > 0 && (
                    <span className={`ml-2 text-xs opacity-60 ${i === currentSlide ? 'text-yellow-300' : 'text-amber-600'}`}>
                      [{slide.highlight.join(', ')}]
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Caption & hashtags */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Légende TikTok</h3>
              <button onClick={handleCopyCaption} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                <Copy className="h-3 w-3" />{copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{content.caption}</p>
            <div className="flex flex-wrap gap-1 mt-3">
              {content.hashtags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Performance */}
          {content.status === 'published' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1"><Eye className="h-4 w-4" /></div>
                  <p className="text-xl font-bold text-gray-900">{content.views_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Vues</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{content.likes_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Likes</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-900">{content.shares_count.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">Partages</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {content.status === 'draft' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Publier</h3>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
                <button
                  onClick={() => handlePublish(scheduleDate || undefined)}
                  disabled={publishing || !scheduleDate}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Calendar className="h-4 w-4" />Programmer
                </button>
              </div>
              <button
                onClick={() => handlePublish()}
                disabled={publishing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {publishing ? 'Publication...' : 'Publier maintenant'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
