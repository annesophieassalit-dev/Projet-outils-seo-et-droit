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
              Démarrer pour 1€
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-36 px-4 sm:px-6 bg-gradient-to-br from-white via-zen-50/60 to-white">

        {/* Cercles décoratifs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-zen-100 to-zen-200 rounded-full blur-3xl opacity-30 -translate-y-1/4 translate-x-1/4" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-zen-200 rounded-full blur-2xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-zen-100 to-zen-50 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-coral-100 rounded-full blur-2xl opacity-25" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* ── Colonne texte ── */}
            <div>
              <div className="inline-flex items-center gap-2.5 bg-zen-50 text-zen-800 text-sm px-5 py-2.5 rounded-full mb-10 font-semibold border border-zen-200 shadow-[0_0_28px_rgba(47,94,78,0.22),0_2px_12px_rgba(47,94,78,0.10)]">
                <span className="w-2 h-2 rounded-full bg-zen-500 shrink-0" />
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

              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                Analysez <strong className="text-gray-700 font-medium">vos contenus</strong>, repérez les formulations à risque et créez des textes adaptés à votre activité.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-8 text-sm text-zen-700">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  Évitez les formulations à risque
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  Gagnez en visibilité et en clarté
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-zen-500 shrink-0" />
                  Publiez sereinement et en confiance
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Link
                  href="/inscription"
                  className="bg-coral-500 text-white px-7 py-3.5 rounded-xl hover:bg-coral-600 transition-colors font-semibold text-base flex items-center justify-center gap-2 shadow-sm"
                >
                  Essayer 7 jours pour 1€
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#fonctionnalites"
                  className="border border-zen-200 text-zen-700 bg-white/80 px-7 py-3.5 rounded-xl hover:bg-zen-50 transition-colors font-medium text-base text-center"
                >
                  Voir comment ça marche
                </a>
              </div>

              <p className="text-xs text-gray-400">
                Sans engagement · Résiliable à tout moment · Accès immédiat
              </p>
            </div>

            {/* ── Colonne mockup ── */}
            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-zen-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-coral-100 rounded-full blur-2xl opacity-40 pointer-events-none" />

              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

                {/* En-tête */}
                <div className="bg-gradient-to-r from-zen-700 to-zen-600 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-zen-200 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">Rapport de diagnostic</p>
                      <p className="text-xs text-zen-300 mt-0.5">Analyse de : page d&apos;accueil</p>
                    </div>
                    <span className="ml-auto text-xs bg-zen-800/40 text-zen-200 px-2 py-0.5 rounded-full font-medium shrink-0">Sophrologue · Lyon</span>
                  </div>
                </div>

                <div className="p-5 space-y-5">

                  {/* ① Scores — niveau primaire */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zen-50 border border-zen-200 rounded-xl p-4">
                      <p className="text-3xl font-extrabold text-zen-700">74</p>
                      <p className="text-xs text-zen-600 font-semibold mt-0.5">Score visibilité</p>
                      <div className="mt-2.5 h-1.5 bg-zen-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zen-500 rounded-full" style={{ width: "74%" }} />
                      </div>
                    </div>
                    <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
                      <p className="text-3xl font-extrabold text-coral-500">42</p>
                      <p className="text-xs text-coral-500 font-semibold mt-0.5">Score conformité</p>
                      <div className="mt-2.5 h-1.5 bg-coral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-coral-400 rounded-full" style={{ width: "42%" }} />
                      </div>
                    </div>
                  </div>

                  {/* ② Formulations — niveau secondaire */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-zen-950/50 uppercase tracking-widest">Formulations à surveiller</p>
                    <div className="bg-red-50 rounded-lg px-3 py-2.5 border border-red-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-red-700 flex-1 min-w-0 truncate">« je traite »</span>
                        <span className="shrink-0 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase tracking-wide">Critique</span>
                      </div>
                      <p className="text-[11px] text-red-500 mt-1 font-medium">Assimilation à un acte médical</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-3 py-2.5 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-800 flex-1 min-w-0 truncate">« aide à réduire le stress »</span>
                        <span className="shrink-0 text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase tracking-wide">Vigilance</span>
                      </div>
                      <p className="text-[11px] text-amber-600 mt-1 font-medium">Promesse implicite de résultat</p>
                    </div>
                    <div className="bg-zen-50 rounded-lg px-3 py-2.5 border border-zen-200">
                      <p className="text-[10px] font-bold text-zen-600 mb-1.5">✦ Reformulation suggérée</p>
                      <p className="text-[11px] text-zen-700 italic leading-relaxed">
                        &quot;J&apos;accompagne les personnes confrontées au stress et aux tensions émotionnelles.&quot;
                      </p>
                    </div>
                  </div>

                  {/* ③ Points SEO — niveau tertiaire */}
                  <div className="space-y-1.5 border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold text-zen-950/50 uppercase tracking-widest mb-2">Points SEO détectés</p>
                    {[
                      { text: "Meta description absente", error: true },
                      { text: "Maillage interne faible", error: false },
                      { text: "3 images sans texte alternatif", error: true },
                    ].map((item) => (
                      <div key={item.text} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.error ? "bg-red-400" : "bg-amber-400"}`} />
                        {item.text}
                      </div>
                    ))}
                  </div>

                  {/* ④ Mentions — niveau bas, compact */}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                    <CheckCircle2 className="h-3 w-3 text-zen-500 shrink-0" />
                    <span className="text-xs text-gray-400">Mentions légales</span>
                    <CheckCircle2 className="h-3 w-3 text-zen-500 shrink-0" />
                    <span className="text-xs text-gray-400">HTTPS</span>
                    <XCircle className="h-3 w-3 text-coral-400 shrink-0" />
                    <span className="text-xs text-gray-400">Politique RGPD</span>
                  </div>

                </div>
              </div>

              {/* Annotation décorative */}
              <div
                className="absolute top-1/3 hidden xl:flex flex-col items-start gap-2 pointer-events-none"
                style={{ left: "calc(100% + 2rem)" }}
              >
                <p className="text-zen-400 text-[12px] italic leading-snug whitespace-nowrap">
                  Un rapport clair,<br />et actionnable
                </p>
                <svg width="44" height="40" viewBox="0 0 44 40" fill="none">
                  <path d="M 40 4 C 32 12, 16 26, 4 36" stroke="#84ab9b" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M 4 36 L 14 31 M 4 36 L 8 26" stroke="#84ab9b" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Fonctionnalités ────────────────────────────────────────────── */}
      <section id="fonctionnalites" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">

          {/* ── Titre ── */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-3">
              Trois fonctionnalités complémentaires,{" "}
              <br className="hidden sm:block" />
              un objectif :{" "}
              <span className="text-coral-500">publier sereinement</span>
            </h2>
          </div>

          {/* ── 3 cartes overview ── */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">

            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 bg-zen-50 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-zen-600" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-zen-950 text-sm">1. Vérifier un texte</h3>
                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Rapide</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Collez un texte (post, bio, description...) et obtenez instantanément une analyse des formulations à risque et des reformulations adaptées.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Bio Instagram", "Post LinkedIn", "Description Google", "Avis..."].map((tag) => (
                  <span key={tag} className="bg-gray-50 border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-zen-950 text-sm">2. Analyser un site</h3>
                <span className="text-[9px] font-bold bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Global</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Saisissez votre URL pour obtenir une vue d&apos;ensemble de votre visibilité et de votre cohérence éditoriale.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Site web", "Fiche Google", "Page de présentation"].map((tag) => (
                  <span key={tag} className="bg-gray-50 border border-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50/20 p-6 hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-zen-950 text-sm">3. Générer des contenus</h3>
                <span className="text-[9px] font-bold bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">Sur-mesure</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Créez des contenus adaptés à votre activité grâce à la bibliothèque de formulations validées et à l&apos;assistant de rédaction.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Posts", "Bios", "Pages", "Scripts", "Fiches..."].map((tag) => (
                  <span key={tag} className="bg-purple-50 border border-purple-200 text-purple-500 text-[10px] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* ── Diagnostics détaillés ── */}
          <div className="grid md:grid-cols-2 gap-6">

            <div className="rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-zen-950 mb-2">Diagnostic visibilité</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Analyse de la clarté, de la structure et de la lisibilité de votre site.
              </p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Structure et lisibilité des contenus",
                  "Cohérence des titres et des textes",
                  "Lisibilité et clarté du positionnement",
                  "Présence des éléments importants pour la visibilité",
                  "Cohérence sémantique globale",
                  "Compatibilité mobile et accessibilité",
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
              <h3 className="text-xl font-bold text-zen-950 mb-2">Diagnostic conformité</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Détection des formulations sensibles et des points de vigilance éditoriaux.
              </p>
              <ul className="space-y-2.5 text-sm text-gray-600">
                {[
                  "Formulations à risque détectées et expliquées",
                  "Confusion possible avec les professions de santé",
                  "Promesses pouvant être perçues comme trompeuses",
                  "Présence des mentions légales",
                  "Conformité RGPD et politique de confidentialité",
                  "Reformulations adaptées proposées",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-zen-50/30 to-white border-y border-zen-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-3">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              En quelques clics, passez de l&apos;incertitude à la publication sereine.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">

            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">01</div>
              <div className="w-10 h-10 bg-zen-50 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-5 w-5 text-zen-600" />
              </div>
              <h3 className="font-semibold text-zen-950 text-sm mb-2">Ajoutez un texte ou une URL</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Collez votre contenu ou saisissez votre adresse web.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Post", "Bio", "Page web", "Google..."].map((tag) => (
                  <span key={tag} className="bg-gray-50 border border-gray-200 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">02</div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-zen-950 text-sm mb-2">L&apos;outil analyse votre communication</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Détection des formulations sensibles et des points de visibilité.
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-[10px] text-gray-500">Formulation critique</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-[10px] text-gray-500">Vigilance requise</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-zen-500 shrink-0" />
                  <span className="text-[10px] text-gray-500">Conforme</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">03</div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-zen-950 text-sm mb-2">Recevez des explications claires</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Chaque point est expliqué sans jargon, avec une reformulation adaptée.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Vigilance</p>
                <p className="text-[10px] text-amber-600">«&nbsp;je soigne&nbsp;» → promesse implicite</p>
              </div>
            </div>

            <div className="rounded-2xl bg-purple-50/40 border border-purple-200 p-6 shadow-sm">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-4">04</div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="font-semibold text-zen-950 text-sm mb-2">Créez vos contenus sereinement</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                Utilisez l&apos;assistant de rédaction pour générer des contenus adaptés.
              </p>
              <div className="bg-white border border-purple-200 rounded-lg px-3 py-2">
                <p className="text-[10px] font-semibold text-purple-600 mb-0.5">Générateur</p>
                <p className="text-[10px] text-purple-500">Bio · Post · Page de présentation...</p>
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
              Visible & Conforme repère des formulations sensibles et zones de vigilance dans vos contenus.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: "Promesses pouvant poser problème",
                desc: "Certaines formulations peuvent être interprétées comme des promesses difficiles à vérifier ou trompeuses au regard du Code de la consommation.",
                color: "text-amber-600",
                bg: "bg-amber-50 border-amber-200",
              },
              {
                icon: Scale,
                title: "Confusion sur la qualification",
                desc: "Certaines formulations peuvent créer une confusion sur le cadre réel de votre activité ou votre statut professionnel.",
                color: "text-red-600",
                bg: "bg-red-50 border-red-200",
              },
              {
                icon: FileText,
                title: "Vocabulaire sensible",
                desc: "Certains termes issus du vocabulaire médical ou thérapeutique nécessitent une vigilance particulière dans une communication en ligne.",
                color: "text-orange-600",
                bg: "bg-orange-50 border-orange-200",
              },
              {
                icon: Search,
                title: "Positionnement peu clair",
                desc: "Des textes imprécis ou mal formulés peuvent nuire à la compréhension de votre activité et à votre visibilité en ligne.",
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

      {/* ─── Sans / Avec ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-zen-50/50 via-white to-zen-50/30 border-y border-zen-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-zen-950 mb-3">
              Un seul outil pour publier avec plus de sérénité
            </h2>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Pensé pour les professionnels qui veulent prendre soin de leur communication, sans expertise technique particulière.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Sans */}
            <div className="rounded-2xl bg-white border border-gray-200 p-8 md:p-10 shadow-sm">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-8">
                Sans Visible & Conforme
              </p>
              <ul className="space-y-5">
                {[
                  "Vérifier chaque formulation manuellement",
                  "Chercher des réponses contradictoires sur internet",
                  "Réécrire ses contenus plusieurs fois",
                  "Mélanger conseils SEO, IA et règles juridiques",
                  "Perdre du temps à douter avant de publier",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="mt-0.5 flex items-center justify-center w-[18px] h-[18px] rounded-full border border-gray-300 shrink-0">
                      <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                        <path d="M1 1l5 5M6 1L1 6" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span className="text-[13px] text-gray-700 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avec */}
            <div className="rounded-2xl bg-gradient-to-br from-zen-50 to-zen-100/80 border border-zen-200 p-8 md:p-10 shadow-sm">
              <p className="text-[11px] font-bold text-zen-600 uppercase tracking-[0.12em] mb-8">
                Avec Visible & Conforme
              </p>
              <ul className="space-y-5">
                {[
                  "Analyse visibilité + conformité",
                  "Alertes sur les formulations sensibles",
                  "Suggestions de reformulation adaptées",
                  "Générateur de contenus pensé pour votre activité",
                  "Un seul outil pour publier avec plus de clarté",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-zen-900 leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
          <p className="text-center mt-8 text-[13px] text-gray-500">
            <strong className="text-zen-950 font-semibold">19€/mois</strong> · Essai 7 jours pour 1€ · Résiliable à tout moment
          </p>
        </div>
      </section>

      {/* ─── Pour qui ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-zen-50/50 via-white to-zen-50/30 border-y border-zen-100">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-zen-950 mb-4">
            Fait pour vous si vous êtes…
          </h2>
          <p className="text-gray-500 mb-10">
            Visible & Conforme s&apos;adresse aux praticiens du bien-être non réglementés en France — liste non exhaustive
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Naturopathe", "Coach de vie", "Hypnothérapeute", "Réflexologue",
              "Énergéticien", "Praticien Reiki", "Sophrologue",
              "Nutritionniste (non diététicien)", "Coach sportif bien-être",
              "Praticien EFT", "Kinésiologue", "Praticien en méditation",
              "Thérapeute familial", "Aromathérapeute", "Masseur", "Ostéothérapeute",
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
              <p className="text-[11px] font-semibold text-zen-300 uppercase tracking-[0.12em] mb-3">
                Anne-Sophie Assalit · Fondatrice de Visible & Conforme
              </p>
              <h2 className="text-2xl font-bold text-white mb-5">
                Pourquoi Visible & Conforme ?
              </h2>
              <div className="space-y-4 text-zen-100 text-sm leading-relaxed">
                <p>
                  Je suis juriste de formation, diplômée en marketing digital et consultante en visibilité conforme.
                </p>
                <p>
                  J&apos;ai créé Visible & Conforme parce que beaucoup de praticiens du bien-être peinent
                  à trouver les bons mots en ligne : comment être visible sans se mettre en risque ?
                  Comment créer du contenu régulièrement quand on ne sait pas ce qu&apos;on peut — ou ne peut pas — écrire ?
                </p>
                <p>
                  L&apos;outil est né de cette question. Pensé à la croisée du SEO local, de la vigilance
                  éditoriale et de la création de contenus, il aide les professionnels du bien-être
                  à analyser leurs textes, corriger les formulations sensibles et générer des contenus
                  adaptés à leur activité.
                </p>
              </div>
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
            {/* Essai 7 jours à 1€ */}
            <div className="border-2 border-zen-700 rounded-2xl p-8 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zen-700 text-white text-xs px-3 py-1 rounded-full font-medium">
                Commencer ici
              </div>
              <h3 className="font-bold text-xl mb-1">Essai 7 jours</h3>
              <p className="text-gray-500 text-sm mb-4">Accès complet · Sans engagement</p>
              <div className="text-4xl font-bold mb-1">1 €</div>
              <p className="text-xs text-gray-400 mb-1">Pour 7 jours d&apos;accès complet</p>
              <p className="text-xs text-zen-600 font-medium mb-6">Puis 19€/mois · Résiliable avant renouvellement</p>
              <ul className="space-y-2.5 text-sm text-gray-600 mb-8">
                {[
                  "Accès immédiat à toutes les fonctionnalités",
                  "Vérification de texte avant publication",
                  "Analyse de site complète",
                  "Assistant de rédaction inclus",
                  "Bibliothèque de formulations validées",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-zen-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className="block text-center bg-zen-700 text-white py-3 rounded-xl hover:bg-zen-800 transition-colors font-semibold"
              >
                Démarrer pour 1€
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
                  "Analyses de site illimitées",
                  "Vérifications de texte illimitées",
                  "Contenus rédigés adaptés à votre activité",
                  "LinkedIn, Instagram, TikTok, page de présentation…",
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
                Démarrer pour 1€
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
                a: "Visible & Conforme vous aide à vérifier vos contenus avant publication, analyser globalement votre communication en ligne, et créer des textes mieux adaptés à votre activité. L'outil repère les formulations sensibles, explique les points de vigilance dans un langage clair, propose des reformulations adaptées à votre secteur, et vous accompagne dans la rédaction de vos contenus professionnels.",
              },
              {
                q: "Est-ce un outil juridique ?",
                a: "Non. Visible & Conforme ne remplace pas un avocat et ne constitue pas un conseil juridique personnalisé. L'outil propose une analyse automatisée orientée vigilance éditoriale et prévention du risque dans les contenus publiés en ligne.",
              },
              {
                q: "Quels contenus puis-je vérifier ?",
                a: "Vous pouvez vérifier votre site internet, une page de présentation, une bio Instagram, une fiche Google Business Profile, un post LinkedIn ou Instagram, une page de vente, une newsletter, ou tout autre contenu destiné à être publié.",
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
                a: "Visible & Conforme propose un essai de 7 jours pour 1€, avec accès complet à toutes les fonctionnalités. À l'issue de l'essai, l'abonnement passe à 19€/mois. Vous pouvez résilier à tout moment avant le renouvellement.",
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
            7 jours pour 1€, accès complet, résiliable à tout moment.
            Découvrez en 2 minutes les zones de risque de votre site.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center gap-2 bg-white text-coral-700 px-8 py-4 rounded-xl hover:bg-coral-50 transition-colors font-bold text-lg"
          >
            Démarrer pour 1€
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-coral-200 text-sm mt-5">
            Puis 19€/mois · Sans engagement
          </p>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-zen-700" />
            <span className="font-bold text-zen-950">Visible & Conforme</span>
          </div>
          <p className="text-sm text-gray-400 text-center">
            © 2026 Visible & Conforme · Ne constitue pas une consultation juridique.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/mentions-legales" className="hover:text-gray-900 transition-colors">
              Mentions légales
            </Link>
            <Link href="/cgv" className="hover:text-gray-900 transition-colors">
              CGV
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
