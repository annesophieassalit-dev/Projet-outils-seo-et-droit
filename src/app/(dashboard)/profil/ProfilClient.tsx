"use client";

import { useState } from "react";
import { Check, Loader2, User, Sparkles } from "lucide-react";

const THEMES = [
  { id: "stress", label: "Stress & anxiété" },
  { id: "sommeil", label: "Sommeil" },
  { id: "fatigue", label: "Fatigue & énergie" },
  { id: "emotions", label: "Émotions" },
  { id: "confiance", label: "Confiance en soi" },
  { id: "douleurs", label: "Tensions & douleurs" },
  { id: "digestion", label: "Digestion & alimentation" },
  { id: "burn_out", label: "Épuisement professionnel" },
  { id: "parentalite", label: "Parentalité" },
  { id: "transition", label: "Transitions de vie" },
  { id: "feminite", label: "Cycle féminin" },
  { id: "enfants", label: "Accompagnement enfants" },
];

const TONES = [
  { id: "chaleureux", label: "Chaleureux", description: "Humain et proche" },
  { id: "professionnel", label: "Professionnel", description: "Sobre et crédible" },
  { id: "sobre", label: "Épuré", description: "Minimaliste, va à l'essentiel" },
] as const;

type ToneId = typeof TONES[number]["id"];

interface ProfileData {
  full_name?: string;
  profession?: string;
  ville?: string;
  themes_recurrents?: string[];
  ton_prefere?: string;
  specificites?: string;
}

export default function ProfilClient({ profile }: { profile: ProfileData }) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [profession, setProfession] = useState(profile.profession ?? "");
  const [ville, setVille] = useState(profile.ville ?? "");
  const [themes, setThemes] = useState<string[]>(profile.themes_recurrents ?? []);
  const [tone, setTone] = useState<ToneId>((profile.ton_prefere as ToneId) ?? "chaleureux");
  const [specificites, setSpecificites] = useState(profile.specificites ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleTheme(id: string) {
    setThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/profil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          profession,
          ville,
          themes_recurrents: themes,
          ton_prefere: tone,
          specificites,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="h-6 w-6 text-zen-700" />
          Mon profil praticien
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ces informations sont utilisées automatiquement dans le générateur — vous n&apos;avez plus à les retaper à chaque fois.
        </p>
      </div>

      {/* Identité */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Identité</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Anne-Sophie Dupont"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Activité / Profession</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex : Naturopathe, Sophrologue, Coach de vie…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ville <span className="text-gray-300">(optionnel)</span></label>
            <input
              type="text"
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Ex : Lyon, Paris 11e, Bordeaux…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600"
            />
          </div>
        </div>
      </div>

      {/* Thèmes récurrents */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Thèmes que vous accompagnez</h2>
          <p className="text-xs text-gray-400 mt-0.5">Sélectionnez ceux qui reviennent le plus souvent dans votre pratique</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => toggleTheme(theme.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                themes.includes(theme.id)
                  ? "bg-zen-700 text-white border-zen-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-zen-400"
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ton préféré */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ton de communication préféré</h2>
          <p className="text-xs text-gray-400 mt-0.5">Sera utilisé par défaut dans le générateur</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TONES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTone(t.id)}
              className={`p-4 rounded-xl border text-center transition-colors ${
                tone === t.id
                  ? "border-zen-600 bg-zen-50 text-zen-900"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Spécificités */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Ce qui vous rend unique
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Quelques mots sur votre approche, votre public, vos spécificités — l&apos;IA s&apos;en servira pour personnaliser chaque contenu
          </p>
        </div>
        <textarea
          value={specificites}
          onChange={(e) => setSpecificites(e.target.value)}
          rows={4}
          placeholder="Ex : Je travaille principalement avec des femmes de 35-55 ans, en présentiel à Lyon et en ligne. Approche corporelle. Certifiée IRNHE. Je propose des séances individuelles et des ateliers en groupe le samedi matin."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 resize-none"
        />
      </div>

      {/* Bouton save */}
      <div className="flex items-center gap-4 pb-4">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-zen-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zen-800 transition-colors disabled:opacity-40 text-sm"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4" />
          ) : null}
          {saving ? "Enregistrement…" : saved ? "Enregistré !" : "Enregistrer mon profil"}
        </button>
        {saved && (
          <p className="text-sm text-zen-700 font-medium">
            Le générateur utilisera ces informations automatiquement.
          </p>
        )}
      </div>
    </div>
  );
}
