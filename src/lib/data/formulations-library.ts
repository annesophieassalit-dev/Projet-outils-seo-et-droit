import type { FormulationEntry, FormulationTheme } from "@/types/scanner";

export const FORMULATIONS_LIBRARY: FormulationEntry[] = [

  // ─── STRESS & ANXIÉTÉ ──────────────────────────────────────────────────────
  {
    id: "s-01", theme: "stress",
    toAvoid: "je traite l'anxiété",
    safe: "j'accompagne les personnes traversant des périodes de tension ou d'inquiétude",
    whyRisky: "Traiter l'anxiété = acte médical. L'anxiété est un trouble reconnu.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "s-02", theme: "stress",
    toAvoid: "spécialiste en gestion du stress",
    safe: "praticienne proposant des outils naturels pour mieux vivre les périodes de stress",
    whyRisky: "\"Spécialiste\" + pathologie = allégation forte sans preuve réglementée.",
  },
  {
    id: "s-03", theme: "stress",
    toAvoid: "soigner le burn out",
    safe: "accompagner les personnes en situation d'épuisement professionnel",
    whyRisky: "Le burn out (épuisement professionnel) est reconnu médicalement.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "s-04", theme: "stress",
    toAvoid: "traiter l'anxiété chronique",
    safe: "soutenir les personnes qui vivent avec une tension intérieure persistante",
    whyRisky: "L'anxiété chronique est un trouble psychiatrique.",
  },
  {
    id: "s-05", theme: "stress",
    toAvoid: "guérir du stress",
    safe: "développer des ressources pour mieux traverser les périodes de stress",
    whyRisky: "Guérir = promesse médicale.",
  },

  // ─── SOMMEIL ──────────────────────────────────────────────────────────────
  {
    id: "so-01", theme: "sommeil",
    toAvoid: "je soigne les troubles du sommeil",
    safe: "j'accompagne les personnes rencontrant des difficultés de sommeil",
    whyRisky: "Soigner + trouble médical = exercice illégal.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "so-02", theme: "sommeil",
    toAvoid: "traitement naturel de l'insomnie",
    safe: "approche naturelle pour soutenir un sommeil plus apaisé",
    whyRisky: "\"Traitement\" + \"insomnie\" (pathologie reconnue).",
  },
  {
    id: "so-03", theme: "sommeil",
    toAvoid: "guérir l'insomnie",
    safe: "retrouver un rythme de sommeil plus équilibré",
    whyRisky: "Promesse de guérison sur une pathologie.",
  },
  {
    id: "so-04", theme: "sommeil",
    toAvoid: "résoudre vos problèmes de sommeil définitivement",
    safe: "explorer des pistes naturelles pour un sommeil plus réparateur",
    whyRisky: "Promesse de résultat définitif = trompeuse.",
  },

  // ─── FATIGUE & ÉNERGIE ────────────────────────────────────────────────────
  {
    id: "f-01", theme: "fatigue",
    toAvoid: "soigner la fatigue chronique",
    safe: "accompagner les personnes qui ressentent un manque durable d'énergie",
    whyRisky: "La fatigue chronique (SFC) est une pathologie reconnue.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "f-02", theme: "fatigue",
    toAvoid: "traiter l'épuisement surrénalien",
    safe: "soutenir la vitalité des personnes en situation d'épuisement",
    whyRisky: "Terme médical non reconnu mais utilisé dans un sens médical.",
  },
  {
    id: "f-03", theme: "fatigue",
    toAvoid: "diagnostic de fatigue",
    safe: "bilan de vitalité",
    whyRisky: "Le diagnostic est un acte médical.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "f-04", theme: "fatigue",
    toAvoid: "recharger vos batteries en une séance",
    safe: "découvrir des ressources naturelles pour soutenir votre énergie",
    whyRisky: "Promesse de résultat immédiat et garanti.",
  },

  // ─── ÉMOTIONS ─────────────────────────────────────────────────────────────
  {
    id: "e-01", theme: "emotions",
    toAvoid: "traiter la dépression",
    safe: "accompagner les personnes traversant des périodes de baisse d'énergie ou de mal-être",
    whyRisky: "La dépression est une pathologie médicale qui ne peut être traitée que par un médecin.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "e-02", theme: "emotions",
    toAvoid: "guérir des traumatismes",
    safe: "créer un espace pour explorer et apprivoiser certaines expériences difficiles",
    whyRisky: "Les traumatismes (PTSD) relèvent de la psychiatrie.",
  },
  {
    id: "e-03", theme: "emotions",
    toAvoid: "thérapie émotionnelle",
    safe: "accompagnement des émotions",
    whyRisky: "\"Thérapie\" a une connotation médicale.",
  },
  {
    id: "e-04", theme: "emotions",
    toAvoid: "traitement des troubles émotionnels",
    safe: "espace de soutien pour mieux vivre ses émotions",
    whyRisky: "Troubles émotionnels = terminologie médicale.",
  },
  {
    id: "e-05", theme: "emotions",
    toAvoid: "je soigne les blessures émotionnelles",
    safe: "j'accompagne les personnes souhaitant prendre soin de leur vie intérieure",
    whyRisky: "\"Soigner\" + \"blessures\" = contexte médical.",
  },

  // ─── DOULEURS ─────────────────────────────────────────────────────────────
  {
    id: "d-01", theme: "douleurs",
    toAvoid: "traiter les douleurs chroniques",
    safe: "accompagner les personnes qui vivent avec des sensations douloureuses persistantes",
    whyRisky: "Les douleurs chroniques sont une pathologie médicale.",
    legalReference: "Art. L4161-1 CSP",
  },
  {
    id: "d-02", theme: "douleurs",
    toAvoid: "soulager la fibromyalgie",
    safe: "proposer un accompagnement doux aux personnes touchées par des douleurs diffuses",
    whyRisky: "La fibromyalgie est une maladie reconnue — promettre de la soulager = allégation médicale.",
  },
  {
    id: "d-03", theme: "douleurs",
    toAvoid: "soigner les migraines",
    safe: "soutenir les personnes qui traversent des périodes de maux de tête récurrents",
    whyRisky: "La migraine est une pathologie neurologique.",
  },
  {
    id: "d-04", theme: "douleurs",
    toAvoid: "éliminer la douleur",
    safe: "explorer des approches naturelles pour développer une relation apaisée à son corps",
    whyRisky: "Promettre d'éliminer la douleur = promesse médicale non prouvable.",
  },

  // ─── CONFIANCE EN SOI ─────────────────────────────────────────────────────
  {
    id: "c-01", theme: "confiance",
    toAvoid: "traiter le manque de confiance",
    safe: "accompagner les personnes souhaitant développer leur confiance intérieure",
    whyRisky: "\"Traiter\" implique un acte médical.",
  },
  {
    id: "c-02", theme: "confiance",
    toAvoid: "guérir l'estime de soi",
    safe: "soutenir le chemin vers une meilleure estime de soi",
    whyRisky: "Guérir = promesse médicale.",
  },
  {
    id: "c-03", theme: "confiance",
    toAvoid: "résultats garantis sur l'affirmation de soi",
    safe: "un espace pour explorer votre relation à vous-même",
    whyRisky: "Les résultats garantis sont interdits en l'absence de preuve scientifique.",
    legalReference: "Art. L121-2 Code de la consommation",
  },

  // ─── ALIMENTATION ─────────────────────────────────────────────────────────
  {
    id: "a-01", theme: "alimentation",
    toAvoid: "prescription alimentaire",
    safe: "recommandations nutritionnelles personnalisées",
    whyRisky: "\"Prescription\" est un acte médical réservé.",
    legalReference: "Art. L4211-1 CSP",
  },
  {
    id: "a-02", theme: "alimentation",
    toAvoid: "diététicienne",
    safe: "praticienne en alimentation naturelle",
    whyRisky: "Diététicien(ne) est un titre protégé (Bac+3 minimum, RNCP).",
  },
  {
    id: "a-03", theme: "alimentation",
    toAvoid: "traiter les troubles alimentaires",
    safe: "accompagner les personnes souhaitant développer une relation plus apaisée à l'alimentation",
    whyRisky: "Les TCA (troubles des conduites alimentaires) sont des pathologies psychiatriques.",
  },

  // ─── PRÉSENTATION GÉNÉRALE ────────────────────────────────────────────────
  {
    id: "g-01", theme: "presentation_generale",
    toAvoid: "thérapeute",
    safe: "praticien(ne) bien-être" ,
    whyRisky: "\"Thérapeute\" seul peut induire confusion avec psychothérapeute (titre protégé depuis 2010).",
    legalReference: "Art. 52 Loi du 9 août 2004",
  },
  {
    id: "g-02", theme: "presentation_generale",
    toAvoid: "mes patients",
    safe: "les personnes que j'accompagne",
    whyRisky: "\"Patient\" appartient au vocabulaire médical.",
  },
  {
    id: "g-03", theme: "presentation_generale",
    toAvoid: "clinique de bien-être",
    safe: "cabinet de bien-être" ,
    whyRisky: "\"Clinique\" évoque un établissement médical réglementé.",
    legalReference: "Art. L6122-1 CSP",
  },
  {
    id: "g-04", theme: "presentation_generale",
    toAvoid: "méthode révolutionnaire",
    safe: "approche complémentaire",
    whyRisky: "Affirmation invérifiable = pratique commerciale potentiellement trompeuse.",
    legalReference: "Art. L121-2 Code de la consommation",
  },
  {
    id: "g-05", theme: "presentation_generale",
    toAvoid: "efficacité prouvée scientifiquement",
    safe: "approche dont certains bénéfices font l'objet d'études préliminaires",
    whyRisky: "Allégation de preuve scientifique sans étude validée = tromperie.",
    legalReference: "Art. L121-1 Code de la consommation",
  },
  {
    id: "g-06", theme: "presentation_generale",
    toAvoid: "docteur en bien-être",
    safe: "praticien(ne) certifié(e) en [spécialité]",
    whyRisky: "\"Docteur\" est un titre protégé réservé aux docteurs d'État.",
    legalReference: "Art. 433-17 Code pénal",
  },
];

// ─── Par thème ─────────────────────────────────────────────────────────────────

export function getByTheme(theme: FormulationTheme): FormulationEntry[] {
  return FORMULATIONS_LIBRARY.filter((f) => f.theme === theme);
}

export function getAllThemes(): FormulationTheme[] {
  return Array.from(new Set(FORMULATIONS_LIBRARY.map((f) => f.theme)));
}
