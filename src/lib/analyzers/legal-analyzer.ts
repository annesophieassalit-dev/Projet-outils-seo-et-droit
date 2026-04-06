import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import type {
  LegalScore,
  LegalRuleMatch,
  LegalMentionsCheck,
  AuditIssue,
} from "@/types/audit";
import { scoreToGrade } from "@/lib/utils";
import {
  ALL_LEGAL_RULES,
  REQUIRED_PAGES,
  type LegalRule,
} from "./legal-rules";

// ─── Fetch page ───────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "VisibleConforme-Bot/1.0",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Extraction du texte visible ──────────────────────────────────────────────

function extractVisibleText($: cheerio.CheerioAPI): string {
  // Supprimer scripts, styles, nav, footer pour se concentrer sur le contenu
  $("script, style, noscript, iframe").remove();
  return $("body").text().replace(/\s+/g, " ").trim();
}

// ─── Extraction des liens internes ────────────────────────────────────────────

function extractInternalLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string
): string[] {
  const links: string[] = [];
  const base = new URL(baseUrl);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === base.hostname) links.push(url.toString());
    } catch {
      // ignore
    }
  });
  return Array.from(new Set(links));
}

// ─── Recherche des correspondances de règles ──────────────────────────────────

function findRuleMatches(
  text: string,
  pageUrl: string,
  rules: LegalRule[]
): LegalRuleMatch[] {
  const matches: LegalRuleMatch[] = [];

  for (const rule of rules) {
    // Réinitialiser le regex
    rule.pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = rule.pattern.exec(text)) !== null) {
      // Extraire le contexte (60 caractères de chaque côté)
      const start = Math.max(0, match.index - 60);
      const end = Math.min(text.length, match.index + match[0].length + 60);
      const context = text.slice(start, end).trim();

      // Vérifier faux positif
      if (rule.falsePositiveCheck && rule.falsePositiveCheck(context)) {
        continue;
      }

      matches.push({
        ruleId: rule.id,
        category: rule.category,
        severity: rule.severity,
        term: match[0],
        context: `…${context}…`,
        url: pageUrl,
        recommendation: rule.recommendation,
        legalReference: rule.legalReference,
      });

      // Éviter les doublons excessifs pour le même terme (max 3 occurrences)
      const sameRule = matches.filter((m) => m.ruleId === rule.id);
      if (sameRule.length >= 3) break;
    }
  }

  return matches;
}

// ─── Vérification des mentions obligatoires ───────────────────────────────────

function checkMandatoryMentions(
  $: cheerio.CheerioAPI,
  text: string,
  internalLinks: string[]
): LegalMentionsCheck {
  const allContent = text + " " + internalLinks.join(" ");

  const hasPattern = (patterns: RegExp[]): boolean =>
    patterns.some((p) => p.test(allContent));

  const hasLinkPattern = (patterns: RegExp[]): boolean =>
    patterns.some((p) => internalLinks.some((link) => p.test(link)));

  return {
    hasMentionsLegales:
      hasPattern(REQUIRED_PAGES.mentionsLegales.patterns) ||
      hasLinkPattern(REQUIRED_PAGES.mentionsLegales.links),
    hasPolitiqueConfidentialite:
      hasPattern(REQUIRED_PAGES.politiqueConfidentialite.patterns) ||
      hasLinkPattern(REQUIRED_PAGES.politiqueConfidentialite.links),
    hasCGV:
      hasPattern(REQUIRED_PAGES.cgv.patterns) ||
      hasLinkPattern(REQUIRED_PAGES.cgv.links),
    hasDroitRetractation: hasPattern(REQUIRED_PAGES.droitRetractation.patterns),
    hasCookiePolicy:
      hasPattern(REQUIRED_PAGES.cookies.patterns) ||
      hasLinkPattern(REQUIRED_PAGES.cookies.links),
    hasSiret: hasPattern(REQUIRED_PAGES.siret.patterns),
    hasProfessionalAddress:
      /\b\d{1,4}[\s,]+(?:rue|avenue|boulevard|allée|impasse|chemin|place|voie)/i.test(
        text
      ),
  };
}

// ─── Conversion mentions → issues ─────────────────────────────────────────────

function mentionsToIssues(
  check: LegalMentionsCheck,
  url: string
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  let i = 0;
  const id = () => `legal-mention-${++i}`;

  if (!check.hasMentionsLegales) {
    issues.push({
      id: id(),
      category: "Mentions légales",
      severity: "error",
      title: "Mentions légales introuvables",
      description:
        "Aucune page de mentions légales n'a été détectée. C'est une obligation légale pour tout professionnel ayant un site internet en France.",
      recommendation:
        "Créez une page « Mentions légales » contenant : nom complet, adresse professionnelle, numéro SIRET, email de contact, hébergeur du site.",
      url,
    });
  }

  if (!check.hasPolitiqueConfidentialite) {
    issues.push({
      id: id(),
      category: "RGPD",
      severity: "error",
      title: "Politique de confidentialité introuvable",
      description:
        "Si votre site collecte des données personnelles (formulaire, analytics, newsletter), une politique de confidentialité est obligatoire.",
      recommendation:
        "Ajoutez une politique de confidentialité précisant : quelles données vous collectez, pourquoi, combien de temps, et les droits de vos visiteurs.",
      url,
    });
  }

  if (!check.hasSiret) {
    issues.push({
      id: id(),
      category: "Mentions légales",
      severity: "warning",
      title: "Numéro SIRET non détecté",
      description:
        "Votre numéro SIRET n'a pas été trouvé sur la page. Il est obligatoire dans les mentions légales et rassure vos clients.",
      recommendation:
        "Ajoutez votre numéro SIRET (14 chiffres) dans vos mentions légales.",
      url,
    });
  }

  if (!check.hasCookiePolicy) {
    issues.push({
      id: id(),
      category: "RGPD",
      severity: "warning",
      title: "Gestion des cookies non documentée",
      description:
        "Aucune politique de cookies n'a été détectée. Si vous utilisez Google Analytics ou d'autres traceurs, leur présence doit être signalée.",
      recommendation:
        "Ajoutez un bandeau cookie RGPD conforme et une page expliquant les cookies utilisés.",
      url,
    });
  }

  if (!check.hasProfessionalAddress) {
    issues.push({
      id: id(),
      category: "Mentions légales",
      severity: "info",
      title: "Adresse professionnelle non détectée",
      description:
        "Une adresse physique professionnelle n'a pas été trouvée. Elle est obligatoire dans vos mentions légales.",
      recommendation:
        "Indiquez votre adresse professionnelle dans vos mentions légales. Si vous exercez à domicile, vous pouvez utiliser une adresse de domiciliation.",
      url,
    });
  }

  return issues;
}

// ─── Conversion matches → issues ─────────────────────────────────────────────

function matchesToIssues(matches: LegalRuleMatch[]): AuditIssue[] {
  // Déduplications par ruleId
  const seen = new Set<string>();
  const issues: AuditIssue[] = [];

  for (const match of matches) {
    if (seen.has(match.ruleId)) continue;
    seen.add(match.ruleId);

    const categoryLabels: Record<string, string> = {
      exercice_illegal: "Exercice illégal de la médecine",
      confusion_professionnelle: "Confusion avec professionnel de santé",
      mentions_obligatoires: "Mentions obligatoires",
      publicite_mensongere: "Publicité trompeuse",
      protection_consommateur: "Protection du consommateur",
    };

    issues.push({
      id: `legal-${match.ruleId}`,
      category: categoryLabels[match.category] || match.category,
      severity: match.severity,
      title: `Terme à risque détecté : « ${match.term} »`,
      description: `Contexte : ${match.context}`,
      recommendation: match.recommendation,
      excerpt: match.context,
      url: match.url,
    });
  }

  return issues;
}

// ─── Analyse IA (Claude) ──────────────────────────────────────────────────────

async function analyzeWithAI(
  text: string,
  profession: string,
  existingMatches: LegalRuleMatch[]
): Promise<string> {
  const client = new Anthropic();

  const matchesSummary =
    existingMatches.length > 0
      ? existingMatches
          .slice(0, 10)
          .map((m) => `- [${m.category}] "${m.term}" : ${m.context}`)
          .join("\n")
      : "Aucune correspondance évidente détectée.";

  const excerpt = text.slice(0, 3000);

  const prompt = `Tu es juriste spécialisée en droit de la santé et droit de la consommation en France.
Tu analyses le contenu d'un site web de professionnel du bien-être non réglementé (${profession || "praticien bien-être"}).

Voici un extrait du contenu du site :
---
${excerpt}
---

Les règles automatiques ont détecté les points suivants :
${matchesSummary}

Rédige une analyse juridique nuancée et bienveillante en 3 à 5 paragraphes :
1. Les risques les plus importants identifiés
2. Les formulations qui posent problème et pourquoi (exercice illégal de la médecine, publicité mensongère, etc.)
3. Des reformulations suggérées concrètes
4. Ce qui semble correct et à conserver

Ton ton est professionnel mais accessible, et tu rappelles que tu fournis une première analyse et non un avis juridique définitif.
Réponds en français.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

// ─── Score juridique ──────────────────────────────────────────────────────────

function calculateLegalScore(issues: AuditIssue[]): {
  score: number;
  riskLevel: "faible" | "modere" | "eleve" | "critique";
} {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "error") score -= 20;
    else if (issue.severity === "warning") score -= 8;
    else if (issue.severity === "info") score -= 2;
  }
  score = Math.max(0, Math.min(100, score));

  let riskLevel: "faible" | "modere" | "eleve" | "critique";
  if (score >= 80) riskLevel = "faible";
  else if (score >= 60) riskLevel = "modere";
  else if (score >= 40) riskLevel = "eleve";
  else riskLevel = "critique";

  return { score, riskLevel };
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function analyzeLegal(
  url: string,
  options: {
    useAI?: boolean;
    profession?: string;
  } = {}
): Promise<LegalScore> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);
  const text = extractVisibleText($);
  const internalLinks = extractInternalLinks($, url);

  // Appliquer les règles
  const matches = findRuleMatches(text, url, ALL_LEGAL_RULES);

  // Vérifier les mentions
  const mentionsCheck = checkMandatoryMentions($, text, internalLinks);

  // Convertir en issues
  const mentionIssues = mentionsToIssues(mentionsCheck, url);
  const matchIssues = matchesToIssues(matches);
  const allIssues = [...matchIssues, ...mentionIssues];

  // Score
  const { score, riskLevel } = calculateLegalScore(allIssues);

  // Analyse IA (optionnelle, plan Pro uniquement)
  let aiAnalysis: string | undefined;
  if (options.useAI) {
    try {
      aiAnalysis = await analyzeWithAI(
        text,
        options.profession || "",
        matches
      );
    } catch (err) {
      console.error("AI analysis failed:", err);
      aiAnalysis = "L'analyse IA n'a pas pu être générée pour cette analyse.";
    }
  }

  return {
    score,
    grade: scoreToGrade(score),
    riskLevel,
    issues: allIssues,
    matches,
    mentionsCheck,
    aiAnalysis,
  };
}
