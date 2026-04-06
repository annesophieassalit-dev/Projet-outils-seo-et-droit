import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Visible & Conforme — Conformité éditoriale pour praticiens bien-être",
    template: "%s | Visible & Conforme",
  },
  description:
    "Visible & Conforme analyse vos contenus pour repérer certaines formulations pouvant présenter un risque juridique. Conçu pour les praticiens du bien-être non réglementés en France.",
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
    title: "Visible & Conforme — Conformité éditoriale pour praticiens bien-être",
    description:
      "Analyse vos contenus pour repérer certaines formulations pouvant présenter un risque juridique.",
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
