"use client";

import { useEffect, useState } from "react";
import {
  Users, TrendingUp, ScanText, Search,
  Euro, Calendar, Sparkles, RefreshCw, FileText,
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    gratuit: number;
    pro: number;
    nouveauxCeMois: number;
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
  audits: { total: number; thisMonth: number };
  usage: { scansThisMonth: number; postsThisMonth: number };
  revenue: { mrr: number; arr: number };
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-gray-800",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 403) { setError("Accès réservé à l'administratrice."); return; }
      setStats(await res.json());
    } catch {
      setError("Impossible de charger les statistiques.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchStats(); }, []);

  if (error) return (
    <div className="max-w-xl mx-auto mt-20 text-center">
      <p className="text-red-600 font-medium">{error}</p>
    </div>
  );

  if (loading || !stats) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  );

  const conversionRate = stats.users.total > 0
    ? Math.round((stats.users.pro / stats.users.total) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord admin</h1>
          <p className="text-gray-400 text-sm mt-0.5">Vue d&apos;ensemble de l&apos;activité</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Actualiser
        </button>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Utilisateurs" value={stats.users.total}
          sub={`+${stats.users.nouveauxCeMois} ce mois`} />
        <StatCard icon={Sparkles} label="Abonnés Pro" value={stats.users.pro}
          sub={`${conversionRate}% de conversion`} color="text-green-700" />
        <StatCard icon={Euro} label="MRR" value={`${stats.revenue.mrr} €`}
          sub={`${stats.revenue.arr} €/an estimé`} color="text-green-700" />
        <StatCard icon={TrendingUp} label="Taux de conversion" value={`${conversionRate}%`}
          sub={`${stats.users.gratuit} en gratuit`} />
      </div>

      {/* Usage ce mois */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Search} label="Diagnostics ce mois" value={stats.audits.thisMonth}
          sub={`${stats.audits.total} au total`} />
        <StatCard icon={ScanText} label="Scans de texte ce mois" value={stats.usage.scansThisMonth} />
        <StatCard icon={FileText} label="Posts générés ce mois" value={stats.usage.postsThisMonth} />
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
              <span className="font-medium text-green-700">{stats.users.pro} abonnés</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full"
                style={{ width: stats.users.total > 0 ? `${(stats.users.pro / stats.users.total) * 100}%` : "0%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Derniers inscrits — sans email (RGPD) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <h2 className="font-semibold text-gray-800">Derniers inscrits</h2>
          </div>
          <span className="text-xs text-gray-400">Données anonymisées — conformité RGPD</span>
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
                <th className="text-right px-5 py-3">Posts générés</th>
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
                      u.plan === "pro" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
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
    </div>
  );
}
