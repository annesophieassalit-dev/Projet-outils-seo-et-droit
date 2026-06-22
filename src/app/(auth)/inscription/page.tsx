"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

const PROFESSIONS = [
  "Naturopathe",
  "Coach de vie / bien-être",
  "Hypnothérapeute",
  "Réflexologue",
  "Sophrologue",
  "Énergéticien(ne)",
  "Praticien(ne) Reiki",
  "Kinésiologue",
  "Aromathérapeute",
  "Praticien(ne) EFT",
  "Nutritionniste",
  "Autre praticien bien-être",
];

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "gratuit";
  const supabase = createClient();

  const [step, setStep] = useState<"form" | "success">("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        data: {
          full_name: fullName,
          profession,
        },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email."
          : signUpError.message
      );
      setLoading(false);
      return;
    }

    if (data.user) {
      // Créer le profil
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        profession,
        plan: "gratuit",
        audits_used_this_month: 0,
        audits_reset_date: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          1
        ).toISOString(),
      });
    }

    setStep("success");
    setLoading(false);
  }

  if (step === "success") {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-zen-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Compte créé !
          </h1>
          <p className="text-gray-600 mb-2">
            Un email de confirmation a été envoyé à{" "}
            <strong>{email}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Cliquez sur le lien dans l&apos;email pour activer votre compte, puis connectez-vous pour finaliser votre abonnement.
          </p>
          <Link
            href={initialPlan === "pro_direct" ? "/connexion?redirect=abonnement" : "/connexion"}
            className="block w-full bg-zen-700 text-white py-2.5 rounded-lg font-medium hover:bg-zen-800 transition-colors text-center"
          >
            Aller à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <ShieldCheck className="h-10 w-10 text-zen-700 mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
          <p className="text-gray-500 text-sm mt-1">
            {initialPlan !== "gratuit"
              ? `7 jours pour 1€ · Puis 19€/mois · Résiliable`
              : "Essai 7 jours · 1€ · Accès complet"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom complet
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 focus:border-transparent"
              placeholder="Marie Dupont"
            />
          </div>

          <div>
            <label
              htmlFor="profession"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Votre activité
            </label>
            <select
              id="profession"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 focus:border-transparent bg-white"
            >
              <option value="">Sélectionnez votre activité</option>
              {PROFESSIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 focus:border-transparent"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 focus:border-transparent pr-10"
                placeholder="Minimum 8 caractères"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgv" className="text-zen-700 hover:underline">
              CGV
            </Link>{" "}
            et notre{" "}
            <Link href="/confidentialite" className="text-zen-700 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zen-700 text-white py-2.5 rounded-lg font-medium hover:bg-zen-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Créer mon compte
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-zen-700 font-medium hover:text-zen-800"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
