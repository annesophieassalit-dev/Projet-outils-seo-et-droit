import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import { Analytics } from "@vercel/analytics/next";
import GAConsentLoader from "@/components/GAConsentLoader";

export const metadata: Metadata = {
  title: {
    default: "Visible & Conforme — L'outil SEO et conformité pour praticiens bien-être",
    template: "%s | Visible & Conforme",
  },
  description:
    "Communication pour praticiens bien-être. Visible & Conforme analyse vos contenus pour repérer les formulations à risque et générer des textes conformes, visibles sur Google.",
  verification: {
    google: "qf5PjwyLK-Yxmklaqxemx6l8OKbVgu97CKt1stQvXto",
  },
  keywords: [
    "conformité juridique bien-être",
    "risque exercice illégal médecine",
    "naturopathe communication",
    "mentions légales thérapeute",
    "seo naturopathe",
    "coach bien-être communication",
    "hypnothérapeute site internet",
  ],
  openGraph: {
    title: "Visible & Conforme — Analysez, corrigez, créez",
    description:
      "L'outil pour les praticiens bien-être qui veulent communiquer sans s'exposer et rester visibles sur Google.",
    type: "website",
    locale: "fr_FR",
    url: "https://www.visibleetconforme.fr/",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        {children}
        <CookieBanner />
        <GAConsentLoader />
        <Analytics />
      </body>
    </html>
  );
}
