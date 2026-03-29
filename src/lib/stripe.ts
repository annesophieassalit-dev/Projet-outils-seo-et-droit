import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

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
