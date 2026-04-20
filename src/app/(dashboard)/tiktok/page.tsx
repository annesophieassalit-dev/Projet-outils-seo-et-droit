"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Eye, Heart, Share2, Play, Plus, Calendar, Zap, RefreshCw, Clock } from "lucide-react";
import Link from "next/link";
import { PILLAR_LABELS } from "@/types/tiktok";
import type { Pillar } from "@/types/tiktok";

interface Stats {
  total_content: number;
  published_count: number;
  draft_count: number;
  scheduled_count: number;
  total_views: number;
  total_likes: number;
  total_shares: number;
  avg_views: number;
}

interface ContentItem {
  id: string;
  title: string;
  hook: string;
  content_type: string;
  pillar: Pillar;
  status: string;
  views_count: number;
  image_urls: string[];
  created_at: string;
  scheduled_at?: string;
}

export default function TikTokDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentContent, setRecentContent] = useState<ContentItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/tiktok/analytics');
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setRecentContent(data.recent_content || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleGenerateDaily = async () => {
    setGenerating(true);
    const res = await fetch('/api/tiktok/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate_daily' }),
    });
    const data = await res.json();
    setGenerating(false);
    if (data.scheduled > 0 || data.errors?.length === 0) {
      await fetchData();
    }
  };

  const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon',
    scheduled: 'Programmé',
    published: 'Publié',
    failed: 'Échec',
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-700',
    published: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">TikTok Automation</h1>
          <p className="text-sm text-gray-500 mt-0.5">Prévoir sans paniquer — Organisation alimentaire simple</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/tiktok/contenu/nouveau"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Nouveau contenu
          </Link>
          <button
            onClick={handleGenerateDaily}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {generating ? 'Génération...' : 'Générer aujourd\'hui'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Eye className="h-5 w-5 text-blue-500" />} label="Vues totales" value={formatNumber(stats?.total_views || 0)} />
          <StatCard icon={<Heart className="h-5 w-5 text-pink-500" />} label="Likes" value={formatNumber(stats?.total_likes || 0)} />
          <StatCard icon={<Share2 className="h-5 w-5 text-green-500" />} label="Partages" value={formatNumber(stats?.total_shares || 0)} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-purple-500" />} label="Vues moyennes" value={formatNumber(stats?.avg_views || 0)} />
        </div>
      )}

      {/* Content overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm font-medium text-gray-700">Brouillons</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.draft_count || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Programmés</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.scheduled_count || 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Play className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Publiés</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats?.published_count || 0}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/tiktok/contenu" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center">
              <Play className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Mes contenus</span>
          </div>
          <p className="text-sm text-gray-500">Gérer et publier le contenu généré</p>
        </Link>
        <Link href="/tiktok/calendrier" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Calendrier</span>
          </div>
          <p className="text-sm text-gray-500">Planifier les publications</p>
        </Link>
        <Link href="/tiktok/parametres" className="bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all group">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center">
              <Zap className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Automatisation</span>
          </div>
          <p className="text-sm text-gray-500">Configurer les réglages</p>
        </Link>
      </div>

      {/* Recent content */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Contenus récents</h2>
          <Link href="/tiktok/contenu" className="text-sm text-gray-500 hover:text-gray-700">Voir tout →</Link>
        </div>
        {recentContent.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm mb-4">Aucun contenu pour le moment</p>
            <button
              onClick={handleGenerateDaily}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              Générer le premier contenu
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentContent.slice(0, 8).map((item) => (
              <Link key={item.id} href={`/tiktok/contenu/${item.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                {/* Slide preview */}
                <div className="w-10 h-16 rounded-md bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden border border-stone-200">
                  {item.image_urls?.[0]?.startsWith('data:image/svg') ? (
                    <img src={item.image_urls[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-stone-400">{item.content_type === 'carousel' ? '▤' : '▶'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.hook}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{PILLAR_LABELS[item.pillar]}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{item.content_type === 'carousel' ? 'Carrousel' : 'Vidéo longue'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.views_count > 0 && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" />{formatNumber(item.views_count)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm text-gray-500">{label}</span></div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
