import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de Visible & Conforme — outil d'analyse éditoriale pour praticiens du bien-être.",
};

export default function MentionsLegalesPage() {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentions légales</h1>
        <p className="text-sm text-gray-400 mb-12">Dernière mise à jour : mars 2025</p>

        {/* Description de l'outil */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Nature et objet de l&apos;outil</h2>
          <div className="prose prose-sm text-gray-600 space-y-3">
            <p>
              Visible & Conforme analyse vos contenus (site, fiche Google, posts) pour repérer certaines formulations
              pouvant créer une ambiguïté sur votre rôle, votre qualification ou la nature de votre accompagnement.
            </p>
            <p>
              L&apos;outil propose des pistes d&apos;ajustement pour améliorer la clarté éditoriale et réduire
              certains risques juridiques liés à la communication.
            </p>
            <p className="font-medium text-gray-700">
              Visible & Conforme ne remplace pas un conseil juridique personnalisé.
            </p>
          </div>
        </section>

        {/* Éditeur */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Éditeur du service</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Visible & Conforme est édité par :</p>
            <p className="font-medium text-gray-800">Anne-Sophie Assalit</p>
            <p>Antibes (06)</p>
            <p>SIREN : 852 586 791</p>
            <p>Contact : <a href="mailto:contact@visibleetconforme.fr" className="text-zen-700 hover:underline">contact@visibleetconforme.fr</a></p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Hébergement</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Le service est hébergé par :</p>
            <p className="font-medium text-gray-800">Vercel Inc.</p>
            <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
          </div>
        </section>

        {/* Limitation de responsabilité */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Limitation de responsabilité</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Les analyses produites par Visible & Conforme sont générées automatiquement à partir de règles éditoriales
              générales. Elles sont fournies à titre indicatif et ne constituent pas une consultation juridique,
              un avis juridique personnalisé, ni une garantie d&apos;absence de risque.
            </p>
            <p>
              Visible & Conforme ne saurait être tenu responsable des décisions prises sur la base des analyses fournies.
              Pour toute situation nécessitant une analyse juridique approfondie, nous recommandons de consulter
              un professionnel du droit qualifié.
            </p>
          </div>
        </section>

        {/* Données personnelles */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Données personnelles</h2>
          <div className="text-sm text-gray-600 space-y-3">
            <p>
              Les données collectées (adresse e-mail, contenus analysés) sont utilisées exclusivement
              pour le fonctionnement du service et ne sont pas revendues à des tiers.
            </p>
            <p>
              Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de
              suppression de vos données. Pour exercer ces droits :{" "}
              <a href="mailto:contact@visibleetconforme.fr" className="text-zen-700 hover:underline">
                contact@visibleetconforme.fr
              </a>
            </p>
            <p>
              <Link href="/confidentialite" className="text-zen-700 hover:underline">
                Consulter la politique de confidentialité complète →
              </Link>
            </p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Propriété intellectuelle</h2>
          <p className="text-sm text-gray-600">
            L&apos;ensemble des éléments composant Visible & Conforme (interface, règles, contenus, marque) est protégé
            par le droit de la propriété intellectuelle. Toute reproduction ou utilisation sans autorisation
            est interdite.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-sm text-gray-400">
          © 2025 Visible & Conforme · Visible & Conforme ne constitue pas un avis juridique.
        </div>
      </footer>
    </div>
  );
}
