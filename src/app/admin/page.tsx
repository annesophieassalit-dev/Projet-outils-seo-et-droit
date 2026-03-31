"use client";

import { useEffect, useState } from "react";
import {
  Users, TrendingUp, ScanText, Search,
  Euro, Calendar, Sparkles, RefreshCw, FileText,
} from "lucide-react";

interface AdminStats {
  periode: { from: string; to: string };
  users: {
    total: number;
    gratuit: number;
    pro: number;
    nouveauxSurPeriode: number;
    recent: Array<{
      id: string;
      fullName: string;
      profession: string;
      plan: string;
      auditsThisMonth: number;
      scansThisMonth: number;
      postsThisMonth: number;
      createdAt: string;
    }>;
  };
  usage: {
    periode: { diagnostics: number; scans: number; posts: number };
    total: { diagnostics: number; scans: number; posts: number };
  };
  revenue: { mrr: number; arr: number };
}

// ── Périodes prédéfinies ────────────────────────────────────────────────────

function getPresets() {
  const now = new Date();
  const pad = (d: Date) => d.toISOString().slice(0, 10);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const last7 = new Date(now); last7.setDate(now.getDate() - 7);
  const last30 = new Date(now); last30.setDate(now.getDate() - 30);
  const last90 = new Date(now); last90.setDate(now.getDate() - 90);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return [
    { label: "Ce mois-ci", from: pad(startOfMonth), to: pad(now) },
    { label: "Mois dernier", from: pad(startOfLastMonth), to: pad(endOfLastMonth) },
    { label: "7 derniers jours", from: pad(last7), to: pad(now) },
    { label: "30 derniers jours", from: pad(last30), to: pad(now) },
    { label: "90 derniers jours", from: pad(last90), to: pad(now) },
    { label: "Cette année", from: pad(startOfYear), to: pad(now) },
  ];
}

function StatCard({
  icon: Icon, label, value, sub, color = "text-gray-800",
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const presets = getPresets();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  async function fetchStats(from?: string, to?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", from + "T00:00:00.000Z");
      if (to) params.set("to", to + "T23:59:59.999Z");
      const res = await fetch(`/api/admin/stats?${params}`);
      if (res.status === 403) { setError("Accès réservé à l'administratrice."); return; }
      setStats(await res.json());
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const p = presets[selectedPreset];
    fetchStats(p.from, p.to);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  function applyPreset(index: number) {
    setSelectedPreset(index);
    setUseCustom(false);
    const p = presets[index];
    fetchStats(p.from, p.to);
  }

  function applyCustom() {
    if (!customFrom || !customTo) return;
    setUseCustom(true);
    fetchStats(customFrom, customTo);
  }

  if (error) return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  );

  const conversionRate = stats && stats.users.total > 0
    ? Math.round((stats.users.pro / stats.users.total) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord admin</h1>
          <p className="text-gray-400 text-sm mt-0.5">Statistiques d&apos;utilisation</p>
        </div>
        <button
          onClick={() => {
            const p = presets[selectedPreset];
            fetchStats(p.from, p.to);
          }}
          className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Sélecteur de période */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4 text-gray-400" />
          Période
        </div>
        {/* Périodes prédéfinies */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p, i) => (
            <button
              key={p.label}
              onClick={() => applyPreset(i)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                !useCustom && selectedPreset === i
                  ? "bg-zen-700 text-white border-zen-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-zen-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {/* Période personnalisée */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="date"
            value={customFrom}
            onChange={e => setCustomFrom(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="date"
            value={customTo}
            onChange={e => setCustomTo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700"
          />
          <button
            onClick={applyCustom}
            disabled={!customFrom || !customTo}
            className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : stats ? (
        <>
          {/* Stats globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Utilisateurs total" value={stats.users.total}
              sub={`${stats.users.nouveauxSurPeriode} nouveaux sur la période`} />
            <StatCard icon={Sparkles} label="Abonnés Pro" value={stats.users.pro}
              sub={`${conversionRate}% de conversion`} color="text-zen-700" />
            <StatCard icon={Euro} label="MRR" value={`${stats.revenue.mrr} €`}
              sub={`${stats.revenue.arr} €/an estimé`} color="text-zen-700" />
            <StatCard icon={TrendingUp} label="Taux de conversion" value={`${conversionRate}%`}
              sub={`${stats.users.gratuit} en gratuit`} />
          </div>

          {/* Usage sur la période */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sur la période sélectionnée
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <StatCard icon={Search} label="Diagnostics" value={stats.usage.periode.diagnostics}
                sub={`${stats.usage.total.diagnostics} au total`} />
              <StatCard icon={ScanText} label="Scans de texte" value={stats.usage.periode.scans}
                sub={`${stats.usage.total.scans} au total`} />
              <StatCard icon={FileText} label="Posts générés" value={stats.usage.periode.posts}
                sub={`${stats.usage.total.posts} au total`} />
            </div>
          </div>

          {/* Répartition plans */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Répartition des plans</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Gratuit</span>
                  <span className="font-medium">{stats.users.gratuit} utilisateurs</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-300 rounded-full"
                    style={{ width: stats.users.total > 0 ? `${(stats.users.gratuit / stats.users.total) * 100}%` : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Pro — 19€/mois</span>
                  <span className="font-medium text-zen-700">{stats.users.pro} abonnés</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zen-600 rounded-full"
                    style={{ width: stats.users.total > 0 ? `${(stats.users.pro / stats.users.total) * 100}%` : "0%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Derniers inscrits */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <h2 className="font-semibold text-gray-800">Derniers inscrits</h2>
              </div>
              <span className="text-xs text-gray-400">Sans email — conformité RGPD</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Prénom</th>
                    <th className="text-left px-5 py-3">Profession</th>
                    <th className="text-left px-5 py-3">Plan</th>
                    <th className="text-right px-5 py-3">Diagnostics</th>
                    <th className="text-right px-5 py-3">Scans</th>
                    <th className="text-right px-5 py-3">Posts</th>
                    <th className="text-right px-5 py-3">Inscription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.users.recent.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{u.fullName}</td>
                      <td className="px-5 py-3 text-gray-600">{u.profession}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                          u.plan === "pro" ? "bg-zen-100 text-zen-800" : "bg-gray-100 text-gray-600"
                        }`}>
                          {u.plan === "pro" && <Sparkles className="h-3 w-3" />}
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">{u.auditsThisMonth}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{u.scansThisMonth}</td>
                      <td className="px-5 py-3 text-right text-gray-600">{u.postsThisMonth}</td>
                      <td className="px-5 py-3 text-right text-gray-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                  {stats.users.recent.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                        Aucun utilisateur pour l&apos;instant
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
