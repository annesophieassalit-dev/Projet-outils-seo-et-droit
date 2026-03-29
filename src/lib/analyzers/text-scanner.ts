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
