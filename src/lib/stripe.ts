import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

// ID du prix Stripe "1€ - Frais d'essai 7 jours" (créer dans Stripe Dashboard : produit one-time, 1,00 €)
export const TRIAL_PRICE_ID = process.env.STRIPE_TRIAL_PRICE_ID;

export const PLANS = {
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 19,
    description: "Accès complet à tous les outils",
    features: [
      "Diagnostics illimités",
      "Diagnostic SEO complet",
      "Diagnostic de conformité juridique",
      "Scanner de texte avec analyse IA",
      "Générateur de contenus safe",
      "Bibliothèque de formulations",
      "Export PDF des rapports",
      "Historique illimité",
    ],
  },
} as const;
