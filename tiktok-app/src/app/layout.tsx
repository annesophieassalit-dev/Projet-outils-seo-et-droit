import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "TikTok Auto — Prévoir sans paniquer",
  description: "Automatisation TikTok — Organisation alimentaire simple",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={montserrat.variable}>{children}</body>
    </html>
  );
}
