import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  essentiel: {
    name: "Essentiel",
    priceId: process.env.STRIPE_PRICE_ESSENTIEL!,
    price: 29,
    description: "Pour démarrer sereinement",
    features: [
      "10 audits par mois",
      "Audit SEO complet",
      "Audit juridique (termes interdits + mentions)",
      "Historique 30 jours",
      "Support par email",
    ],
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 59,
    description: "Pour les professionnels actifs",
    features: [
      "Audits illimités",
      "Audit SEO complet",
      "Audit juridique avancé + IA",
      "Analyse nuancée par intelligence artificielle",
      "Export PDF des rapports",
      "Historique illimité",
      "Support prioritaire",
    ],
  },
} as const;
