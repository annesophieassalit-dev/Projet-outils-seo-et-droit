"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ParametresPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="bg-[#2B2B2B] text-white px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="font-bold">Paramètres</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-5">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Variables d'environnement requises</h2>
          <p className="text-sm text-gray-500">Configure ces variables dans Vercel → Settings → Environment Variables</p>

          {[
            { key: 'ANTHROPIC_API_KEY', desc: 'Clé API Anthropic (console.anthropic.com)', required: true },
            { key: 'CRON_SECRET', desc: 'Mot de passe secret pour protéger le cron automatique', required: false },
          ].map(({ key, desc, required }) => (
            <div key={key} className="border border-stone-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <code className="text-sm font-bold text-gray-900">{key}</code>
                {required && <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Requis</span>}
              </div>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
          <h2 className="font-bold text-gray-900">Cron automatique</h2>
          <p className="text-sm text-gray-500">Ajoute dans <code className="bg-stone-100 px-1 rounded">vercel.json</code> à la racine du dossier <code className="bg-stone-100 px-1 rounded">tiktok-app/</code> :</p>
          <pre className="bg-stone-50 rounded-xl p-4 text-xs overflow-x-auto text-gray-700">{`{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 7 * * *"
  }]
}`}</pre>
          <p className="text-xs text-gray-400">Le cron tourne à 7h chaque matin. Sur le plan gratuit Vercel : 1 fois par jour maximum.</p>
        </div>

        <div className="bg-[#F6E27A]/30 border border-[#F6E27A] rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 mb-2">TikTok API</h3>
          <p className="text-sm text-gray-600">La connexion TikTok nécessite une validation de l'app sur <strong>developers.tiktok.com</strong> (1-2 semaines). En attendant, génère le contenu ici et copie la légende pour poster manuellement.</p>
        </div>
      </div>
    </div>
  );
}
