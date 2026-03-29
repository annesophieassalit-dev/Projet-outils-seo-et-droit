import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ConformiWeb — Audit SEO & Conformité juridique",
    template: "%s | ConformiWeb",
  },
  description:
    "Vérifiez la conformité SEO et juridique de votre site de praticien bien-être. Évitez le risque d'exercice illégal de la médecine et optimisez votre visibilité sur Google.",
  keywords: [
    "audit seo naturopathe",
    "conformité juridique bien-être",
    "exercice illégal médecine",
    "mentions légales thérapeute",
    "naturopathe",
    "coach bien-être",
    "hypnothérapeute",
  ],
  openGraph: {
    title: "ConformiWeb — Audit SEO & Conformité juridique",
    description:
      "L'outil d'audit conçu pour les praticiens du bien-être non réglementés.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
