"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight,
  Instagram, Linkedin, Facebook, Globe, Trash2,
  CheckCircle2, Clock, FileText, X, Loader2, Sparkles,
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "instagram" | "linkedin" | "facebook" | "tiktok" | "threads" | "autre";
type Status = "brouillon" | "programme" | "publie";

interface PlanningPost {
  id: string;
  title?: string;
  content: string;
  platform: Platform;
  content_type?: string;
  scheduled_at: string | null;
  status: Status;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  tiktok: "TikTok",
  threads: "Threads",
  autre: "Autre",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "bg-pink-100 text-pink-700",
  linkedin: "bg-blue-100 text-blue-700",
  facebook: "bg-indigo-100 text-indigo-700",
  tiktok: "bg-gray-900 text-white",
  threads: "bg-gray-100 text-gray-700",
  autre: "bg-gray-100 text-gray-600",
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ReactNode }> = {
  brouillon: { label: "Brouillon", color: "text-gray-500", icon: <FileText className="h-3.5 w-3.5" /> },
  programme: { label: "Programmé", color: "text-amber-600", icon: <Clock className="h-3.5 w-3.5" /> },
  publie: { label: "Publié", color: "text-zen-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
};

function PlatformIcon({ platform }: { platform: Platform }) {
  switch (platform) {
    case "instagram": return <Instagram className="h-3.5 w-3.5" />;
    case "linkedin": return <Linkedin className="h-3.5 w-3.5" />;
    case "facebook": return <Facebook className="h-3.5 w-3.5" />;
    default: return <Globe className="h-3.5 w-3.5" />;
  }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return (new Date(year, month, 1).getDay() + 6) % 7; // lundi = 0
}

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ─── Modale de création / édition ────────────────────────────────────────────

interface PostFormProps {
  initialDate?: string;
  initialPost?: PlanningPost;
  onSave: (post: Partial<PlanningPost>) => Promise<void>;
  onClose: () => void;
}

function PostForm({ initialDate, initialPost, onSave, onClose }: PostFormProps) {
  const [content, setContent] = useState(initialPost?.content || "");
  const [title, setTitle] = useState(initialPost?.title || "");
  const [platform, setPlatform] = useState<Platform>(initialPost?.platform || "instagram");
  const [scheduledAt, setScheduledAt] = useState(initialPost?.scheduled_at || initialDate || "");
  const [status, setStatus] = useState<Status>(initialPost?.status || "brouillon");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    await onSave({ title: title || undefined, content, platform, scheduled_at: scheduledAt || null, status });
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {initialPost ? "Modifier le post" : "Nouveau post"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Titre interne */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Mémo (facultatif)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Post bien-être lundi matin"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zen-600"
            />
          </div>

          {/* Contenu */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Contenu du post *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Rédigez ou collez votre post ici…"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zen-600 resize-none"
              required
            />
            <p className="text-xs text-gray-400 mt-1">{content.length} caractères</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Plateforme */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Plateforme</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zen-600"
              >
                {(Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => (
                  <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Date de publication</label>
              <input
                type="date"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zen-600"
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Statut</label>
            <div className="flex gap-2">
              {(["brouillon", "programme", "publie"] as Status[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    status === s
                      ? "bg-zen-700 text-white border-zen-700"
                      : "border-gray-200 text-gray-600 hover:border-zen-400"
                  }`}
                >
                  {STATUS_CONFIG[s].icon}
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !content.trim()}
              className="flex-1 bg-zen-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-zen-800 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function PlanningPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [posts, setPosts] = useState<PlanningPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingPost, setEditingPost] = useState<PlanningPost | undefined>();

  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/planning?month=${monthKey}`);
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  }, [monthKey]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  async function handleSave(fields: Partial<PlanningPost>) {
    if (editingPost) {
      await fetch("/api/planning", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingPost.id, ...fields }),
      });
    } else {
      await fetch("/api/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
    }
    setShowForm(false);
    setEditingPost(undefined);
    fetchPosts();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/planning?id=${id}`, { method: "DELETE" });
    fetchPosts();
  }

  async function handleStatusChange(post: PlanningPost, newStatus: Status) {
    await fetch("/api/planning", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: post.id, status: newStatus }),
    });
    fetchPosts();
  }

  // Construire la grille calendrier
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();

  const postsByDate: Record<string, PlanningPost[]> = {};
  for (const post of posts) {
    if (post.scheduled_at) {
      const key = post.scheduled_at;
      if (!postsByDate[key]) postsByDate[key] = [];
      postsByDate[key].push(post);
    }
  }

  const unscheduled = posts.filter((p) => !p.scheduled_at);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-zen-700" />
            Planning éditorial
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Organisez et programmez vos posts réseaux sociaux.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/generateur"
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-zen-600" />
            Générer un post
          </Link>
          <button
            onClick={() => { setSelectedDate(""); setEditingPost(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-zen-700 text-white rounded-lg text-sm font-medium hover:bg-zen-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouveau post
          </button>
        </div>
      </div>

      {/* Navigation mois */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h2 className="font-semibold text-gray-900">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2 border-b border-gray-100">
              {d}
            </div>
          ))}

          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;
            const dayPosts = postsByDate[dateStr] || [];
            const col = (firstDay + i) % 7;
            const isLastCol = col === 6;

            return (
              <div
                key={day}
                className={`min-h-[80px] p-1.5 border-b border-gray-100 cursor-pointer hover:bg-zen-50/50 transition-colors ${!isLastCol ? "border-r" : ""}`}
                onClick={() => {
                  setSelectedDate(dateStr);
                  setEditingPost(undefined);
                  setShowForm(true);
                }}
              >
                <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-zen-700 text-white" : "text-gray-600"
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {dayPosts.slice(0, 2).map((post) => (
                    <div
                      key={post.id}
                      onClick={(e) => { e.stopPropagation(); setEditingPost(post); setShowForm(true); }}
                      className={`text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${PLATFORM_COLORS[post.platform]}`}
                    >
                      <PlatformIcon platform={post.platform} />
                      <span className="truncate">{post.title || post.content.slice(0, 20)}</span>
                    </div>
                  ))}
                  {dayPosts.length > 2 && (
                    <div className="text-xs text-gray-400 pl-1">+{dayPosts.length - 2}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des posts du mois */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Posts programmés */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Posts ce mois</h3>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {posts.filter((p) => p.scheduled_at).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucun post programmé ce mois.</p>
            ) : (
              posts.filter((p) => p.scheduled_at).map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onEdit={() => { setEditingPost(post); setShowForm(true); }}
                  onDelete={() => handleDelete(post.id)}
                  onStatusChange={(s) => handleStatusChange(post, s)}
                />
              ))
            )}
          </div>
        </div>

        {/* Brouillons non datés */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Brouillons sans date
              {unscheduled.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {unscheduled.length}
                </span>
              )}
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
            {unscheduled.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Aucun brouillon en attente.</p>
            ) : (
              unscheduled.map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onEdit={() => { setEditingPost(post); setShowForm(true); }}
                  onDelete={() => handleDelete(post.id)}
                  onStatusChange={(s) => handleStatusChange(post, s)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modale */}
      {showForm && (
        <PostForm
          initialDate={selectedDate}
          initialPost={editingPost}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingPost(undefined); }}
        />
      )}
    </div>
  );
}

// ─── Ligne de post ────────────────────────────────────────────────────────────

function PostRow({
  post,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  post: PlanningPost;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (s: Status) => void;
}) {
  const cfg = STATUS_CONFIG[post.status];

  return (
    <div className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLATFORM_COLORS[post.platform]}`}>
            {PLATFORM_LABELS[post.platform]}
          </span>
          {post.scheduled_at && (
            <span className="text-xs text-gray-400">
              {new Date(post.scheduled_at + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-700 truncate">
          {post.title || post.content.slice(0, 60)}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <select
          value={post.status}
          onChange={(e) => onStatusChange(e.target.value as Status)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs border-0 bg-transparent cursor-pointer focus:outline-none ${cfg.color}`}
        >
          <option value="brouillon">Brouillon</option>
          <option value="programme">Programmé</option>
          <option value="publie">Publié</option>
        </select>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
