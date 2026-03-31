"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

export default function MotDePasseOubliePage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/nouveau-mot-de-passe`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle2 className="h-14 w-14 text-zen-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Email envoyé</h1>
          <p className="text-gray-600 text-sm mb-6">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un
            lien de réinitialisation dans quelques minutes.
          </p>
          <Link
            href="/connexion"
            className="text-zen-700 text-sm font-medium hover:text-zen-800"
          >
            Retour à la connexion
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
          <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-500 text-sm mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zen-600 focus:border-transparent"
              placeholder="vous@exemple.fr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zen-700 text-white py-2.5 rounded-lg font-medium hover:bg-zen-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Envoyer le lien
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/connexion" className="text-zen-700 hover:text-zen-800">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
