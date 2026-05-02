import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASA · Posts Instagram",
  description: "Gestionnaire de contenu Instagram & LinkedIn",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <span className="font-bold text-gray-900 text-sm tracking-tight">
              Anne-Sophie · Instagram
            </span>
            <div className="flex gap-1">
              {[
                { href: "/",           label: "Accueil"    },
                { href: "/carousels",  label: "Carousels"  },
                { href: "/stories",    label: "Stories"    },
                { href: "/flash",      label: "Flash"      },
              ].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
