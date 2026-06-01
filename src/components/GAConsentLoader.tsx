"use client";

import { useEffect } from "react";

const GA_ID = "G-HPTN3MB7ZP";

function loadGA() {
  if (document.querySelector(`script[src*="${GA_ID}"]`)) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void }).dataLayer =
    (window as Window & { dataLayer?: unknown[] }).dataLayer || [];
  function gtag(...args: unknown[]) {
    ((window as Window & { dataLayer?: unknown[] }).dataLayer as unknown[]).push(args);
  }
  (window as Window & { gtag?: (...a: unknown[]) => void }).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);
}

export default function GAConsentLoader() {
  useEffect(() => {
    // Charge GA si consentement déjà donné lors d'une visite précédente
    const choice = localStorage.getItem("cookie_consent");
    if (choice) {
      try {
        const parsed = JSON.parse(choice);
        if (parsed.analytics) loadGA();
      } catch {}
    }

    // Charge GA quand l'utilisateur accepte dans la même session
    const handler = () => loadGA();
    window.addEventListener("ga_consent_granted", handler);
    return () => window.removeEventListener("ga_consent_granted", handler);
  }, []);

  return null;
}
