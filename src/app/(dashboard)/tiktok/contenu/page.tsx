"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, Clock, Play, AlertCircle, Plus, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PILLAR_LABELS } from "@/types/tiktok";
import type { Pillar } from "@/types/tiktok";

interface ContentItem {
  id: string;
  title: string;
  hook: string;
  content_type: string;
  pillar: Pillar;
  status: string;
  views_count: number;
  image_urls: string[];
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
}

const STATUS_CONFIG = {
  draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-600', icon: null },
  scheduled: { label: 'Programmé', color: 'bg-blue-100 text-blue-700', icon: <Clock className="h-3 w-3" /> },
  published: { label: 'Publié', color: 'bg-green-100 text-green-700', icon: <Play className="h-3 w-3" /> },
  failed: { label: 'Échec', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" /> },
};

export default function ContenuPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/tiktok/analytics');
    if (res.ok) {
      const data = await res.json();
      setContent(data.recent_content || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  const filtered = filter === 'all' ? content : content.filter((c) => c.status === filter);

  const handleGenerateNew = async () => {
    setGenerating(true);
    await fetch('/api/tiktok/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_daily' }),
    });
    setGenerating(false);
    await fetchContent();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
          <p className="text-sm text-gray-500 mt-0.5">{content.length} contenus générés</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerateNew}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {generating ? 'Génération...' : 'Générer du contenu'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'draft', 'scheduled', 'published', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'Tous' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
              <div className="w-10 h-16 bg-gray-100 rounded-md" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <p className="text-gray-400 text-sm mb-4">Aucun contenu {filter !== 'all' ? `"${STATUS_CONFIG[filter as keyof typeof STATUS_CONFIG]?.label}"` : ''}</p>
          <button
            onClick={handleGenerateNew}
            disabled={generating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />Générer du contenu
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {filtered.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
            return (
              <Link key={item.id} href={`/tiktok/contenu/${item.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-16 rounded-md bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden border border-stone-200">
                  {item.image_urls?.[0]?.startsWith('data:image/svg') ? (
                    <img src={item.image_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-400">{item.content_type === 'carousel' ? '▤' : '▶'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.hook}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{PILLAR_LABELS[item.pillar]}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-xs text-gray-400">{item.content_type === 'carousel' ? 'Carrousel' : 'Vidéo longue'}</span>
                    {item.scheduled_at && (
                      <>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-blue-500">
                          {new Date(item.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.views_count > 0 && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" />{item.views_count.toLocaleString()}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                    {statusCfg.icon}{statusCfg.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
