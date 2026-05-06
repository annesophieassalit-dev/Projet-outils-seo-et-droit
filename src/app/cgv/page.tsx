import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: "Conditions générales de vente et d'utilisation de Visible & Conforme.",
};

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-zen-700" />
            <span className="font-bold text-zen-950">Visible & Conforme</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-2xl font-bold text-zen-950 mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-gray-400 mb-12">Dernière mise à jour : mai 2026</p>

        <div className="space-y-10 text-sm text-gray-600 leading-relaxed">

          {/* Préambule */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Préambule</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre
              Anne-Sophie Assalit, éditrice de Visible & Conforme (ci-après &quot;le Service&quot;), SIRET 852 586 791 00018,
              et toute personne souscrivant à un abonnement (ci-après &quot;l&apos;Utilisateur&quot;).
            </p>
            <p className="mt-2">
              Toute souscription implique l&apos;acceptation pleine et entière des présentes CGV.
            </p>
          </section>

          {/* Art. 1 */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 1 — Objet</h2>
            <p>
              Visible & Conforme est un outil d&apos;analyse éditoriale en ligne permettant aux professionnels du bien-être
              de détecter certaines formulations pouvant présenter un risque juridique dans leur communication,
              et d&apos;améliorer leur visibilité en ligne.
            </p>
            <p className="mt-2 font-medium text-zen-950">
              Visible & Conforme ne constitue pas une consultation juridique et ne remplace pas l&apos;avis d&apos;un professionnel du droit.
            </p>
          </section>

          {/* Art. 2 — Essai */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 2 — Essai payant 7 jours à 1€</h2>
            <div className="bg-zen-50 border border-zen-200 rounded-xl p-5 space-y-3">
              <p>
                Visible & Conforme propose un accès d&apos;essai de <strong>7 jours au tarif de 1€ TTC</strong>,
                donnant accès à l&apos;intégralité des fonctionnalités du Service.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Le paiement de 1€ est prélevé <strong>immédiatement</strong> à la souscription.</li>
                <li>Un moyen de paiement valide est requis pour accéder à l&apos;essai.</li>
                <li>L&apos;essai commence dès la validation du paiement.</li>
                <li>À l&apos;issue des 7 jours, l&apos;abonnement mensuel à 19€ TTC/mois est automatiquement activé,
                  sauf résiliation préalable de l&apos;Utilisateur.</li>
              </ul>
              <p className="text-zen-700 font-medium">
                Le 1€ versé au titre de l&apos;essai ne sera pas remboursé en cas de résiliation dans le délai d&apos;essai,
                sauf exercice du droit de rétractation dans les conditions prévues à l&apos;article 8.
              </p>
            </div>
          </section>

          {/* Art. 3 — Abonnement */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 3 — Abonnement mensuel</h2>
            <p>
              À l&apos;issue de la période d&apos;essai, l&apos;abonnement mensuel Pro est facturé au tarif de{" "}
              <strong>19€ TTC par mois</strong>, par prélèvement automatique sur le moyen de paiement enregistré.
            </p>
            <p className="mt-2">
              L&apos;abonnement est reconduit tacitement chaque mois, à la date anniversaire de la première facturation,
              jusqu&apos;à résiliation par l&apos;Utilisateur.
            </p>
          </section>

          {/* Art. 4 — Email avant renouvellement */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 4 — Rappel avant renouvellement</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <p>
                Visible & Conforme s&apos;engage à envoyer un <strong>email de rappel au moins 3 jours avant</strong> :
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>la fin de la période d&apos;essai de 7 jours (et donc avant le premier prélèvement mensuel de 19€),</li>
                <li>chaque renouvellement mensuel ultérieur.</li>
              </ul>
              <p className="mt-3 text-amber-800 font-medium">
                Cet email constitue un rappel informatif. L&apos;absence de réponse vaut acceptation du renouvellement.
                Pour résilier, l&apos;Utilisateur doit agir avant la date de prélèvement.
              </p>
            </div>
          </section>

          {/* Art. 5 — Résiliation */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 5 — Résiliation</h2>
            <p>
              L&apos;Utilisateur peut résilier son abonnement à tout moment, sans frais ni pénalité, via :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>son espace client Stripe (accessible depuis la section &quot;Abonnement&quot; de l&apos;application),</li>
              <li>ou en contactant le support à{" "}
                <a href="mailto:contact@visibleetconforme.fr" className="text-zen-700 hover:underline">
                  contact@visibleetconforme.fr
                </a>.
              </li>
            </ul>
            <p className="mt-3">
              La résiliation prend effet à la fin de la période en cours. L&apos;accès au Service est maintenu jusqu&apos;à
              cette date. Aucun remboursement au prorata n&apos;est effectué pour la période écoulée.
            </p>
          </section>

          {/* Art. 6 — Paiement */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 6 — Modalités de paiement</h2>
            <p>
              Les paiements sont traités de manière sécurisée par{" "}
              <strong>Stripe</strong> (Stripe, Inc. — 185 Berry Street, Suite 550, San Francisco, CA 94107, États-Unis).
              Les données bancaires de l&apos;Utilisateur ne sont pas stockées par Visible & Conforme.
            </p>
            <p className="mt-2">
              En cas d&apos;échec de paiement lors du renouvellement, l&apos;accès au Service peut être suspendu après
              notification à l&apos;Utilisateur.
            </p>
          </section>

          {/* Art. 7 — Droit de rétractation */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 7 — Droit de rétractation</h2>
            <p>
              Conformément aux articles L. 221-18 et suivants du Code de la consommation, l&apos;Utilisateur
              dispose d&apos;un droit de rétractation de <strong>14 jours</strong> à compter de la souscription.
            </p>
            <p className="mt-2">
              Toutefois, en souscrivant à l&apos;essai payant et en accédant immédiatement au Service,
              l&apos;Utilisateur reconnaît expressément que l&apos;exécution du contrat commence avant l&apos;expiration
              du délai de rétractation, conformément à l&apos;article L. 221-28 du Code de la consommation.
              Dans ce cas, le droit de rétractation ne peut être exercé que pour la part non fournie du service.
            </p>
            <p className="mt-2">
              Pour exercer ce droit dans le délai légal, contactez :{" "}
              <a href="mailto:contact@visibleetconforme.fr" className="text-zen-700 hover:underline">
                contact@visibleetconforme.fr
              </a>.
            </p>
          </section>

          {/* Art. 8 — Responsabilité */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 8 — Limitation de responsabilité</h2>
            <p>
              Les analyses fournies par Visible & Conforme sont générées automatiquement à titre indicatif.
              Elles ne constituent pas un avis juridique personnalisé et ne sauraient engager la responsabilité
              d&apos;Anne-Sophie Assalit en cas de décision prise sur leur base.
            </p>
            <p className="mt-2">
              Pour toute situation nécessitant une analyse juridique approfondie, l&apos;Utilisateur est invité
              à consulter un professionnel du droit qualifié.
            </p>
          </section>

          {/* Art. 9 — Données personnelles */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 9 — Données personnelles</h2>
            <p>
              Les données collectées (adresse e-mail, contenus analysés, données de paiement traitées par Stripe)
              sont utilisées exclusivement pour le fonctionnement du Service.
              Elles ne sont pas revendues à des tiers.
            </p>
            <p className="mt-2">
              Conformément au RGPD, l&apos;Utilisateur dispose d&apos;un droit d&apos;accès, de rectification
              et de suppression de ses données.{" "}
              <Link href="/confidentialite" className="text-zen-700 hover:underline">
                Consulter la politique de confidentialité →
              </Link>
            </p>
          </section>

          {/* Art. 10 — Modification */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 10 — Modification des CGV</h2>
            <p>
              Visible & Conforme se réserve le droit de modifier les présentes CGV.
              Les Utilisateurs abonnés seront informés par email au moins 30 jours avant l&apos;entrée en vigueur
              de toute modification substantielle. La poursuite de l&apos;utilisation du Service vaut acceptation
              des nouvelles conditions.
            </p>
          </section>

          {/* Art. 11 — Loi applicable */}
          <section>
            <h2 className="text-base font-semibold text-zen-950 mb-3">Article 11 — Loi applicable et juridiction</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les parties s&apos;efforceront
              de trouver une solution amiable. À défaut, les tribunaux français seront compétents.
            </p>
            <p className="mt-2">
              Pour tout litige de consommation, l&apos;Utilisateur peut recourir gratuitement à la médiation via
              la plateforme européenne de règlement en ligne des litiges :{" "}
              <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-zen-700 hover:underline">
                ec.europa.eu/consumers/odr
              </a>.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-zen-50 border border-zen-100 rounded-xl p-5">
            <h2 className="text-base font-semibold text-zen-950 mb-2">Contact</h2>
            <p>Anne-Sophie Assalit — Antibes (06)</p>
            <p>SIRET : 852 586 791 00018</p>
            <p className="mt-1">
              <a href="mailto:contact@visibleetconforme.fr" className="text-zen-700 hover:underline">
                contact@visibleetconforme.fr
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-gray-100 py-8 mt-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-400">
          <span>© 2026 Visible & Conforme</span>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-gray-700 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-gray-700 transition-colors">Confidentialité</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
