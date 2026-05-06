import Link from "next/link";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Scale,
  FileText,
  TrendingUp,
  Lock,
  ScanText,
  BookOpen,
  ChevronDown,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-zen-950">Visible & Conforme</span>
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
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
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
      <section className="relative pt-28 pb-36 px-4 sm:px-6 overflow-hidden bg-gradient-to-br from-white via-zen-50/60 to-white">

        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-zen-100 to-zen-200 rounded-full blur-3xl opacity-30 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-zen-200 rounded-full blur-2xl opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-zen-100 to-zen-50 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-coral-100 rounded-full blur-2xl opacity-25 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* ── Colonne texte ── */}
            <div>
              <div className="inline-flex items-center gap-2 bg-zen-50 text-zen-700 text-sm px-4 py-1.5 rounded-full mb-10 border border-zen-200 font-medium">
                Pensé pour les professionnels du bien-être
              </div>

              <h1 className="text-[2.1rem] sm:text-[2.6rem] font-bold leading-[1.25] tracking-tight mb-8">
                <span className="text-zen-500 font-semibold block mb-3 text-2xl sm:text-3xl">
                  Certains mots améliorent votre visibilité.
                </span>
                <span className="text-zen-950 block">
                  D&apos;autres peuvent{" "}
                  <span className="text-coral-500 font-extrabold">vous exposer.</span>
                </span>
              </h1>

              <p className="text-lg font-semibold text-zen-950 mb-4 leading-snug">
                Publiez des contenus visibles et conformes.
              </p>

              <p className="text-base text-zen-500 italic mb-4">
                Parce que certains mots n&apos;ont pas les mêmes conséquences pour vous.
              </p>

              <p className="text-sm text-gray-500 mb-12 leading-relaxed">
                Identifiez les formulations pouvant poser problème dans votre communication en quelques secondes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/inscription"
                  className="bg-coral-500 text-white px-7 py-3.5 rounded-xl hover:bg-coral-600 transition-colors font-semibold text-base flex items-center justify-center gap-2 shadow-sm"
                >
                  Analyser mes contenus gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#fonctionnalites"
                  className="border border-zen-200 text-zen-700 bg-white/80 px-7 py-3.5 rounded-xl hover:bg-zen-50 transition-colors font-medium text-base text-center"
                >
                  Voir comment ça marche
                </a>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 text-sm text-zen-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  14 jours gratuits, sans carte bancaire
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  Résultats en moins de 2 minutes
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  Règles actualisées régulièrement
                </div>
              </div>
            </div>

            {/* ── Colonne mockup ── */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-zen-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-coral-100 rounded-full blur-2xl opacity-40 pointer-events-none" />

              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* En-tête du rapport */}
                <div className="bg-gradient-to-r from-zen-700 to-zen-600 px-5 py-4 flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-zen-200 shrink-0" />
                  <span className="text-sm font-semibold text-white">Rapport de diagnostic</span>
                  <span className="ml-auto text-xs bg-zen-800/40 text-zen-200 px-2 py-0.5 rounded-full font-medium">Sophrologue · Lyon</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zen-50 border border-zen-200 rounded-xl p-4">
                      <p className="text-3xl font-extrabold text-zen-700">74</p>
                      <p className="text-xs text-zen-600 mt-0.5 font-medium">Score visibilité</p>
                      <div className="mt-2 h-1.5 bg-zen-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zen-500 rounded-full" style={{ width: "74%" }} />
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-3xl font-extrabold text-red-500">42</p>
                      <p className="text-xs text-red-500 mt-0.5 font-medium">Score conformité</p>
                      <div className="mt-2 h-1.5 bg-red-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: "42%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Stats rapides */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Mots analysés", value: "847" },
                      { label: "H1 détectés", value: "1" },
                      { label: "Images sans alt", value: "3" },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
                        <p className="text-base font-bold text-gray-800">{s.value}</p>
                        <p className="text-xs text-gray-400 leading-tight mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Formulations */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Formulations à surveiller</p>
                    <div className="border-l-[3px] border-red-400 pl-3 py-2 rounded-r-lg bg-red-50/60">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-red-700">« je traite »</span>
                        <span className="ml-auto text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">Critique</span>
                      </div>
                      <p className="text-xs text-red-500 leading-relaxed">Risque d&apos;assimilation à un acte médical réglementé</p>
                    </div>
                    <div className="border-l-[3px] border-amber-400 pl-3 py-2 rounded-r-lg bg-amber-50/60">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-amber-800">« méthode efficace contre l&apos;anxiété »</span>
                        <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Vigilance</span>
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">Formulation pouvant être interprétée comme une promesse implicite de résultat</p>
                    </div>
                  </div>

                  {/* Check mentions obligatoires */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                    <div className="flex flex-col items-center gap-1 py-1.5">
                      <CheckCircle2 className="h-4 w-4 text-zen-600" />
                      <span className="text-xs text-gray-400 text-center leading-tight">Mentions légales</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1.5">
                      <CheckCircle2 className="h-4 w-4 text-zen-600" />
                      <span className="text-xs text-gray-400 text-center leading-tight">HTTPS</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 py-1.5">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-gray-400 text-center leading-tight">Politique RGPD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Types de risques ───────────────────────────────────────────── */}
      <section id="pourquoi" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-zen-50/40 to-white border-y border-zen-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-3">
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
                color: "text-zen-700",
                bg: "bg-zen-50 border-zen-200",
              },
            ].map((item) => (
              <div key={item.title} className={`p-6 rounded-xl border ${item.bg}`}>
                <item.icon className={`h-7 w-7 ${item.color} mb-3`} />
                <h3 className="font-semibold text-zen-950 mb-2">{item.title}</h3>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-zen-950 mb-4">
              Tous les outils pour communiquer avec plus de vigilance
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Le seul outil pensé spécifiquement pour les praticiens du bien-être non réglementés,
              avec des règles adaptées à votre secteur.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-zen-950 mb-3">Diagnostic visibilité</h3>
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
              <h3 className="text-xl font-bold text-zen-950 mb-3">Diagnostic conformité</h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Formulations à risque (soigner, traiter, guérir...)",
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
              <h3 className="text-xl font-bold text-zen-950 mb-3">Scanner de texte</h3>
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
              <h3 className="text-xl font-bold text-zen-950 mb-3">Bibliothèque & Générateur</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Accédez à une bibliothèque de formulations validées par thème
                (stress, sommeil, émotions...). Le plan Pro débloque la génération
                automatique de bio Instagram, posts LinkedIn, scripts TikTok et plus —
                tous pensés pour votre activité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pour qui ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-zen-50/50 via-white to-zen-50/30 border-y border-zen-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-zen-950 mb-4">
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
              <span key={pro} className="bg-white border border-zen-200 text-zen-800 px-4 py-2 rounded-full text-sm shadow-sm">
                {pro}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pourquoi Visible & Conforme — encart Anne-Sophie ───────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-zen-700 via-zen-600 to-zen-800 relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-zen-500 rounded-full blur-3xl opacity-20 pointer-events-none -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-zen-900 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/4 -translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* Photo */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-zen-500/30 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/anne-sophie.jpg"
                  alt="Anne-Sophie Assalit"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Texte */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-5">
                Pourquoi Visible & Conforme ?
              </h2>
              <div className="space-y-4 text-zen-100 text-sm leading-relaxed">
                <p>
                  Je suis juriste de formation et consultante en visibilité conforme.
                </p>
                <p>
                  J&apos;ai créé Visible & Conforme à partir d&apos;un constat simple : beaucoup de professionnels
                  utilisent des formulations pensées pour améliorer leur visibilité… sans toujours mesurer
                  les conséquences possibles de certains mots dans leur communication.
                </p>
                <p>
                  Visible & Conforme a été conçu pour aider les professions à communication sensible
                  à publier des contenus plus visibles, plus clairs et plus adaptés à leur activité.
                  Une approche pensée à la croisée du SEO local, de la rédaction web et de la vigilance éditoriale.
                </p>
              </div>
              <p className="mt-5 text-zen-300 text-xs font-medium">
                Anne-Sophie Assalit · Juriste & fondatrice de Visible & Conforme
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tarifs ─────────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-zen-950 mb-4">
              Des tarifs adaptés à votre activité
            </h2>
            <p className="text-gray-600">Sans engagement · Résiliable à tout moment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Essai 14 jours */}
            <div className="border border-gray-200 rounded-2xl p-8">
              <h3 className="font-bold text-xl mb-1">Essai gratuit</h3>
              <p className="text-gray-500 text-sm mb-4">14 jours — accès complet</p>
              <div className="text-4xl font-bold mb-1">0 €</div>
              <p className="text-xs text-gray-400 mb-6">Sans carte bancaire</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {[
                  "Accès à toutes les fonctionnalités Pro",
                  "Diagnostics visibilité + conformité illimités",
                  "Scanner de texte illimité",
                  "Générateur de contenus",
                  "Bibliothèque complète de formulations",
                  "Export PDF des rapports",
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
                Démarrer l&apos;essai gratuit
              </Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-zen-600 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zen-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                Après l&apos;essai
              </div>
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                Pro
                <Sparkles className="h-4 w-4 text-amber-500" />
              </h3>
              <p className="text-gray-500 text-sm mb-4">Tous les outils, sans limite</p>
              <div className="text-4xl font-bold mb-1">
                19 €<span className="text-lg font-normal text-gray-500">/mois</span>
              </div>
              <p className="text-xs text-gray-400 mb-6">Sans engagement · Résiliable à tout moment</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {[
                  "Diagnostics illimités (visibilité + conformité)",
                  "Scans de texte illimités",
                  "Générateur de contenus — illimité",
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
                href="/inscription"
                className="block text-center bg-coral-500 text-white py-3 rounded-xl hover:bg-coral-600 transition-colors font-semibold"
              >
                Commencer l&apos;essai gratuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-zen-50/30 to-white border-t border-zen-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zen-950 mb-3">Questions fréquentes</h2>
            <p className="text-gray-500 text-sm">Tout ce que vous devez savoir avant de commencer.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "À qui s'adresse Visible & Conforme ?",
                a: "Visible & Conforme s'adresse aux professionnels du bien-être et aux activités à communication sensible : sophrologues, hypnothérapeutes, praticiens bien-être, accompagnants, coachs spécialisés, thérapeutes, etc. L'outil a été pensé pour les professionnels qui ont besoin d'être visibles en ligne, tout en faisant attention à la manière dont ils communiquent.",
              },
              {
                q: "Que fait l'outil ?",
                a: "Visible & Conforme analyse vos contenus afin de détecter certains points pouvant poser problème dans votre communication. L'outil permet notamment de repérer des formulations sensibles, identifier certains termes à risque, proposer des reformulations plus adaptées, analyser certains éléments liés à votre visibilité, détecter des points d'amélioration SEO, et vous aider à publier des contenus plus visibles et plus cohérents avec votre activité.",
              },
              {
                q: "Est-ce un outil juridique ?",
                a: "Non. Visible & Conforme ne remplace pas un avocat et ne constitue pas un conseil juridique personnalisé. L'outil propose une analyse automatisée orientée vigilance éditoriale et prévention du risque dans les contenus publiés en ligne.",
              },
              {
                q: "Quels contenus puis-je analyser ?",
                a: "Vous pouvez analyser votre site internet, une page de présentation, une bio Instagram, une fiche Google Business Profile, un post LinkedIn ou Instagram, une page de vente, une newsletter, ou tout autre contenu destiné à être publié.",
              },
              {
                q: "Pourquoi certains mots peuvent-ils poser problème ?",
                a: "Certaines formulations peuvent être interprétées comme des promesses de résultats, des affirmations thérapeutiques, ou des formulations susceptibles de créer une confusion sur votre rôle ou votre activité. Le contexte, les mots utilisés et la manière de présenter une activité peuvent avoir des conséquences sur la perception de votre communication.",
              },
              {
                q: "L'outil aide-t-il aussi à améliorer la visibilité ?",
                a: "Oui. Visible & Conforme ne se limite pas à la conformité éditoriale. L'outil analyse également certains éléments liés à votre visibilité en ligne : structure des contenus, lisibilité, cohérence des textes, formulations utilisées, présence de certains éléments importants pour le référencement local. L'objectif est de vous aider à publier des contenus à la fois visibles et adaptés à votre activité.",
              },
              {
                q: "Dois-je avoir des connaissances juridiques ou SEO pour utiliser l'outil ?",
                a: "Non. Visible & Conforme a été conçu pour être utilisé simplement, sans connaissances techniques particulières. Les analyses et suggestions sont formulées dans un langage accessible, sans jargon inutile.",
              },
              {
                q: "Pourquoi choisir Visible & Conforme face à une IA classique comme ChatGPT ?",
                a: "Les IA généralistes peuvent aider à rédiger du contenu, mais elles ne sont pas conçues spécifiquement pour les professions à communication sensible. Visible & Conforme a été pensé pour analyser certaines formulations à risque, la cohérence entre visibilité et cadre professionnel, et les problématiques fréquentes rencontrées par les professionnels du bien-être. L'outil combine analyse de contenu, visibilité et vigilance éditoriale dans une logique adaptée à votre activité.",
              },
              {
                q: "L'accès est-il gratuit ?",
                a: "Visible & Conforme propose un essai gratuit de 14 jours, sans carte bancaire. La version Pro vous donne ensuite accès à l'ensemble des fonctionnalités, sans limitation d'utilisation.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none hover:bg-zen-50/50 transition-colors">
                  <span className="font-semibold text-zen-950 text-sm leading-snug">{item.q}</span>
                  <ChevronDown className="h-4 w-4 text-zen-600 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA final ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-coral-500 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Lock className="h-10 w-10 text-coral-100 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Identifiez ce qui peut vous exposer
          </h2>
          <p className="text-coral-100 mb-8 text-lg">
            14 jours gratuits, accès complet, aucune carte bancaire requise.
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
            © 2026 Visible & Conforme · Ne constitue pas une consultation juridique.
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
