"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem("cookie_consent");
    if (!choice) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", JSON.stringify({ analytics, date: new Date().toISOString() }));
    if (analytics) {
      window.dispatchEvent(new Event("ga_consent_granted"));
    }
    setVisible(false);
  }

  function refuse() {
    localStorage.setItem("cookie_consent", JSON.stringify({ analytics: false, date: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            Ce site utilise des cookies strictement nécessaires à son fonctionnement (authentification, session).
            Vous pouvez également accepter des cookies de mesure d&apos;audience pour nous aider à améliorer l&apos;outil.{" "}
            <Link href="/confidentialite" className="text-zen-700 underline underline-offset-2 hover:text-zen-800">
              En savoir plus
            </Link>
          </p>
          <button
            onClick={refuse}
            aria-label="Fermer"
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="flex items-center gap-3 mb-5 cursor-pointer group">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 accent-zen-700 cursor-pointer"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            J&apos;accepte les cookies de mesure d&apos;audience (optionnel)
          </span>
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={accept}
            className="bg-zen-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zen-800 transition-colors"
          >
            {analytics ? "Accepter ma sélection" : "Accepter les cookies essentiels"}
          </button>
          <button
            onClick={refuse}
            className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Continuer sans accepter
          </button>
        </div>
      </div>
    </div>
  );
}
