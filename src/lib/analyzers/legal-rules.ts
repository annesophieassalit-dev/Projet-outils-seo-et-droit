/**
 * Règles juridiques pour les professionnels du bien-être non réglementés
 * Référence : Code de la santé publique, Code de la consommation,
 * Directive 2005/29/CE pratiques commerciales déloyales
 */

import type { LegalRuleCategory, Severity } from "@/types/audit";

export interface LegalRule {
  id: string;
  category: LegalRuleCategory;
  severity: Severity;
  pattern: RegExp;
  term: string; // version lisible du pattern
  recommendation: string;
  legalReference?: string;
  falsePositiveCheck?: (context: string) => boolean; // retourne true si c'est un faux positif
}

// ─── Exercice illégal de la médecine ─────────────────────────────────────────
// Art. L4161-1 du Code de la santé publique : pose de diagnostic, traitement, prescription

export const EXERCICE_ILLEGAL_RULES: LegalRule[] = [
  {
    id: "EI-001",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(je\s+)?soigne(rai[st]?|z)?\b/gi,
    term: "soigner / je soigne",
    recommendation:
      "Remplacez par « j'accompagne », « je soutiens », « j'aide à prendre soin de ». L'acte de soigner est réservé aux professionnels de santé réglementés.",
    legalReference: "Art. L4161-1 CSP — exercice illégal de la médecine",
  },
  {
    id: "EI-002",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(je\s+)?(traite[sz]?|traitement\s+de\b)/gi,
    term: "traiter / traitement de",
    recommendation:
      'Utilisez "accompagnement de", "soutien naturel pour", "approche holistique de". Évitez d\'associer votre pratique au "traitement" de maladies.',
    legalReference: "Art. L4161-1 CSP",
    falsePositiveCheck: (ctx) =>
      /traitement\s+des\s+(données|informations|textes|fichiers)/i.test(ctx),
  },
  {
    id: "EI-003",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(guéri[rt]?|guérison\s+de\b)/gi,
    term: "guérir / guérison de",
    recommendation:
      "Remplacez par « amélioration du bien-être », « soutien de l'équilibre naturel ». Promettre une guérison est une allégation médicale illégale pour un non-médecin.",
    legalReference: "Art. L4161-1 CSP + Art. L121-1 Code de la consommation",
  },
  {
    id: "EI-004",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(diagnostiqu[a-z]+|pose\s+un\s+diagnostic)\b/gi,
    term: "diagnostiquer / poser un diagnostic",
    recommendation:
      "Le diagnostic médical est réservé aux médecins. Utilisez « identifier des déséquilibres », « évaluer votre vitalité » ou supprimez la formulation.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "EI-005",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(prescri[a-z]+|ordonnance)\b/gi,
    term: "prescrire / ordonnance",
    recommendation:
      "La prescription médicamenteuse est réservée aux médecins. Utilisez « je recommande », « je conseille ».",
    legalReference: "Art. L4211-1 CSP",
  },
  {
    id: "EI-006",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(thérapie|thérapeutique|protocole\s+de\s+soin)\b/gi,
    term: "thérapie / thérapeutique",
    recommendation:
      "Ces termes ont une connotation médicale. Préférez « séance », « accompagnement », « approche », « technique de bien-être ».",
    legalReference: "Recommandation DGCCRF 2021",
    falsePositiveCheck: (ctx) =>
      /(psycho|art|musico|sono|drama|géno)-?thérapie/i.test(ctx),
  },
  {
    id: "EI-007",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\bguérit\s+(le|la|les|du|de\s+la)\s+\w+/gi,
    term: "guérit [maladie]",
    recommendation:
      "Toute affirmation de guérison d'une maladie constitue une allégation médicale illégale et une pratique commerciale trompeuse.",
    legalReference: "Art. L121-1 Code de la consommation",
  },
  {
    id: "EI-008",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(soulage|élimine?)\s+(la\s+|le\s+|les\s+|du\s+)?(douleur|dépression|anxiété|stress chronique|migraine|fibromyalgie|cancer|tumeur|diabète)/gi,
    term: "soulage/élimine [maladie]",
    recommendation:
      "Associer votre pratique à la disparition de pathologies médicales reconnues est une allégation mensongère. Restez sur le domaine du bien-être général.",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  // ── Verbes médicaux manquants du Kit Visible & Conforme™ ──────────────────
  {
    id: "EI-009",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(soulage[rz]?|soulagement)\b/gi,
    term: "soulager / soulagement",
    recommendation:
      "« Soulager » implique un effet médical. Préférez « apporter un mieux-être », « favoriser la détente », « aider à traverser ».",
    legalReference: "Art. L4161-1 CSP",
    falsePositiveCheck: (ctx) =>
      /soulagement\s+(émotionnel|intérieur|psychologique)/i.test(ctx),
  },
  {
    id: "EI-010",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(préven[a-z]+|prévention)\s+(de\s+la\s+|du\s+|des\s+)?(maladie|cancer|diabète|dépression|burn.?out|obésité|hypertension|rechute)/gi,
    term: "prévenir [maladie]",
    recommendation:
      "La prévention médicale est du ressort des professionnels de santé. Utilisez « prendre soin de soi », « développer ses ressources naturelles ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "EI-011",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(réédu[a-z]+|rééducation)\b/gi,
    term: "rééduquer / rééducation",
    recommendation:
      "La rééducation est un acte paramédical réglementé (kinésithérapeute, orthophoniste...). Utilisez « retrouver », « réapprendre à », « développer ».",
    legalReference: "Art. L4321-1 CSP — acte de kinésithérapie",
  },
  {
    id: "EI-012",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(rétabli[a-z]*|rétablissement)\b/gi,
    term: "rétablir / rétablissement",
    recommendation:
      "« Rétablir » suggère un retour à la santé après maladie. Préférez « retrouver son équilibre », « restaurer sa vitalité ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "EI-013",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(élimine[rz]?|élimination)\b/gi,
    term: "éliminer / élimination",
    recommendation:
      "Dans un contexte bien-être, « éliminer » peut être perçu comme une allégation médicale. Préférez « libérer », « lâcher prise sur », « alléger ».",
    legalReference: "Art. L121-1 Code de la consommation",
  },
  {
    id: "EI-014",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(vaincre?|vaincre\s+(le|la|les|votre|son))/gi,
    term: "vaincre [problème de santé]",
    recommendation:
      "« Vaincre » implique un résultat garanti. Préférez « traverser », « dépasser », « apprendre à vivre avec ».",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "EI-015",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(combattre?|combattre\s+(le|la|les|votre|son))/gi,
    term: "combattre [problème de santé]",
    recommendation:
      "« Combattre » suggère une action thérapeutique. Préférez « traverser », « accompagner », « faire face à ».",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "EI-016",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(répar[a-z]+|corriger?\s+(le|la|les|votre|son)|remédi[a-z]+)\b/gi,
    term: "réparer / corriger / remédier à",
    recommendation:
      "Ces termes impliquent une action corrective médicale. Préférez « rééquilibrer », « harmoniser », « accompagner vers ».",
    legalReference: "Art. L4161-1 CSP",
    falsePositiveCheck: (ctx) =>
      /(corriger|réparer)\s+(un\s+)?(texte|document|erreur|faute)/i.test(ctx),
  },
];

// ─── Confusion professionnelle ────────────────────────────────────────────────

export const CONFUSION_RULES: LegalRule[] = [
  {
    id: "CP-001",
    category: "confusion_professionnelle",
    severity: "error",
    pattern: /\bdr\.?\s+[A-Z]/g,
    term: "Dr. [Nom]",
    recommendation:
      'L\'usage du titre "Dr." est réservé aux docteurs en médecine, pharmacie, chirurgie dentaire. Supprimez ou indiquez votre titre exact.',
    legalReference: "Art. 433-17 Code pénal — usurpation de titre",
  },
  {
    id: "CP-002",
    category: "confusion_professionnelle",
    severity: "error",
    pattern: /\b(docteur|médecin\s+naturel|médecin\s+holistique)\b/gi,
    term: "docteur / médecin naturel",
    recommendation:
      "Ces titres sont protégés. Si vous n'êtes pas médecin, vous ne pouvez pas utiliser ces termes pour vous désigner.",
    legalReference: "Art. L4131-1 CSP + Art. 433-17 Code pénal",
  },
  {
    id: "CP-003",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(clinique|cabinet\s+médical|centre\s+médical|hôpital)\b/gi,
    term: "clinique / cabinet médical",
    recommendation:
      "Ces termes évoquent une structure médicale réglementée. Utilisez « cabinet de bien-être », « espace de ressourcement », « centre holistique ».",
    legalReference: "Art. L6122-1 CSP",
    falsePositiveCheck: (ctx) =>
      /clinique\s+(vétérinaire|dentaire)/i.test(ctx),
  },
  {
    id: "CP-004",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(patient[s]?)\b/gi,
    term: "patient(s)",
    recommendation:
      'Le terme "patient" appartient au vocabulaire médical. Utilisez "client", "personne accompagnée", "bénéficiaire" ou "praticant".',
    legalReference: "Recommandation DGCCRF — clarté de l'offre de services",
  },
  {
    id: "CP-005",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(infirmier|zen-femme|kinésithérapeute|psychologue\s+clinicien)\b/gi,
    term: "professions paramédicales réglementées",
    recommendation:
      "Ces titres sont strictement protégés. Si vous exercez une pratique similaire non réglementée, précisez votre titre exact et ajoutez un avertissement clair.",
    legalReference: "Art. L4311-1 et suivants CSP",
  },
  // ── Titres protégés manquants du Kit Visible & Conforme™ ─────────────────
  {
    id: "CP-006",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(spécialiste)\s+(en|de|du|des)\s+\w+/gi,
    term: "spécialiste en [domaine]",
    recommendation:
      "« Spécialiste » associé à un domaine de santé crée une confusion avec un titre médical. Préférez « praticienne spécialisée dans l'accompagnement de... ».",
    legalReference: "Art. 433-17 Code pénal — usurpation de titre",
  },
  {
    id: "CP-007",
    category: "confusion_professionnelle",
    severity: "error",
    pattern: /\b(psychothérapeute)\b/gi,
    term: "psychothérapeute",
    recommendation:
      "Le titre de psychothérapeute est réglementé depuis 2010 (décret n°2010-534). Sans enregistrement ARS, son usage est une infraction. Indiquez votre titre exact.",
    legalReference: "Art. 52 Loi 2004-806 + Décret 2010-534",
  },
  {
    id: "CP-008",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\bthérapeute\b(?!\s+(de|en\s+danse|familiale?|de\s+couple))/gi,
    term: "thérapeute (seul, sans précision)",
    recommendation:
      "« Thérapeute » seul est ambigu et peut être confondu avec un professionnel de santé. Précisez toujours : « praticienne bien-être », « accompagnatrice en naturopathie »...",
    legalReference: "Recommandation DGCCRF 2021",
  },
  {
    id: "CP-008b",
    category: "confusion_professionnelle",
    severity: "error",
    pattern: /\bpsy\b/gi,
    term: "psy (abréviation)",
    falsePositiveCheck: (ctx) =>
      /psychomotricien|psychopraticien|psychopédagog/i.test(ctx),
    recommendation:
      "« Psy » est une abréviation courante de psychologue et psychothérapeute, deux titres réglementés (ADELI/ARS). Son usage sans être titulaire de l'un de ces titres peut créer une confusion avec un professionnel de santé réglementé. Précisez votre titre exact : praticien bien-être, accompagnateur, coach...",
    legalReference: "Art. 44 Loi 85-772 (psychologue) + Art. 52 Loi 2004-806 (psychothérapeute)",
  },
  {
    id: "CP-009",
    category: "confusion_professionnelle",
    severity: "error",
    pattern: /\b(expert\s+médical|professionnel\s+de\s+santé|clinicien)\b/gi,
    term: "expert médical / professionnel de santé / clinicien",
    recommendation:
      "Ces titres désignent des professionnels de santé réglementés. Leur usage par un praticien bien-être non réglementé constitue une usurpation de titre.",
    legalReference: "Art. 433-17 Code pénal",
  },
  // ── Termes médicaux zona grise — Kit Cat. 5 ───────────────────────────────
  {
    id: "CP-010",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(consultation)\b/gi,
    term: "consultation",
    recommendation:
      "« Consultation » est fortement associé au vocabulaire médical. Préférez « séance », « rendez-vous », « entretien », « accompagnement ».",
    legalReference: "Recommandation DGCCRF — clarté de l'offre",
    falsePositiveCheck: (ctx) =>
      /consultation\s+(gratuite|en\s+ligne|découverte|offerte)/i.test(ctx),
  },
  {
    id: "CP-011",
    category: "confusion_professionnelle",
    severity: "warning",
    pattern: /\b(symptôme[s]?|pathologie[s]?|maladie[s]?)\b/gi,
    term: "symptôme / pathologie / maladie",
    recommendation:
      "Ces termes appartiennent au vocabulaire médical. Si vous devez les utiliser, cadrez toujours : « personnes traversant... », « situations de... ». Évitez de prétendre agir sur ces conditions.",
    legalReference: "Art. L4161-1 CSP",
  },
];

// ─── Mentions obligatoires ────────────────────────────────────────────────────

export const MENTIONS_RULES: LegalRule[] = [
  {
    id: "MO-001",
    category: "mentions_obligatoires",
    severity: "error",
    pattern: /mentions?\s+légales?/gi,
    term: "mentions légales (à vérifier présence)",
    recommendation:
      "Toute personne exerçant une activité professionnelle en ligne doit publier ses mentions légales (Art. 6 LCEN) : nom, prénom ou dénomination sociale, adresse, numéro SIRET, email de contact.",
    legalReference: "Art. 6 Loi pour la Confiance en l'Économie Numérique (LCEN)",
  },
  {
    id: "MO-002",
    category: "mentions_obligatoires",
    severity: "error",
    pattern: /politique\s+de\s+confidentialité|données\s+personnelles|RGPD|vie\s+privée/gi,
    term: "politique de confidentialité (à vérifier présence)",
    recommendation:
      "Toute collecte de données personnelles (formulaire de contact, newsletter, analytics) nécessite une politique de confidentialité conforme au RGPD.",
    legalReference: "RGPD Art. 13 + Art. L33-4-1 Code des postes",
  },
];

// ─── Pathologies médicales — zones de vigilance (Kit Cat. 3) ─────────────────
// Mentionner ces pathologies n'est pas interdit mais nécessite un cadrage strict

export const PATHOLOGIES_RULES: LegalRule[] = [
  {
    id: "PA-001",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(dépression|dépressif|dépressive|dépressivité)\b/gi,
    term: "dépression",
    recommendation:
      "Vous pouvez évoquer ce vécu, mais jamais prétendre le traiter. Formulez : « personnes traversant une période difficile », « moment de baisse d'énergie ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-002",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(burn.?out|épuisement\s+professionnel)\b/gi,
    term: "burn-out",
    recommendation:
      "Utilisez : « personnes en situation d'épuisement », « période de surmenage ». N'affirmez jamais traiter ou guérir un burn-out.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-003",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(anxiété|anxieux|anxieuse|crise\s+d'anxiété)\b/gi,
    term: "anxiété",
    recommendation:
      "Préférez : « tension intérieure », « période d'inquiétude », « agitation mentale ». Cadrez toujours avec « personnes qui traversent... ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-004",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(insomnie[s]?|trouble[s]?\s+du\s+sommeil)\b/gi,
    term: "insomnie / troubles du sommeil",
    recommendation:
      "Utilisez : « personnes rencontrant des difficultés de sommeil », « nuits difficiles ». Ne prétendez jamais traiter l'insomnie.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-005",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(diabète|diabétique)\b/gi,
    term: "diabète",
    recommendation:
      "Le diabète est une pathologie médicale grave. Votre pratique ne peut en aucun cas prétendre agir dessus. Retirez toute référence directe.",
    legalReference: "Art. L4161-1 CSP + Art. L121-1 Code de la consommation",
  },
  {
    id: "PA-006",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(cancer[s]?|oncologie|tumeur[s]?|chimiothérapie)\b/gi,
    term: "cancer / tumeur",
    recommendation:
      "Toute référence à la prise en charge du cancer par une pratique non médicale est extrêmement risquée juridiquement. Retirez cette mention.",
    legalReference: "Art. L4161-1 CSP + Art. L121-1 Code de la consommation",
  },
  {
    id: "PA-007",
    category: "exercice_illegal",
    severity: "error",
    pattern: /\b(hypertension|tension\s+artérielle|hypotension)\b/gi,
    term: "hypertension / tension artérielle",
    recommendation:
      "Pathologie cardiovasculaire médicale. Ne jamais prétendre agir sur la tension artérielle. Retirez ou reformulez sans référence médicale.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-008",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(migraine[s]?|céphalée[s]?)\b/gi,
    term: "migraine / céphalée",
    recommendation:
      "Utilisez : « personnes sujettes aux tensions crâniennes », « maux de tête ». Ne prétendez pas traiter les migraines.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-009",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(arthrose|arthrite|rhumatisme[s]?)\b/gi,
    term: "arthrose / arthrite / rhumatisme",
    recommendation:
      "Pathologies rhumatologiques médicales. Utilisez : « personnes ressentant des inconforts articulaires », « tensions musculaires ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-010",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(eczéma|psoriasis|dermatite|urticaire)\b/gi,
    term: "eczéma / psoriasis",
    recommendation:
      "Affections cutanées médicalement reconnues. Ne prétendez pas les traiter. Utilisez : « personnes souffrant d'inconforts cutanés ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-011",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(asthme|bronchite\s+chronique|BPCO)\b/gi,
    term: "asthme",
    recommendation:
      "Pathologie respiratoire médicale. Évitez toute référence directe. Utilisez : « personnes souhaitant retrouver une respiration plus libre ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PA-012",
    category: "exercice_illegal",
    severity: "warning",
    pattern: /\b(obésité|surpoids\s+médical|IMC)\b/gi,
    term: "obésité",
    recommendation:
      "L'obésité est une pathologie médicale. Utilisez : « personnes souhaitant prendre soin de leur équilibre corporel », « rapport apaisé au corps ».",
    legalReference: "Art. L4161-1 CSP",
  },
];

// ─── Publicité mensongère ─────────────────────────────────────────────────────

export const PUBLICITE_MENSONGERE_RULES: LegalRule[] = [
  {
    id: "PM-001",
    category: "publicite_mensongere",
    severity: "error",
    pattern: /\b(résultat[s]?\s+garanti[s]?|garantie\s+de\s+résultat|100\s*%\s+efficace|efficacité\s+prouvée\s+scientifiquement)\b/gi,
    term: "résultats garantis / 100% efficace",
    recommendation:
      "Les allégations de résultats garantis sont illicites en l'absence de preuves scientifiques reconnues. Utilisez des formulations nuancées : « peut contribuer à », « favorise le bien-être ».",
    legalReference: "Art. L121-1 et L121-2 Code de la consommation",
  },
  {
    id: "PM-002",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(seul[e]?\s+praticien|unique\s+en\s+france|meilleur\s+praticien)\b/gi,
    term: "seul praticien / meilleur",
    recommendation:
      "Les superlatifs non prouvés (« le meilleur », « le seul ») constituent des pratiques commerciales trompeuses.",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "PM-003",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(méthode\s+révolutionnaire|technologie\s+exclusive|secret\s+(ancestral|millénaire))\b/gi,
    term: "méthode révolutionnaire / secret ancestral",
    recommendation:
      "Ces affirmations invérifiables peuvent être qualifiées de pratiques commerciales trompeuses. Décrivez concrètement votre approche.",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "PM-004",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(témoignages?\s+vérifiés?|avis\s+certifiés?)\b/gi,
    term: "témoignages vérifiés / avis certifiés",
    recommendation:
      "Si vous affichez des avis clients comme « vérifiés », ils doivent l'être via une plateforme certifiée NF Z74-501. Sinon, retirez cette mention.",
    legalReference: "Décret 2017-1436 relatif aux avis en ligne",
  },
  // ── Promesses thérapeutiques manquantes du Kit Visible & Conforme™ ─────────
  {
    id: "PM-005",
    category: "publicite_mensongere",
    severity: "error",
    pattern: /\b(miracle|miraculeux|miraculeuse|remède[s]?)\b/gi,
    term: "miracle / remède",
    recommendation:
      "Ces termes sont des allégations thérapeutiques illicites. Ils promettent un effet médical sans preuve. Supprimez-les entièrement.",
    legalReference: "Art. L121-1 Code de la consommation + Art. L5122-1 CSP",
  },
  {
    id: "PM-006",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(résultat[s]?\s+immédiats?|effet\s+immédiat|soulagement\s+immédiat|changement\s+définitif|résultat[s]?\s+définitif[s]?|action\s+radicale?|résultat[s]?\s+radical[s]?)\b/gi,
    term: "immédiat / définitif / radical",
    recommendation:
      "Ces promesses de résultats rapides ou permanents sont des allégations invérifiables. Utilisez : « à votre rythme », « progressivement », « selon votre parcours ».",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "PM-007",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(je\s+)?garanti[st]?\b/gi,
    term: "garantir / je garantis",
    recommendation:
      "Garantir un résultat en matière de bien-être est une promesse illicite. Préférez : « j'accompagne vers », « mon approche vise à », « selon votre engagement ».",
    legalReference: "Art. L121-1 Code de la consommation",
    falsePositiveCheck: (ctx) =>
      /garanti[st]?\s+(sans\s+engagement|satisfait|remboursé)/i.test(ctx),
  },
];

// ─── Vocabulaire pseudo-scientifique (Kit Cat. 5) ────────────────────────────

export const PSEUDOSCIENCE_RULES: LegalRule[] = [
  {
    id: "PS-001",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(toxines?|détox|detox|détoxification|detoxification|détoxifie[rz]?)\b/gi,
    term: "toxines / détox",
    recommendation:
      "Les allégations de « détox » ou d'élimination de « toxines » sont non prouvées scientifiquement et encadrées par le Règlement CE 1924/2006. Utilisez : « soutien des fonctions naturelles de l'organisme ».",
    legalReference: "Règlement CE 1924/2006 — allégations de santé",
  },
  {
    id: "PS-002",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(hormonal[e]?[s]?|déséquilibre\s+hormonal|hormones?\s+(en\s+)?(déséquilibre|perturbées?|régulées?))\b/gi,
    term: "hormonal / déséquilibre hormonal",
    recommendation:
      "Agir sur le système hormonal relève de l'endocrinologie médicale. Préférez : « soutenir la vitalité naturelle », « favoriser un équilibre global ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PS-003",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(stimul[a-z]+)\s+(le\s+|la\s+|les\s+|votre\s+|du\s+)?(système\s+immunitaire|immunité|circulation|lymphe|foie|reins?|pancréas|thyroïde|surrénales?)\b/gi,
    term: "stimuler [organe / système]",
    recommendation:
      "Promettre de stimuler un organe ou un système physiologique est une allégation médicale. Utilisez : « soutenir le bien-être global », « favoriser la vitalité ».",
    legalReference: "Règlement CE 1924/2006 + Art. L4161-1 CSP",
  },
  {
    id: "PS-004",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(régul[a-z]+)\s+(le\s+|la\s+|les\s+|votre\s+|du\s+)?(système\s+nerveux|hormones?|cortisol|glycémie|tension|circulation|thyroïde|sommeil\s+profond)\b/gi,
    term: "réguler [fonction physiologique]",
    recommendation:
      "Réguler une fonction physiologique est un acte médical. Préférez : « accompagner vers un équilibre », « soutenir un rythme naturel ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PS-005",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(drainage\s+(lymphatique|hépatique|rénal|intestinal)|drainage\s+médical)\b/gi,
    term: "drainage [médical]",
    recommendation:
      "Le drainage médical est un acte paramédical réglementé. Précisez : « drainage lymphatique bien-être » et ajoutez qu'il ne remplace pas un suivi médical.",
    legalReference: "Art. L4321-1 CSP",
  },
  {
    id: "PS-006",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(rééquilibrage\s+(hormonal|alimentaire\s+médical|nerveux|énergétique\s+médical))\b/gi,
    term: "rééquilibrage [médical]",
    recommendation:
      "« Rééquilibrage » associé à un terme médical (hormonal, nerveux) implique une action thérapeutique. Utilisez : « approche naturelle pour soutenir l'équilibre ».",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "PS-007",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(boost[e]?\s+(l'immunité|le\s+système\s+immunitaire|les\s+défenses)|renforcer\s+(l'immunité|les\s+défenses\s+immunitaires))\b/gi,
    term: "booster l'immunité / renforcer les défenses",
    recommendation:
      "Les allégations immunitaires sont strictement réglementées. Seules certaines sont autorisées avec des nutriments spécifiques. Utilisez : « prendre soin de son bien-être global ».",
    legalReference: "Règlement CE 1924/2006",
  },
];

// ─── Témoignages et preuves (Kit Cat. 6) ─────────────────────────────────────

export const TEMOIGNAGES_RULES: LegalRule[] = [
  {
    id: "TE-001",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(avant[\s\/-]+après|before[\s\/-]+after|résultats?\s+visibles?)\b/gi,
    term: "avant/après / résultats visibles",
    recommendation:
      "Les photos ou comparaisons avant/après impliquent une promesse de résultat visuel. Elles sont encadrées par la jurisprudence sur la publicité trompeuse. Ajoutez toujours : « résultats variables selon chaque personne ».",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "TE-002",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(témoignage[s]?\s+(patient|client|de\s+patient|de\s+client)|cas\s+(client[s]?|clinique[s]?))\b/gi,
    term: "témoignage patient / cas client",
    recommendation:
      "Les témoignages patients sont soumis aux règles de la publicité médicale. Préférez « retour d'expérience » ou « témoignage de personnes accompagnées ». Les cas cliniques sont réservés aux professionnels de santé.",
    legalReference: "Art. L1161-1 CSP + Décret 2017-1436",
  },
  {
    id: "TE-003",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(preuve[s]?\s+(scientifique[s]?|clinique[s]?|médicale[s]?)|études?\s+prouvent?|scientifiquement\s+prouvé)\b/gi,
    term: "preuves scientifiques / études prouvent",
    recommendation:
      "Affirmer une preuve scientifique sans étude publiée et validée est une pratique commerciale trompeuse. Utilisez : « certains bénéfices font l'objet d'études préliminaires ».",
    legalReference: "Art. L121-1 Code de la consommation",
  },
  {
    id: "TE-004",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(transformation\s+(radicale|garantie|totale|en\s+\d+\s+(jours?|semaines?|séances?)))\b/gi,
    term: "transformation radicale / garantie",
    recommendation:
      "Promettre une transformation garantie est une allégation invérifiable. Préférez : « accompagnement vers un changement progressif », « à votre rythme ».",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "TE-005",
    category: "publicite_mensongere",
    severity: "warning",
    pattern: /\b(méthode\s+(prouvée|validée\s+scientifiquement|reconnue\s+médicalement)|technique\s+(prouvée|cliniquement\s+testée))\b/gi,
    term: "méthode prouvée / validée scientifiquement",
    recommendation:
      "Sans étude scientifique publiée et validée, ces affirmations sont trompeuses. Utilisez : « approche inspirée de… », « technique issue de… ».",
    legalReference: "Art. L121-1 Code de la consommation",
  },
];

// ─── Protection consommateur ──────────────────────────────────────────────────

export const PROTECTION_CONSO_RULES: LegalRule[] = [
  {
    id: "PC-001",
    category: "protection_consommateur",
    severity: "warning",
    pattern: /\b(tarif[s]?|prix|honoraires?|consultation\s+à)\b/gi,
    term: "tarifs affichés (à vérifier TTC)",
    recommendation:
      "Les prix affichés doivent être TTC (toutes taxes comprises) conformément à l'arrêté du 3 décembre 1987. Indiquez clairement si vos prestations sont exonérées de TVA.",
    legalReference: "Arrêté du 3 décembre 1987 + Art. L113-3 Code de la consommation",
  },
  {
    id: "PC-002",
    category: "protection_consommateur",
    severity: "error",
    pattern: /\b(réservation|achat|commande|abonnement)\s+(en\s+ligne|sur\s+ce\s+site)/gi,
    term: "vente en ligne détectée",
    recommendation:
      "La vente de services en ligne à des consommateurs impose d'indiquer le droit de rétractation de 14 jours (Art. L221-18 Code de la consommation) dans vos CGV.",
    legalReference: "Art. L221-18 Code de la consommation",
  },
];

// ─── Toutes les règles ────────────────────────────────────────────────────────

export const ALL_LEGAL_RULES: LegalRule[] = [
  ...EXERCICE_ILLEGAL_RULES,
  ...CONFUSION_RULES,
  ...PATHOLOGIES_RULES,
  ...MENTIONS_RULES,
  ...PROTECTION_CONSO_RULES,
  ...PUBLICITE_MENSONGERE_RULES,
  ...PSEUDOSCIENCE_RULES,
  ...TEMOIGNAGES_RULES,
];

// ─── Pages requises ───────────────────────────────────────────────────────────

export const REQUIRED_PAGES = {
  mentionsLegales: {
    patterns: [/mentions?\s+légales?/i, /informations?\s+légales?/i],
    links: [
      /mentions-legales/i,
      /mentions_legales/i,
      /legal/i,
      /legales/i,
    ],
  },
  politiqueConfidentialite: {
    patterns: [
      /politique\s+de\s+confidentialité/i,
      /données\s+personnelles/i,
      /privacy/i,
      /RGPD/i,
    ],
    links: [
      /confidentialite/i,
      /privacy/i,
      /rgpd/i,
      /donnees-personnelles/i,
    ],
  },
  cgv: {
    patterns: [
      /conditions?\s+générales?\s+(de\s+vente|d'utilisation)/i,
      /\bCGV\b/,
      /\bCGU\b/,
    ],
    links: [/cgv/i, /cgu/i, /conditions-generales/i],
  },
  droitRetractation: {
    patterns: [
      /droit\s+de\s+rétractation/i,
      /délai\s+de\s+rétractation/i,
      /14\s+jours/i,
    ],
    links: [],
  },
  cookies: {
    patterns: [/politique\s+(de\s+)?cookies?/i, /gestion\s+des\s+cookies?/i],
    links: [/cookies?/i],
  },
  siret: {
    patterns: [/\b\d{14}\b/, /SIRET\s*:?\s*\d/i, /SIREN\s*:?\s*\d/i],
    links: [],
  },
};
