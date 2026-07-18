"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl text-zen-950">Visible &amp; Conforme</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#fonctionnalites" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Fonctionnalités
          </a>
          <a href="#pourquoi" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pourquoi l&apos;utiliser
          </a>
          <a href="#tarifs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            FAQ
          </a>
          <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/connexion" className="hidden sm:inline text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="bg-coral-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-coral-600 transition-colors font-medium"
          >
            Démarrer pour 1€
          </Link>

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-1 text-gray-600 hover:text-gray-900"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
          <a
            href="#fonctionnalites"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-50"
          >
            Fonctionnalités
          </a>
          <a
            href="#pourquoi"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-50"
          >
            Pourquoi l&apos;utiliser
          </a>
          <a
            href="#tarifs"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-50"
          >
            Tarifs
          </a>
          <a
            href="#faq"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-50"
          >
            FAQ
          </a>
          <Link
            href="/blog"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-zen-700 font-medium hover:text-zen-900 border-b border-gray-50"
          >
            Blog
          </Link>
          <Link
            href="/connexion"
            onClick={() => setOpen(false)}
            className="py-2.5 text-sm text-gray-600 hover:text-gray-900"
          >
            Connexion
          </Link>
        </div>
      )}
    </header>
  );
}
