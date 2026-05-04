import Link from "next/link";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Scale,
  FileText,
  TrendingUp,
  Lock,
  ScanText,
  BookOpen,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-gray-900">Visible & Conforme</span>
          </Link>
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
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/connexion" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="bg-coral-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-coral-600 transition-colors font-medium"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-zen-50 text-zen-800 text-sm px-4 py-1.5 rounded-full mb-8 border border-zen-200">
            Pensé pour les professionnels du bien-être
          </div>

          <h1 className="leading-tight mb-6">
            <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight">
              Soyez{" "}
              <span className="text-zen-600">visible.</span>
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight mt-1">
              Restez{" "}
              <span className="text-coral-500">conforme.</span>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            L&apos;outil SEO & juridique conçu pour les praticiens du bien-être —
            analysez votre site, sécurisez vos textes, créez des contenus optimisés.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/inscription"
              className="bg-coral-500 text-white px-8 py-4 rounded-xl hover:bg-coral-600 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              Analyser mes contenus gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#fonctionnalites"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              Voir comment ça marche
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-zen-600" />
              1 diagnostic gratuit, sans carte bancaire
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-zen-600" />
              Résultats en moins de 2 minutes
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-zen-600" />
              Règles actualisées régulièrement
            </div>
          </div>
        </div>
      </section>

      {/* ─── Types de risques ───────────────────────────────────────────── */}
      <section id="pourquoi" className="py-20 bg-gray-50 border-y border-gray-100 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Les types de risques que Visible & Conforme aide à repérer
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Sans sur-promettre — Visible & Conforme identifie des zones de vigilance, pas des certitudes juridiques.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Scale,
                title: "Confusion sur la qualification",
                desc: "Usage de termes pouvant laisser penser à un statut réglementé : « thérapeute », « Dr », « clinicien », « psychothérapeute ».",
                color: "text-red-600",
                bg: "bg-red-50 border-red-200",
              },
              {
                icon: AlertTriangle,
                title: "Promesses pouvant être interprétées comme trompeuses",
                desc: "Angle Code de la consommation : « résultats garantis », « immédiat », « radical », « miracle » — allégations invérifiables.",
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-200",
              },
              {
                icon: FileText,
                title: "Vocabulaire créant une ambiguïté médicale",
                desc: "Termes associés au domaine médical : soigner, traiter, guérir, diagnostiquer, soulager, rétablir, pathologie, symptôme...",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
              },
              {
                icon: Search,
                title: "Manque de clarté sur le positionnement réel",
                desc: "Problème fréquent en SEO aussi : un praticien mal positionné dans ses textes n'est ni visible sur Google ni compris par ses visiteurs.",
                color: "text-blue-600",
                bg: "bg-blue-50 border-blue-200",
              },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-xl border ${item.bg}`}>
                <item.icon className={`h-7 w-7 ${item.color} mb-3`} />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tous les outils pour communiquer en toute sécurité
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Le seul outil pensé spécifiquement pour les praticiens du bien-être non réglementés,
              avec des règles juridiques adaptées à votre secteur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Diagnostic SEO</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Balises title et meta description",
                  "Structure H1/H2/H3 des titres",
                  "Images sans texte alternatif",
                  "Compatibilité mobile (viewport)",
                  "Sécurité HTTPS",
                  "Maillage interne",
                  "Sémantique et positionnement",
                  "Données structurées Schema.org",
                  "Open Graph pour les réseaux sociaux",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-zen-200 bg-zen-50/30 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-zen-100 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6 text-zen-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Diagnostic de conformité</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Termes médicaux interdits (guérir, soigner, diagnostiquer...)",
                  "Risque d'exercice illégal de la médecine",
                  "Confusion avec professions de santé réglementées",
                  "Présence des mentions légales (LCEN)",
                  "Conformité RGPD et politique de confidentialité",
                  "Publicité mensongère et allégations non prouvées",
                  "Scanner de texte avec alertes colorées",
                  "Reformulations validées proposées",
                  "Analyse nuancée par IA (plan Pro)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5">
                <ScanText className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Scanner de texte</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Collez n&apos;importe quel texte — bio Instagram, post, page de site —
                et détectez instantanément les formulations à risque avec alertes
                colorées et reformulations validées.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-5">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bibliothèque & Générateur</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Accédez à une bibliothèque de formulations validées par thème
                (stress, sommeil, émotions...). Le plan Pro débloque la génération
                automatique de bio Instagram, posts LinkedIn, scripts TikTok, descriptions de programmes
                et plus — tous juridiquement sûrs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pour qui ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-y px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Fait pour vous si vous êtes…
          </h2>
          <p className="text-gray-500 mb-10">
            Visible & Conforme s&apos;adresse aux praticiens du bien-être non réglementés en France
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Naturopathe", "Coach de vie", "Hypnothérapeute", "Réflexologue",
              "Énergéticien", "Praticien Reiki", "Sophrologue",
              "Nutritionniste (non diététicien)", "Coach sportif bien-être",
              "Praticien EFT", "Kinésiologue", "Praticien en méditation",
              "Thérapeute familial", "Aromathérapeute",
            ].map((pro) => (
              <span key={pro} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm">
                {pro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─────────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-gray-600">Sans engagement · Résiliable à tout moment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Gratuit — uniquement ce qui est inclus */}
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Gratuit</h3>
              <p className="text-gray-500 text-sm mb-4">Pour découvrir l&apos;outil</p>
              <div className="text-4xl font-bold mb-6">0 €</div>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {[
                  "1 diagnostic par mois (SEO ou conformité)",
                  "5 scans de texte par mois",
                  "Rapport avec points clés identifiés",
                  "Bibliothèque de formulations validées",
                  "Accès immédiat, sans carte bancaire",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className="block text-center border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Commencer gratuitement
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-zen-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zen-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Recommandé
              </div>
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                Pro
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">Tous les outils, sans limite</p>
              <div className="text-4xl font-bold mb-1">
                19 €<span className="text-lg font-normal text-gray-500">/mois</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Sans engagement</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {[
                  "3 diagnostics par mois (SEO + conformité)",
                  "Scans de texte illimités",
                  "Générateur de contenus safe — illimité",
                  "Posts LinkedIn, Instagram, TikTok, Threads…",
                  "Bibliothèque complète + historique",
                  "Export PDF des rapports",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription?plan=pro"
                className="block text-center bg-coral-500 text-white py-3 rounded-xl hover:bg-coral-600 transition-colors font-semibold"
              >
                Démarrer l&apos;essai
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-coral-500 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="h-10 w-10 text-coral-100 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Protégez votre activité aujourd&apos;hui
          </h2>
          <p className="text-coral-100 mb-8 text-lg">
            Un diagnostic gratuit, aucune carte bancaire requise.
            Découvrez en 2 minutes les risques de votre site actuel.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-white text-coral-700 px-8 py-4 rounded-xl hover:bg-coral-50 transition-colors font-bold text-lg"
          >
            Analyser mon site maintenant
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zen-700" />
            <span className="font-bold text-gray-900">Visible & Conforme</span>
          </div>
          <p className="text-sm text-gray-400 text-center">
            © 2025 Visible & Conforme · Ne constitue pas une consultation juridique.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/mentions-legales" className="hover:text-gray-900 transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-gray-900 transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
