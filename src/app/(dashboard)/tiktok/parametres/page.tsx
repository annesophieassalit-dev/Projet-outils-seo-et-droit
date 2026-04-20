"use client";

import { useState, useEffect } from "react";
import { Save, Link2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface Settings {
  auto_publish: boolean;
  post_times: string[];
  timezone: string;
  daily_carousel_count: number;
  daily_video_count: number;
  auto_generate: boolean;
}

interface Account {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  token_expires_at: string;
}

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings>({
    auto_publish: false,
    post_times: ['09:00', '18:00'],
    timezone: 'Europe/Paris',
    daily_carousel_count: 2,
    daily_video_count: 1,
    auto_generate: true,
  });
  const [account, setAccount] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tiktok/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.account) setAccount(data.account);
        setLoading(false);
      });

    // Check URL params for OAuth result
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      window.history.replaceState({}, '', window.location.pathname);
      fetch('/api/tiktok/settings').then((r) => r.json()).then((data) => {
        if (data.account) setAccount(data.account);
      });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch('/api/tiktok/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleConnectTikTok = () => {
    window.location.href = '/api/tiktok/auth';
  };

  const updateTime = (index: number, value: string) => {
    const times = [...settings.post_times];
    times[index] = value;
    setSettings({ ...settings, post_times: times });
  };

  const addTime = () => {
    if (settings.post_times.length >= 4) return;
    setSettings({ ...settings, post_times: [...settings.post_times, '12:00'] });
  };

  const removeTime = (index: number) => {
    setSettings({ ...settings, post_times: settings.post_times.filter((_, i) => i !== index) });
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres TikTok</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configuration de l'automatisation</p>
      </div>

      {/* TikTok account */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Compte TikTok</h2>
        {account ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            {account.avatar_url && (
              <img src={account.avatar_url} alt="" className="w-10 h-10 rounded-full" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{account.display_name}</p>
              <p className="text-xs text-gray-500">@{account.username}</p>
            </div>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Aucun compte TikTok connecté. Connectez votre compte pour publier automatiquement.
            </div>
            <button
              onClick={handleConnectTikTok}
              className="flex items-center gap-2 px-4 py-2 bg-[#010101] rounded-lg text-sm font-medium text-white hover:bg-gray-800"
            >
              <Link2 className="h-4 w-4" />
              Connecter TikTok
            </button>
          </div>
        )}
      </div>

      {/* Automation */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
        <h2 className="font-semibold text-gray-900">Automatisation</h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Génération automatique</p>
            <p className="text-xs text-gray-500">Générer du contenu chaque jour automatiquement</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, auto_generate: !settings.auto_generate })}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.auto_generate ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.auto_generate ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Publication automatique</p>
            <p className="text-xs text-gray-500">Publier sur TikTok sans confirmation manuelle</p>
          </div>
          <button
            onClick={() => setSettings({ ...settings, auto_publish: !settings.auto_publish })}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.auto_publish ? 'bg-gray-900' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.auto_publish ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Horaires de publication</h2>
        <p className="text-xs text-gray-500">Recommandé : 9h00 et 18h00 (Europe/Paris)</p>

        <div className="space-y-2">
          {settings.post_times.map((time, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(i, e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {settings.post_times.length > 1 && (
                <button onClick={() => removeTime(i)} className="text-gray-400 hover:text-red-500 text-sm">✕</button>
              )}
            </div>
          ))}
        </div>

        {settings.post_times.length < 4 && (
          <button onClick={addTime} className="text-sm text-gray-500 hover:text-gray-700">+ Ajouter un horaire</button>
        )}
      </div>

      {/* Volume */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Volume de production</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1.5">Carrousels / jour</label>
            <select
              value={settings.daily_carousel_count}
              onChange={(e) => setSettings({ ...settings, daily_carousel_count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} carrousel{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1.5">Vidéos longues / jour</label>
            <select
              value={settings.daily_video_count}
              onChange={(e) => setSettings({ ...settings, daily_video_count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              {[0, 1, 2].map((n) => <option key={n} value={n}>{n} vidéo{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Cron info */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-sm text-blue-700 space-y-1">
        <p className="font-medium">Configuration du cron Vercel</p>
        <p className="text-xs text-blue-600">Ajoutez dans <code className="bg-blue-100 px-1 rounded">vercel.json</code> :</p>
        <pre className="text-xs bg-blue-100 rounded p-2 mt-1 overflow-x-auto">{`{ "crons": [{ "path": "/api/tiktok/cron", "schedule": "*/30 * * * *" }] }`}</pre>
        <p className="text-xs text-blue-600 mt-1">Variable d'env requise : <code className="bg-blue-100 px-1 rounded">CRON_SECRET</code></p>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 rounded-xl text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Save className="h-4 w-4" />}
        {saving ? 'Enregistrement...' : saved ? 'Enregistré !' : 'Enregistrer les paramètres'}
      </button>
    </div>
  );
}
