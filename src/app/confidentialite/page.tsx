import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: "Politique de confidentialité de Visible & Conforme — comment vos données sont collectées et protégées.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-zen-700" />
            <span className="font-bold text-gray-900">Visible & Conforme</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-400 mb-12">Dernière mise à jour : mai 2025</p>

        {/* Responsable */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Responsable du traitement</h2>
          <p className="text-sm text-gray-600">
            Le responsable du traitement des données collectées via Visible & Conforme est l&apos;éditeur du service,
            joignable à l&apos;adresse :{" "}
            <a href="mailto:annesophieassalit@gmail.com" className="text-zen-700 hover:underline">
              annesophieassalit@gmail.com
            </a>
          </p>
        </section>

        {/* Données collectées */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Données collectées</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>Dans le cadre de l&apos;utilisation du service, les données suivantes peuvent être collectées :</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-gray-700">Données de compte :</strong> adresse e-mail, nom (facultatif), profession</li>
              <li><strong className="text-gray-700">Données d&apos;utilisation :</strong> textes soumis à l&apos;analyse, contenus générés, nombre de diagnostics réalisés</li>
              <li><strong className="text-gray-700">Données de paiement :</strong> traitées directement par Stripe — Visible & Conforme ne stocke aucune information bancaire</li>
              <li><strong className="text-gray-700">Données techniques :</strong> adresse IP, navigateur, horodatage des connexions (logs serveur standards)</li>
            </ul>
          </div>
        </section>

        {/* Finalités */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Finalités du traitement</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Fournir et améliorer les fonctionnalités du service (analyse, génération, bibliothèque)</li>
              <li>Gérer votre compte et votre abonnement</li>
              <li>Vous envoyer des informations relatives à votre compte (confirmation, facturation)</li>
              <li>Assurer la sécurité et prévenir les abus</li>
            </ul>
            <p className="mt-3">
              Aucune donnée n&apos;est revendue à des tiers ni utilisée à des fins publicitaires.
            </p>
          </div>
        </section>

        {/* Durée de conservation */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Durée de conservation</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li>Données de compte : conservées pendant toute la durée du compte, puis supprimées dans un délai de 30 jours après résiliation</li>
              <li>Contenus analysés et générés : conservés le temps de votre abonnement actif</li>
              <li>Données de facturation : 10 ans, conformément aux obligations légales comptables</li>
            </ul>
          </div>
        </section>

        {/* Sous-traitants */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Sous-traitants et hébergement</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Pour assurer le fonctionnement du Service, Visible & Conforme fait appel à des prestataires techniques
              tiers agissant en qualité de sous-traitants :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>
                <strong className="text-gray-700">Hébergement et infrastructure</strong> —
                prestataires dont les serveurs sont situés en Europe ou aux États-Unis,
                dans le cadre de Clauses Contractuelles Types approuvées par la Commission européenne.
              </li>
              <li>
                <strong className="text-gray-700">Base de données et authentification</strong> —
                infrastructure hébergée en Europe.
              </li>
              <li>
                <strong className="text-gray-700">Traitement des paiements</strong> —
                établissement financier européen agréé, certifié PCI-DSS. Aucune donnée bancaire
                n&apos;est stockée par Visible & Conforme.
              </li>
              <li>
                <strong className="text-gray-700">Génération de contenus par intelligence artificielle</strong> —
                les textes soumis au générateur sont transmis à un prestataire tiers aux fins de production
                des suggestions. Ces données transitent vers des serveurs situés hors de l&apos;Union européenne,
                dans le cadre de Clauses Contractuelles Types.
              </li>
            </ul>
            <p>
              Chaque prestataire est lié par un accord de traitement des données (DPA) garantissant
              la confidentialité et la sécurité des informations traitées, conformément au RGPD.
            </p>
          </div>
        </section>

        {/* Droits */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vos droits</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2">
              <li><strong className="text-gray-700">Droit d&apos;accès</strong> — obtenir une copie de vos données</li>
              <li><strong className="text-gray-700">Droit de rectification</strong> — corriger des données inexactes</li>
              <li><strong className="text-gray-700">Droit à l&apos;effacement</strong> — demander la suppression de votre compte et de vos données</li>
              <li><strong className="text-gray-700">Droit à la portabilité</strong> — recevoir vos données dans un format lisible</li>
              <li><strong className="text-gray-700">Droit d&apos;opposition</strong> — vous opposer à certains traitements</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à :{" "}
              <a href="mailto:annesophieassalit@gmail.com" className="text-zen-700 hover:underline">
                annesophieassalit@gmail.com
              </a>
            </p>
            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès
              de la{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zen-700 hover:underline"
              >
                CNIL
              </a>.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cookies</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              Visible & Conforme utilise uniquement des cookies strictement nécessaires au fonctionnement
              du service (session d&apos;authentification). Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact</h2>
          <p className="text-sm text-gray-600">
            Pour toute question relative à la présente politique :{" "}
            <a href="mailto:annesophieassalit@gmail.com" className="text-zen-700 hover:underline">
              annesophieassalit@gmail.com
            </a>
          </p>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © 2025 Visible & Conforme ·{" "}
          <Link href="/mentions-legales" className="hover:text-gray-600 transition-colors">
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
