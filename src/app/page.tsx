import Link from "next/link";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Sparkles,
  Scale,
  FileText,
  TrendingUp,
  Lock,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-sage-600" style={{ color: "#3a6e3a" }} />
            <span className="font-bold text-xl text-gray-900">ConformiWeb</span>
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
            <Link
              href="/connexion"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="bg-green-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-800 transition-colors font-medium"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 text-sm px-4 py-1.5 rounded-full mb-6 border border-green-200">
            <Leaf className="h-4 w-4" />
            Conçu par une juriste spécialisée en bien-être
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Votre site de praticien bien-être :
            <span className="text-green-700 block mt-1">
              visible, conforme et protégé
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Vérifiez en quelques minutes si votre site respecte les règles Google (SEO)
            <strong> et </strong>
            les règles juridiques applicables aux professionnels du bien-être non réglementés.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link
              href="/inscription"
              className="bg-green-700 text-white px-8 py-4 rounded-xl hover:bg-green-800 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
            >
              Analyser mon site gratuitement
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#fonctionnalites"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors font-medium text-lg"
            >
              Voir comment ça marche
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              1 audit gratuit sans carte bancaire
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Résultats en moins de 2 minutes
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Règles mises à jour régulièrement
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pourquoi c'est important ──────────────────────────────────── */}
      <section id="pourquoi" className="py-20 bg-amber-50 border-y border-amber-100 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Savez-vous ce que vous risquez ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Scale,
                title: "Exercice illégal de la médecine",
                desc: "Certains termes sur votre site peuvent constituer une infraction pénale (Art. L4161-1 du Code de la santé publique) : \"soigner\", \"guérir\", \"diagnostiquer\", \"traiter\"...",
                color: "text-red-600",
                bg: "bg-red-50 border-red-200",
              },
              {
                icon: FileText,
                title: "Mentions obligatoires manquantes",
                desc: "Tout site professionnel doit avoir des mentions légales, une politique de confidentialité RGPD et vos informations d'identification (SIRET, adresse).",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
              },
              {
                icon: AlertTriangle,
                title: "Publicité mensongère",
                desc: "\"Résultats garantis\", \"méthode révolutionnaire\", \"guérit l'anxiété\"... ces affirmations peuvent vous exposer à des poursuites pour pratiques commerciales trompeuses.",
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-200",
              },
              {
                icon: Search,
                title: "Invisible sur Google",
                desc: "Un site sans balise title optimisée, sans meta description, sans structure H1/H2 cohérente ne sera jamais trouvé par vos futurs clients sur Google.",
                color: "text-blue-600",
                bg: "bg-blue-50 border-blue-200",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`p-6 rounded-xl border ${item.bg}`}
              >
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
              Un audit double : SEO + Juridique
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              ConformiWeb est le seul outil pensé spécifiquement pour les praticiens
              du bien-être non réglementés, avec des règles juridiques adaptées à votre secteur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* SEO */}
            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Audit SEO</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Balises title et meta description",
                  "Structure H1/H2/H3 des titres",
                  "Images sans texte alternatif",
                  "Compatibilité mobile (viewport)",
                  "Sécurité HTTPS",
                  "Liens canoniques",
                  "Données structurées Schema.org",
                  "Open Graph pour les réseaux sociaux",
                  "Densité et longueur du contenu",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Juridique */}
            <div className="rounded-2xl border border-green-200 bg-green-50/30 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Audit juridique</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Termes médicaux interdits (guérir, soigner, diagnostiquer...)",
                  "Risque d'exercice illégal de la médecine",
                  "Confusion avec professions de santé réglementées",
                  "Présence des mentions légales (LCEN)",
                  "Conformité RGPD et politique de confidentialité",
                  "Affichage des prix TTC",
                  "Droit de rétractation (14 jours)",
                  "Publicité mensongère et allégations non prouvées",
                  "Analyse nuancée par IA (plan Pro)",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
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
            ConformiWeb s&apos;adresse aux praticiens du bien-être non réglementés en France
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Naturopathe",
              "Coach de vie",
              "Hypnothérapeute",
              "Réflexologue",
              "Énergéticien",
              "Praticien Reiki",
              "Sophrologue",
              "Nutritionniste (non diététicien)",
              "Coach sportif bien-être",
              "Praticien EFT",
              "Kinésiologue",
              "Praticien en méditation",
              "Thérapeute familial",
              "Aromathérapeute",
            ].map((pro) => (
              <span
                key={pro}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm"
              >
                {pro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─────────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-gray-600">Sans engagement · Résiliable à tout moment</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Gratuit */}
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Gratuit</h3>
              <p className="text-gray-500 text-sm mb-4">Pour découvrir l&apos;outil</p>
              <div className="text-4xl font-bold mb-6">0 €</div>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {[
                  "1 audit par mois",
                  "Audit SEO complet",
                  "Pas d'audit juridique",
                  "Pas d'export PDF",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-gray-400 shrink-0" />
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

            {/* Essentiel */}
            <div className="border-2 border-green-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Recommandé
              </div>
              <h3 className="font-bold text-xl mb-1">Essentiel</h3>
              <p className="text-gray-500 text-sm mb-4">Pour une conformité complète</p>
              <div className="text-4xl font-bold mb-1">
                29 €<span className="text-lg font-normal text-gray-500">/mois</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">HT · exonéré TVA si applicable</p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {[
                  "10 audits par mois",
                  "Audit SEO complet",
                  "Audit juridique (termes interdits + mentions)",
                  "Historique 30 jours",
                  "Support par email",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription?plan=essentiel"
                className="block text-center bg-green-700 text-white py-3 rounded-xl hover:bg-green-800 transition-colors font-semibold"
              >
                Démarrer l&apos;essai
              </Link>
            </div>

            {/* Pro */}
            <div className="border border-gray-200 rounded-2xl p-8 bg-gray-900 text-white">
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                Pro <Sparkles className="h-4 w-4 text-yellow-400" />
              </h3>
              <p className="text-gray-400 text-sm mb-4">Pour les professionnels actifs</p>
              <div className="text-4xl font-bold mb-1 text-white">
                59 €<span className="text-lg font-normal text-gray-400">/mois</span>
              </div>
              <p className="text-xs text-gray-500 mb-6">HT</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-8">
                {[
                  "Audits illimités",
                  "Audit SEO + juridique complet",
                  "Analyse nuancée par IA (Claude)",
                  "Export PDF des rapports",
                  "Historique illimité",
                  "Support prioritaire",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription?plan=pro"
                className="block text-center bg-white text-gray-900 py-3 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
              >
                Essayer Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA final ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-green-700 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="h-10 w-10 text-green-200 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Protégez votre activité aujourd&apos;hui
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Un audit gratuit, aucune carte bancaire requise.
            Découvrez en 2 minutes les risques de votre site actuel.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-white text-green-800 px-8 py-4 rounded-xl hover:bg-green-50 transition-colors font-bold text-lg"
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
            <ShieldCheck className="h-5 w-5 text-green-700" />
            <span className="font-bold text-gray-900">ConformiWeb</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2024 ConformiWeb · Cet outil ne constitue pas un avis juridique.
            Les résultats sont indicatifs et ne se substituent pas à une consultation juridique.
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
