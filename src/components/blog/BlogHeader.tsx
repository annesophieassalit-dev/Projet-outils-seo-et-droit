import Link from "next/link";

export default function BlogHeader() {
  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-zen-950">
          Visible &amp; Conforme
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-gray-500">
          <Link href="/#fonctionnalites" className="hover:text-gray-900 transition-colors">
            Fonctionnalités
          </Link>
          <Link href="/#tarifs" className="hover:text-gray-900 transition-colors">
            Tarifs
          </Link>
          <Link href="/blog" className="text-zen-700 font-medium hover:text-zen-900 transition-colors">
            Blog
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/connexion" className="hidden sm:inline text-sm text-gray-500 hover:text-gray-900 transition-colors">
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="bg-coral-500 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-coral-600 transition-colors"
          >
            Démarrer pour 1€
          </Link>
        </div>
      </div>
    </header>
  );
}
