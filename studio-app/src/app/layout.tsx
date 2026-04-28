import type { Metadata } from "next";
import { Montserrat, Arimo, Playfair_Display } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const arimo = Arimo({
  subsets: ["latin"],
  variable: "--font-arimo",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio de Contenu — Visible & Conforme",
  description: "Générateur de posts réseaux sociaux — Anne-Sophie Assalit",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${montserrat.variable} ${arimo.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
