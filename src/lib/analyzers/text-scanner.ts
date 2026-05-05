import Anthropic from "@anthropic-ai/sdk";
import { ALL_LEGAL_RULES } from "./legal-rules";
import type {
  ScannerResult,
  ScannerAlert,
  ReformulationSuggestion,
  RiskLevel,
} from "@/types/scanner";

// ─── Reformulations figées (sans IA) ─────────────────────────────────────────
// Utilisées pour le plan gratuit et comme base pour l'IA

const STATIC_REFORMULATIONS: Record<string, ReformulationSuggestion> = {
  soigner: {
    original: "soigner",
    safe: "accompagner",
    explanation: "\"Soigner\" est réservé aux professionnels de santé réglementés.",
  },
  "je soigne": {
    original: "je soigne",
    safe: "j'accompagne",
    explanation: "Remplacez par une formulation d'accompagnement.",
  },
  traiter: {
    original: "traiter",
    safe: "accompagner",
    explanation: "\"Traiter\" implique un acte médical.",
  },
  traitement: {
    original: "traitement",
    safe: "accompagnement",
    explanation: "Préférez \"accompagnement\" ou \"approche\".",
  },
  "guérir": {
    original: "guérir",
    safe: "soutenir le mieux-être",
    explanation: "Promettre une guérison est une allégation médicale illégale.",
  },
  "guérison": {
    original: "guérison",
    safe: "amélioration du bien-être",
    explanation: "La guérison relève du domaine médical.",
  },
  "diagnostiquer": {
    original: "diagnostiquer",
    safe: "identifier",
    explanation: "Le diagnostic est un acte médical réservé.",
  },
  "diagnostic": {
    original: "diagnostic",
    safe: "bilan de vitalité",
    explanation: "Utilisez \"bilan\", \"évaluation\" ou \"entretien préalable\".",
  },
  "prescrire": {
    original: "prescrire",
    safe: "recommander",
    explanation: "La prescription est réservée aux médecins.",
  },
  "prescription": {
    original: "prescription",
    safe: "recommandation",
    explanation: "Remplacez par \"recommandation\" ou \"conseil\".",
  },
  "thérapie": {
    original: "thérapie",
    safe: "séance",
    explanation: "\"Thérapie\" a une connotation médicale. Préférez \"séance\" ou \"accompagnement\".",
  },
  "thérapeute": {
    original: "thérapeute",
    safe: "praticien(ne) bien-être",
    explanation: "Précisez votre spécialité pour éviter la confusion.",
  },
  "patient": {
    original: "patient",
    safe: "client",
    explanation: "\"Patient\" appartient au vocabulaire médical.",
  },
  "patients": {
    original: "patients",
    safe: "clients",
    explanation: "Préférez \"clients\", \"personnes accompagnées\" ou \"bénéficiaires\".",
  },
  "clinique": {
    original: "clinique",
    safe: "cabinet de bien-être",
    explanation: "\"Clinique\" évoque un établissement médical réglementé.",
  },
  "trouble": {
    original: "trouble",
    safe: "difficulté",
    explanation: "Les \"troubles\" sont des pathologies médicales. Utilisez \"difficultés\" ou \"situations\".",
  },
  "troubles": {
    original: "troubles",
    safe: "difficultés",
    explanation: "Remplacez par \"difficultés\", \"situations\" ou \"déséquilibres\".",
  },
  "je soigne les troubles du sommeil": {
    original: "je soigne les troubles du sommeil",
    safe: "j'accompagne les personnes rencontrant des difficultés de sommeil",
    explanation: "Formulation médicale → reformulation d'accompagnement.",
  },
  "thérapie pour burn out": {
    original: "thérapie pour burn out",
    safe: "accompagnement des personnes en situation d'épuisement professionnel",
    explanation: "Double problème : \"thérapie\" (médical) + \"burn out\" (pathologie reconnue).",
  },
  "spécialiste en anxiété": {
    original: "spécialiste en anxiété",
    safe: "praticienne accompagnant les personnes traversant des périodes de tension ou d'inquiétude",
    explanation: "\"Spécialiste\" + pathologie médicale = allégation risquée.",
  },
  "traiter la dépression": {
    original: "traiter la dépression",
    safe: "accompagner les personnes traversant des périodes de mal-être ou de baisse d'énergie",
    explanation: "La dépression est une pathologie médicale qui ne peut être traitée que par un médecin.",
  },
  // ── Cat. 1 — Verbes médicaux manquants ────────────────────────────────────
  "soulager": { original: "soulager", safe: "apporter un mieux-être", explanation: "« Soulager » implique un effet médical." },
  "prévenir": { original: "prévenir", safe: "prendre soin de soi", explanation: "La prévention médicale relève des professionnels de santé." },
  "rééduquer": { original: "rééduquer", safe: "retrouver ses appuis", explanation: "La rééducation est un acte paramédical réglementé." },
  "rééducation": { original: "rééducation", safe: "accompagnement au mouvement", explanation: "Préférez « remise en mouvement »." },
  "rétablir": { original: "rétablir", safe: "retrouver son équilibre", explanation: "« Rétablir » suggère un retour à la santé après maladie." },
  "rétablissement": { original: "rétablissement", safe: "retour à l'équilibre", explanation: "Préférez « retrouver sa vitalité »." },
  "éliminer": { original: "éliminer", safe: "libérer", explanation: "Peut être perçu comme une allégation médicale." },
  "vaincre": { original: "vaincre", safe: "traverser", explanation: "Implique un résultat garanti." },
  "combattre": { original: "combattre", safe: "faire face à", explanation: "Suggère une action thérapeutique." },
  "réparer": { original: "réparer", safe: "rééquilibrer", explanation: "« Réparer » implique une action corrective médicale." },
  "corriger": { original: "corriger", safe: "harmoniser", explanation: "Dans un contexte corporel, préférez « rééquilibrer »." },
  "remédier": { original: "remédier", safe: "accompagner vers", explanation: "Connotation médicale curative." },
  // ── Cat. 2 — Titres protégés manquants ────────────────────────────────────
  "psychothérapeute": { original: "psychothérapeute", safe: "praticien(ne) en accompagnement psycho-émotionnel", explanation: "Titre réglementé depuis 2010 (décret n°2010-534)." },
  "clinicien": { original: "clinicien", safe: "praticien(ne)", explanation: "Désigne un professionnel de santé réglementé." },
  // ── Cat. 3 — Pathologies médicales ────────────────────────────────────────
  "dépression": { original: "dépression", safe: "période de mal-être ou de baisse d'énergie", explanation: "Pathologie médicale. Utilisez des formulations descriptives du vécu." },
  "burn-out": { original: "burn-out", safe: "situation d'épuisement professionnel", explanation: "Cadrez avec « personnes traversant une période d'épuisement »." },
  "burn out": { original: "burn out", safe: "situation d'épuisement", explanation: "Préférez « personnes en surmenage »." },
  "anxiété": { original: "anxiété", safe: "tension intérieure ou période d'inquiétude", explanation: "Cadrez avec « personnes traversant des périodes de tension »." },
  "insomnie": { original: "insomnie", safe: "difficultés de sommeil", explanation: "Utilisez « personnes rencontrant des difficultés de sommeil »." },
  "migraine": { original: "migraine", safe: "tensions crâniennes", explanation: "Utilisez « maux de tête » ou « tensions crâniennes »." },
  "arthrose": { original: "arthrose", safe: "inconforts articulaires", explanation: "Utilisez « personnes ressentant des inconforts articulaires »." },
  "eczéma": { original: "eczéma", safe: "inconforts cutanés", explanation: "Ne prétendez pas traiter une affection dermatologique." },
  "asthme": { original: "asthme", safe: "personnes souhaitant retrouver une respiration plus libre", explanation: "Pathologie respiratoire médicale." },
  "obésité": { original: "obésité", safe: "rapport apaisé au corps et à l'alimentation", explanation: "Pathologie médicale." },
  // ── Cat. 4 — Promesses thérapeutiques manquantes ──────────────────────────
  "miracle": { original: "miracle", safe: "résultats progressifs selon votre parcours", explanation: "Allégation thérapeutique illicite." },
  "miraculeux": { original: "miraculeux", safe: "remarquable", explanation: "Supprimez tout qualificatif de type « miraculeux »." },
  "remède": { original: "remède", safe: "approche naturelle", explanation: "Implique une action curative médicale." },
  "immédiat": { original: "immédiat", safe: "progressif et à votre rythme", explanation: "Promettre des résultats immédiats est une allégation invérifiable." },
  "définitif": { original: "définitif", safe: "durable", explanation: "Aucun résultat ne peut être garanti comme définitif." },
  "radical": { original: "radical", safe: "profond", explanation: "« Radical » promet un résultat extrême invérifiable." },
  "garantir": { original: "garantir", safe: "viser à accompagner vers", explanation: "Garantir un résultat en bien-être est une promesse illicite." },
  // ── Cat. 5 — Zones grises manquantes ──────────────────────────────────────
  "consultation": { original: "consultation", safe: "séance", explanation: "Fortement associé au vocabulaire médical." },
  "symptôme": { original: "symptôme", safe: "manifestation", explanation: "Préférez « manifestation », « signal », « ressenti »." },
  "symptômes": { original: "symptômes", safe: "manifestations", explanation: "Préférez « signaux du corps », « ressentis »." },
  "pathologie": { original: "pathologie", safe: "situation", explanation: "Terme médical. Utilisez « situation », « vécu », « difficulté »." },
  "maladie": { original: "maladie", safe: "condition de santé", explanation: "Utilisez « personnes vivant avec... » sans prétendre agir dessus." },
  // ── Cat. 5 — Vocabulaire pseudo-scientifique ──────────────────────────────
  "toxines": { original: "toxines", safe: "résidus naturels de l'organisme", explanation: "Le concept de « toxines » n'a pas de définition médicale reconnue." },
  "détox": { original: "détox", safe: "soutien des fonctions naturelles", explanation: "Les allégations détox sont encadrées par le Règlement CE 1924/2006." },
  "detox": { original: "detox", safe: "soutien des fonctions naturelles", explanation: "Les allégations détox sont encadrées par le Règlement CE 1924/2006." },
  "détoxification": { original: "détoxification", safe: "accompagnement naturel de l'organisme", explanation: "Terme non reconnu médicalement — risque d'allégation de santé non autorisée." },
  "drainage lymphatique": { original: "drainage lymphatique", safe: "drainage lymphatique bien-être", explanation: "Précisez qu'il s'agit d'un soin bien-être, non d'un acte médical." },
  "rééquilibrage hormonal": { original: "rééquilibrage hormonal", safe: "approche naturelle pour soutenir l'équilibre", explanation: "Agir sur les hormones relève de l'endocrinologie." },
  "boost immunité": { original: "boost immunité", safe: "prendre soin de son bien-être global", explanation: "Les allégations immunitaires sont réglementées (Règlement CE 1924/2006)." },
  // ── Cat. 6 — Témoignages et preuves ──────────────────────────────────────
  "avant/après": { original: "avant/après", safe: "évolution personnelle à votre rythme", explanation: "Les comparaisons avant/après impliquent une promesse de résultat — ajoutez « résultats variables »." },
  "avant après": { original: "avant après", safe: "évolution personnelle à votre rythme", explanation: "Les comparaisons avant/après impliquent une promesse de résultat." },
  "résultats visibles": { original: "résultats visibles", safe: "évolution ressentie progressivement", explanation: "Promettre des résultats visibles est une allégation invérifiable." },
  "cas client": { original: "cas client", safe: "témoignage de personnes accompagnées", explanation: "« Cas client » imite le vocabulaire des cas cliniques médicaux." },
  "témoignage patient": { original: "témoignage patient", safe: "retour d'expérience", explanation: "« Patient » appartient au vocabulaire médical." },
  "transformation garantie": { original: "transformation garantie", safe: "accompagnement vers un changement progressif", explanation: "Résultat garanti = allégation illicite." },
  "méthode prouvée": { original: "méthode prouvée", safe: "approche inspirée de pratiques reconnues", explanation: "Sans étude validée, « prouvée » est une affirmation trompeuse." },
  "scientifiquement prouvé": { original: "scientifiquement prouvé", safe: "dont certains bénéfices font l'objet d'études préliminaires", explanation: "Exige des études cliniques publiées et validées." },
};

// ─── Mapping catégories → labels lisibles ─────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  exercice_illegal: "Exercice illégal de la médecine",
  confusion_professionnelle: "Confusion professionnelle",
  mentions_obligatoires: "Mentions obligatoires",
  publicite_mensongere: "Publicité trompeuse",
  protection_consommateur: "Protection consommateur",
};

// ─── Niveau de risque par sévérité ───────────────────────────────────────────

function severityToRisk(severity: string): RiskLevel {
  switch (severity) {
    case "error": return "critique";
    case "warning": return "vigilance";
    case "info": return "neutre";
    default: return "conforme";
  }
}

// ─── Score global ─────────────────────────────────────────────────────────────

function computeGlobalRisk(alerts: ScannerAlert[]): { risk: RiskLevel; score: number } {
  if (alerts.length === 0) return { risk: "conforme", score: 95 };

  const critiques = alerts.filter((a) => a.riskLevel === "critique").length;
  const vigilances = alerts.filter((a) => a.riskLevel === "vigilance").length;

  let score = 100 - critiques * 25 - vigilances * 10;
  score = Math.max(0, Math.min(100, score));

  let risk: RiskLevel;
  if (score >= 85) risk = "conforme";
  else if (score >= 65) risk = "neutre";
  else if (score >= 40) risk = "vigilance";
  else risk = "critique";

  return { risk, score };
}

// ─── Analyse sans IA (plan gratuit) ──────────────────────────────────────────

export function scanTextBasic(text: string): ScannerResult {
  const alerts: ScannerAlert[] = [];
  const seenRules = new Set<string>();

  for (const rule of ALL_LEGAL_RULES) {
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.pattern.exec(text)) !== null) {
      if (seenRules.has(rule.id)) break;

      const start = Math.max(0, match.index - 80);
      const end = Math.min(text.length, match.index + match[0].length + 80);
      const context = text.slice(start, end).trim();

      if (rule.falsePositiveCheck && rule.falsePositiveCheck(context)) continue;

      const termLower = match[0].toLowerCase();
      const reformulation = STATIC_REFORMULATIONS[termLower];

      alerts.push({
        term: match[0],
        riskLevel: severityToRisk(rule.severity),
        category: CATEGORY_LABELS[rule.category] || rule.category,
        context: `…${context}…`,
        reformulation: reformulation?.safe,
        legalReference: rule.legalReference,
      });

      seenRules.add(rule.id);
    }
  }

  // Reformulations statiques
  const reformulations: ReformulationSuggestion[] = [];
  for (const alert of alerts) {
    const termLower = alert.term.toLowerCase();
    const ref = STATIC_REFORMULATIONS[termLower];
    if (ref && !reformulations.find((r) => r.original === ref.original)) {
      reformulations.push(ref);
    }
  }

  const { risk, score } = computeGlobalRisk(alerts);

  const critiques = alerts.filter((a) => a.riskLevel === "critique").length;
  const vigilances = alerts.filter((a) => a.riskLevel === "vigilance").length;

  let summary = "";
  if (alerts.length === 0) {
    summary = "Aucun terme problématique détecté. Ce texte semble conforme à une communication prudente.";
  } else if (critiques > 0) {
    summary = `${critiques} terme${critiques > 1 ? "s" : ""} critique${critiques > 1 ? "s" : ""} détecté${critiques > 1 ? "s" : ""} — risque d'exercice illégal de la médecine. Correction urgente recommandée.`;
  } else {
    summary = `${vigilances} point${vigilances > 1 ? "s" : ""} de vigilance détecté${vigilances > 1 ? "s" : ""}. Des reformulations prudentes sont conseillées.`;
  }

  return {
    inputText: text,
    globalRisk: risk,
    globalRiskScore: score,
    alerts,
    reformulations,
    summary,
  };
}

// ─── Analyse avec IA (plan payant) ────────────────────────────────────────────

export async function scanTextWithAI(
  text: string,
  profession: string
): Promise<ScannerResult> {
  // On commence par l'analyse de base
  const basicResult = scanTextBasic(text);

  const client = new Anthropic();

  const prompt = `Tu es juriste spécialisée en droit de la santé publique française et en droit de la consommation. Tu aides les praticiens du bien-être non réglementés (${profession || "praticien bien-être"}) à communiquer de façon juridiquement prudente.

Voici un texte à analyser :
---
${text.slice(0, 4000)}
---

L'analyse automatique a déjà détecté ces points :
${basicResult.alerts.map((a) => `- [${a.riskLevel}] "${a.term}" — ${a.category}`).join("\n") || "Aucun terme problématique détecté automatiquement."}

Ta mission :
1. Confirme ou infirme les détections (certaines peuvent être des faux positifs selon le contexte)
2. Détecte les problèmes subtils que l'analyse automatique a manqués (promesses implicites, ton médical général, allégations déguisées)
3. Propose des reformulations concrètes pour chaque problème
4. Propose une version corrigée complète du texte

Réponds en JSON structuré UNIQUEMENT (pas de texte avant ou après) :
{
  "confirmedAlerts": [{"term": "...", "context": "...", "riskLevel": "critique|vigilance|neutre", "category": "...", "reformulation": "..."}],
  "falsePositives": ["terme1", "terme2"],
  "additionalAlerts": [{"term": "...", "context": "...", "riskLevel": "critique|vigilance|neutre", "category": "...", "reformulation": "..."}],
  "reformulations": [{"original": "...", "safe": "...", "explanation": "..."}],
  "cleanedText": "version corrigée complète du texte",
  "summary": "résumé en 1-2 phrases du niveau de risque global"
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = (message.content[0] as { type: "text"; text: string }).text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const aiResult = JSON.parse(jsonMatch[0]);

    // Fusionner les résultats IA avec la base
    const falsePositiveTerms: string[] = aiResult.falsePositives || [];
    const finalAlerts: ScannerAlert[] = [
      ...(aiResult.confirmedAlerts || []).filter(
        (a: ScannerAlert) => !falsePositiveTerms.includes(a.term)
      ),
      ...(aiResult.additionalAlerts || []),
    ];

    const { risk, score } = computeGlobalRisk(finalAlerts);

    return {
      inputText: text,
      globalRisk: risk,
      globalRiskScore: score,
      alerts: finalAlerts,
      reformulations: aiResult.reformulations || basicResult.reformulations,
      cleanedText: aiResult.cleanedText,
      summary: aiResult.summary || basicResult.summary,
    };
  } catch {
    // Fallback vers l'analyse de base en cas d'erreur IA
    return basicResult;
  }
}
