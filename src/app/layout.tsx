import type { Metadata } from "next";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

export const metadata: Metadata = {
  title: {
    default: "Visible & Conforme — L'outil SEO et conformité pour praticiens bien-être",
    template: "%s | Visible & Conforme",
  },
  description:
    "Communication pour praticiens bien-être. Visible & Conforme analyse vos contenus pour repérer les formulations à risque et générer des textes conformes, visibles sur Google.",
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
    title: "Visible & Conforme — L'outil SEO et conformité pour praticiens bien-être",
    description:
      "Communication pour praticiens bien-être. Analysez vos contenus, repérez les formulations à risque et générez des textes conformes visibles sur Google.",
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
      <body className="font-sans antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
