import * as cheerio from "cheerio";
import Anthropic from "@anthropic-ai/sdk";
import type {
  SeoScore,
  SeoMetaResult,
  SeoContentResult,
  AuditIssue,
  LexicalField,
  LexicalTerm,
} from "@/types/audit";
import { scoreToGrade } from "@/lib/utils";

// ─── Fetch ────────────────────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<{ html: string; loadTimeMs: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const start = Date.now();
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
    const html = await res.text();
    return { html, loadTimeMs: Date.now() - start };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Extraction meta ──────────────────────────────────────────────────────────

function extractMeta($: cheerio.CheerioAPI): SeoMetaResult {
  const titleTag = $("title").first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || null;
  const canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const robotsMeta = $('meta[name="robots"]').attr("content")?.trim() || null;
  const ogTitle = $('meta[property="og:title"]').attr("content")?.trim() || null;
  const ogDescription = $('meta[property="og:description"]').attr("content")?.trim() || null;
  const ogImage = $('meta[property="og:image"]').attr("content")?.trim() || null;

  const schemaMarkup: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (json["@type"]) schemaMarkup.push(json["@type"]);
    } catch { /* ignore */ }
  });

  return {
    titleTag,
    titleLength: titleTag?.length ?? 0,
    metaDescription,
    metaDescriptionLength: metaDescription?.length ?? 0,
    canonicalUrl,
    robotsMeta,
    ogTitle,
    ogDescription,
    ogImage,
    schemaMarkup,
  };
}

// ─── Extraction contenu ───────────────────────────────────────────────────────

function extractContent($: cheerio.CheerioAPI, url: string): SeoContentResult {
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const words = bodyText.split(" ").filter((w) => w.length > 2);

  let imagesWithoutAlt = 0;
  let totalImages = 0;
  $("img").each((_, el) => {
    totalImages++;
    const alt = $(el).attr("alt");
    if (!alt || alt.trim() === "") imagesWithoutAlt++;
  });

  let internalLinks = 0;
  let externalLinks = 0;
  const parsedBase = new URL(url);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === parsedBase.hostname) internalLinks++;
      else externalLinks++;
    } catch { /* ignore */ }
  });

  const hasMobileViewport =
    $('meta[name="viewport"]').attr("content")?.includes("width=device-width") ?? false;

  return {
    h1Count: $("h1").length,
    h1Text: $("h1").map((_, el) => $(el).text().trim()).get().slice(0, 5),
    h2Count: $("h2").length,
    h3Count: $("h3").length,
    wordCount: words.length,
    imagesWithoutAlt,
    totalImages,
    internalLinks,
    externalLinks,
    hasHttps: url.startsWith("https://"),
    hasMobileViewport,
  };
}

// ─── Analyse sémantique ───────────────────────────────────────────────────────

interface SemanticAnalysis {
  hasLocalKeyword: boolean;
  hasActivityKeyword: boolean;
  mainTopics: string[];
  missingKeywordSuggestions: string[];
}

const ACTIVITY_KEYWORDS = [
  "naturopathe", "naturopathie", "coach", "coaching", "hypnothérapeute", "hypnose",
  "sophrologie", "sophrologue", "réflexologue", "réflexologie", "reiki", "énergéticien",
  "kinésiologue", "kinésiologie", "bien-être", "bien être", "holistique", "accompagnement",
  "praticien", "praticienne", "aromathérapie",
];

const LOCAL_SIGNALS = [
  /\b(paris|lyon|marseille|bordeaux|toulouse|nantes|lille|strasbourg|nice|rennes)\b/i,
  /\b\d{5}\b/, // code postal
  /\b(rue|avenue|boulevard|allée|chemin|place)\b/i,
];

function analyzeSemantics($: cheerio.CheerioAPI, meta: SeoMetaResult): SemanticAnalysis {
  const allText = ($("title").text() + " " + $("body").text()).toLowerCase();
  const titleAndH1 = ($("title").text() + " " + $("h1").text()).toLowerCase();

  const hasActivityKeyword = ACTIVITY_KEYWORDS.some((kw) => allText.includes(kw));
  const hasLocalKeyword = LOCAL_SIGNALS.some((pattern) => pattern.test(allText));

  // Détecter les thèmes principaux depuis H2
  const mainTopics: string[] = [];
  $("h2").each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 80) mainTopics.push(text);
  });

  const missingKeywordSuggestions: string[] = [];
  if (!hasActivityKeyword) {
    missingKeywordSuggestions.push("votre spécialité (naturopathe, coach, hypnothérapeute…)");
  }
  if (!hasLocalKeyword) {
    missingKeywordSuggestions.push("votre ville ou zone géographique");
  }
  if (!titleAndH1.match(/accompagnement|bien.être|holistique|séance|consultation/)) {
    missingKeywordSuggestions.push("votre approche principale (accompagnement, bien-être…)");
  }

  return { hasLocalKeyword, hasActivityKeyword, mainTopics, missingKeywordSuggestions };
}

// ─── Analyse maillage interne ─────────────────────────────────────────────────

interface InternalLinkingAnalysis {
  internalLinkCount: number;
  hasFooterLinks: boolean;
  hasNavigationMenu: boolean;
  orphanRisk: boolean; // peu de liens internes = pages orphelines
  anchorTexts: string[];
}

function analyzeInternalLinking($: cheerio.CheerioAPI, url: string): InternalLinkingAnalysis {
  const base = new URL(url);
  let internalLinkCount = 0;
  const anchorTexts: string[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === base.hostname) {
        internalLinkCount++;
        const text = $(el).text().trim();
        if (text.length > 2 && text.length < 50) anchorTexts.push(text);
      }
    } catch { /* ignore */ }
  });

  const hasFooterLinks = $("footer a").length > 0;
  const hasNavigationMenu = $("nav a, header a, [role=navigation] a").length > 0;
  const orphanRisk = internalLinkCount < 3;

  return {
    internalLinkCount,
    hasFooterLinks,
    hasNavigationMenu,
    orphanRisk,
    anchorTexts: anchorTexts.slice(0, 10),
  };
}

// ─── Suggestion structure Hn ──────────────────────────────────────────────────

interface HnStructureSuggestion {
  current: { level: string; text: string }[];
  suggestion: { level: string; text: string; note: string }[];
}

function analyzeHnStructure($: cheerio.CheerioAPI, profession: string): HnStructureSuggestion {
  const current: { level: string; text: string }[] = [];

  (["h1", "h2", "h3"] as const).forEach((level) => {
    $(level).each((_, el) => {
      current.push({ level: level.toUpperCase(), text: $(el).text().trim().slice(0, 80) });
    });
  });

  // Suggestion d'une structure idéale type pour un praticien bien-être
  const suggestion = [
    {
      level: "H1",
      text: `[Votre prénom] — [Spécialité] à [Ville]`,
      note: "Un seul H1, votre identité professionnelle + localisation",
    },
    {
      level: "H2",
      text: "Mon approche de l'accompagnement",
      note: "Décrivez ce que vous faites sans termes médicaux",
    },
    {
      level: "H2",
      text: "Pour qui ?",
      note: "Décrivez les situations (pas les pathologies) que vous accompagnez",
    },
    {
      level: "H2",
      text: "Mes séances",
      note: "Format, durée, déroulement — concret et rassurant",
    },
    {
      level: "H2",
      text: "Questions fréquentes",
      note: "Excellent pour le SEO et pour rassurer les visiteurs",
    },
    {
      level: "H3",
      text: "Sous-thèmes selon votre spécialité",
      note: "Ex : « La naturopathie, c'est quoi ? », « Combien de séances ? »",
    },
  ];

  return { current, suggestion };
}

// ─── Détection des faux titres (texte visuellement titre, sans balise Hn) ─────

function detectFakeHeadings($: cheerio.CheerioAPI): string[] {
  const fakes: string[] = [];

  // Patterns de classes CSS courantes qui simulent un titre
  const headingClassPatterns = [
    /\btitle\b/i, /\bheading\b/i, /\bsubtitle\b/i, /\bsection[-_]?title\b/i,
    /\bh[1-6]\b/, /\btitre\b/i, /\bsous[-_]?titre\b/i,
  ];

  // 1. <p> ou <div> ou <span> avec une classe qui ressemble à un titre
  $("p, div, span").each((_, el) => {
    const classes = $(el).attr("class") || "";
    const isHeadingClass = headingClassPatterns.some(p => p.test(classes));
    if (!isHeadingClass) return;

    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 120 && !text.includes("\n")) {
      fakes.push(text.slice(0, 60));
    }
  });

  // 2. <p> avec font-size en inline style > 18px
  $("p[style], span[style], div[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const fontSizeMatch = style.match(/font-size\s*:\s*(\d+(?:\.\d+)?)(px|rem|em)/i);
    if (!fontSizeMatch) return;
    const size = parseFloat(fontSizeMatch[1]);
    const unit = fontSizeMatch[2].toLowerCase();
    const isLarge = (unit === "px" && size >= 18) || (unit === "rem" && size >= 1.2) || (unit === "em" && size >= 1.2);
    if (!isLarge) return;
    const text = $(el).text().trim();
    if (text.length > 3 && text.length < 120) {
      fakes.push(text.slice(0, 60));
    }
  });

  // 3. <p> contenant uniquement un <strong> ou <b> standalone (faux titre gras)
  $("p").each((_, el) => {
    const children = $(el).children();
    if (children.length === 1) {
      const child = children.first();
      if (child.is("strong, b")) {
        const text = child.text().trim();
        if (text.length > 5 && text.length < 100 && !text.includes(".")) {
          fakes.push(text.slice(0, 60));
        }
      }
    }
  });

  // Dédupliquer et limiter
  return Array.from(new Set(fakes)).slice(0, 5);
}

// ─── Champ lexical ────────────────────────────────────────────────────────────

function computeLexicalField(
  bodyText: string,
  titleText: string,
  h1Text: string,
  h2Texts: string[],
  allTextLower: string,
): LexicalField {
  const body = bodyText.toLowerCase();
  const title = titleText.toLowerCase();
  const h1 = h1Text.toLowerCase();
  const h2 = h2Texts.join(" ").toLowerCase();

  const seen = new Set<string>();
  const present: LexicalTerm[] = [];
  const absent: string[] = [];

  for (const kw of ACTIVITY_KEYWORDS) {
    const kwLower = kw.toLowerCase();
    const normalized = kwLower.replace(/[-\s]/g, "");
    if (seen.has(normalized)) continue;
    seen.add(normalized);

    const escaped = kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (body.match(new RegExp(escaped, "g")) || []).length;

    if (count > 0) {
      present.push({
        term: kw,
        count,
        inTitle: title.includes(kwLower),
        inH1: h1.includes(kwLower),
        inH2: h2.includes(kwLower),
      });
    } else {
      absent.push(kw);
    }
  }

  present.sort((a, b) => b.count - a.count);
  const hasLocalSignal = LOCAL_SIGNALS.some((p) => p.test(allTextLower));

  return { present, absent: absent.slice(0, 10), hasLocalSignal };
}

// ─── Génération des issues ────────────────────────────────────────────────────

function generateIssues(
  meta: SeoMetaResult,
  content: SeoContentResult,
  semantic: SemanticAnalysis,
  linking: InternalLinkingAnalysis,
  loadTimeMs: number,
  url: string,
  allText: string,
  titleText: string,
  h1Text2: string,
  firstParagraph: string,
  $: cheerio.CheerioAPI,
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  let i = 0;
  const id = () => `seo-${++i}`;

  // ── TECHNIQUE ──────────────────────────────────────────────────────────────
  if (!content.hasHttps) {
    issues.push({
      id: id(), category: "Technique", severity: "error",
      title: "Site non sécurisé (HTTP)",
      description: "Google pénalise les sites sans HTTPS dans son classement.",
      recommendation: "Activez un certificat SSL (gratuit avec Let's Encrypt via votre hébergeur).",
      url,
    });
  }

  if (!content.hasMobileViewport) {
    issues.push({
      id: id(), category: "Technique", severity: "error",
      title: "Non optimisé pour mobile",
      description: "Google indexe en priorité la version mobile de votre site.",
      recommendation: 'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans le <head>.',
      url,
    });
  }

  if (loadTimeMs > 3000) {
    issues.push({
      id: id(), category: "Technique", severity: "warning",
      title: `Chargement lent (${(loadTimeMs / 1000).toFixed(1)}s)`,
      description: "Un site qui met plus de 3s à charger perd 40% de ses visiteurs.",
      recommendation: "Compressez vos images (outil gratuit : Squoosh.app), réduisez les plugins inutiles.",
      url,
    });
  }

  // ── BALISES ────────────────────────────────────────────────────────────────
  if (!meta.titleTag) {
    issues.push({
      id: id(), category: "Balises", severity: "error",
      title: "Titre de page manquant",
      description: "La balise title est le signal SEO le plus important. Google l'affiche dans les résultats.",
      recommendation: "Rédigez un titre de 50–60 caractères : « [Votre prénom] — [Spécialité] à [Ville] »",
      url,
    });
  } else if (meta.titleLength < 30) {
    issues.push({
      id: id(), category: "Balises", severity: "warning",
      title: "Titre trop court",
      description: `Votre titre (${meta.titleLength} caractères) ne dit pas assez. Il manque probablement votre spécialité ou ville.`,
      recommendation: "Visez 50–60 caractères. Exemple : « Marie Dupont – Naturopathe à Lyon »",
      excerpt: meta.titleTag, url,
    });
  } else if (meta.titleLength > 60) {
    issues.push({
      id: id(), category: "Balises", severity: "warning",
      title: "Titre trop long",
      description: `Votre titre (${meta.titleLength} caractères) sera tronqué par Google au-delà de 60 caractères.`,
      recommendation: "Raccourcissez en gardant : prénom, spécialité, ville.",
      excerpt: meta.titleTag, url,
    });
  } else {
    issues.push({
      id: id(), category: "Balises", severity: "success",
      title: "Titre bien optimisé",
      description: `${meta.titleLength} caractères — parfait.`,
      excerpt: meta.titleTag, url,
      recommendation: "",
    });
  }

  if (!meta.metaDescription) {
    issues.push({
      id: id(), category: "Balises", severity: "error",
      title: "Description manquante",
      description: "La meta description apparaît sous votre titre dans Google. Elle influence le taux de clic.",
      recommendation: "Rédigez 150–160 caractères : qui vous êtes, ce que vous proposez, et un appel à l'action. Ex : « Naturopathe certifiée à Lyon, j'accompagne les personnes en recherche d'équilibre naturel. Prenez rendez-vous en ligne. »",
      url,
    });
  } else if (meta.metaDescriptionLength > 160) {
    issues.push({
      id: id(), category: "Balises", severity: "warning",
      title: "Description trop longue",
      description: `${meta.metaDescriptionLength} caractères — tronquée dans les résultats.`,
      recommendation: "Raccourcissez à 150–160 caractères.",
      excerpt: meta.metaDescription, url,
    });
  } else {
    issues.push({
      id: id(), category: "Balises", severity: "success",
      title: "Description bien optimisée",
      description: `${meta.metaDescriptionLength} caractères — idéal.`,
      excerpt: meta.metaDescription, url,
      recommendation: "",
    });
  }

  // ── STRUCTURE Hn ──────────────────────────────────────────────────────────
  if (content.h1Count === 0) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "error",
      title: "Aucun titre H1",
      description: "Le H1 est votre titre principal — signal clé pour Google sur le sujet de la page.",
      recommendation: "Ajoutez un H1 unique : votre prénom + spécialité + ville. Ex : « Marie Dupont — Naturopathe à Bordeaux »",
      url,
    });
  } else if (content.h1Count > 1) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "warning",
      title: `${content.h1Count} H1 détectés`,
      description: "Une seule page = un seul H1. Plusieurs H1 dispersent le signal SEO.",
      recommendation: "Gardez un seul H1, transformez les autres en H2.",
      excerpt: content.h1Text.join(" | "), url,
    });
  } else {
    issues.push({
      id: id(), category: "Structure Hn", severity: "success",
      title: "Un seul H1 — correct",
      description: `« ${content.h1Text[0]} »`,
      recommendation: "", url,
    });
  }

  if (content.h2Count === 0) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "warning",
      title: "Aucun titre H2",
      description: "Les H2 organisent votre contenu et aident Google à comprendre les thèmes de votre page.",
      recommendation: "Ajoutez des H2 pour chaque section : « Mon approche », « Pour qui ? », « Mes séances », « Questions fréquentes »",
      url,
    });
  } else if (content.h2Count < 3) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "info",
      title: `Seulement ${content.h2Count} H2`,
      description: "Votre page manque de structure. Une page bien organisée = meilleure lisibilité et meilleur SEO.",
      recommendation: "Visez 4–6 H2 pour structurer votre page d'accueil.",
      url,
    });
  }

  // ── SÉMANTIQUE & POSITIONNEMENT ───────────────────────────────────────────
  if (!semantic.hasActivityKeyword) {
    issues.push({
      id: id(), category: "Sémantique", severity: "error",
      title: "Votre activité n'est pas mentionnée",
      description: "Google ne peut pas savoir ce que vous faites si votre spécialité (naturopathe, coach, sophrologue…) n'apparaît pas clairement.",
      recommendation: "Mentionnez votre spécialité dans le titre, le H1 et les premiers paragraphes.",
      url,
    });
  }

  if (!semantic.hasLocalKeyword) {
    issues.push({
      id: id(), category: "Sémantique", severity: "warning",
      title: "Localisation absente",
      description: "Vos futurs clients cherchent « naturopathe Lyon » ou « coach Paris ». Sans localisation, vous êtes invisible sur ces recherches.",
      recommendation: "Ajoutez votre ville dans le titre, le H1 et la meta description. Si vous pratiquez en ligne, mentionnez-le aussi.",
      url,
    });
  }

  if (semantic.missingKeywordSuggestions.length > 0 && semantic.hasActivityKeyword) {
    issues.push({
      id: id(), category: "Sémantique", severity: "info",
      title: "Positionnement à préciser",
      description: "Votre page pourrait mieux communiquer votre approche spécifique.",
      recommendation: `Pensez à intégrer : ${semantic.missingKeywordSuggestions.join(", ")}.`,
      url,
    });
  }

  if (content.wordCount < 300) {
    issues.push({
      id: id(), category: "Contenu", severity: "warning",
      title: "Contenu trop court",
      description: `${content.wordCount} mots — insuffisant. Google privilégie les pages qui répondent vraiment aux questions des internautes.`,
      recommendation: "Visez 500–800 mots sur votre page d'accueil. Décrivez votre approche, vos séances, ce que vous accompagnez.",
      url,
    });
  } else if (content.wordCount >= 500) {
    issues.push({
      id: id(), category: "Contenu", severity: "success",
      title: `Bon volume de contenu (${content.wordCount} mots)`,
      description: "Votre page a suffisamment de contenu pour être bien indexée.",
      recommendation: "", url,
    });
  }

  // ── MAILLAGE INTERNE ──────────────────────────────────────────────────────
  if (linking.orphanRisk) {
    issues.push({
      id: id(), category: "Maillage interne", severity: "warning",
      title: "Peu de liens internes",
      description: `Seulement ${linking.internalLinkCount} lien(s) interne(s) détecté(s). Un bon maillage aide Google à explorer votre site et renforce les pages importantes.`,
      recommendation: "Ajoutez des liens vers vos pages clés : séances, tarifs, à propos, contact. Minimum 5–8 liens internes sur la page d'accueil.",
      url,
    });
  } else {
    issues.push({
      id: id(), category: "Maillage interne", severity: "success",
      title: `Maillage interne correct (${linking.internalLinkCount} liens)`,
      description: "Votre page est bien reliée au reste de votre site.",
      recommendation: "", url,
    });
  }

  if (!linking.hasNavigationMenu) {
    issues.push({
      id: id(), category: "Maillage interne", severity: "warning",
      title: "Menu de navigation non détecté",
      description: "Un menu clair aide vos visiteurs et Google à naviguer sur votre site.",
      recommendation: "Assurez-vous d'avoir un menu principal avec au minimum : Accueil, Séances/Prestations, À propos, Contact.",
      url,
    });
  }

  // ── IMAGES ────────────────────────────────────────────────────────────────
  if (content.imagesWithoutAlt > 0) {
    issues.push({
      id: id(), category: "Images", severity: "warning",
      title: `${content.imagesWithoutAlt} image(s) sans description`,
      description: `Google ne peut pas « lire » les images sans texte alternatif. Ces images sont invisibles pour les moteurs de recherche.`,
      recommendation: 'Ajoutez un attribut alt à chaque image. Ex : alt="consultation naturopathie lyon marie dupont"',
      url,
    });
  }

  // ── DONNÉES STRUCTURÉES ───────────────────────────────────────────────────
  if (meta.schemaMarkup.length === 0) {
    issues.push({
      id: id(), category: "Données structurées", severity: "warning",
      title: "Aucune donnée structurée Schema.org",
      description: "Les données structurées permettent à Google d'afficher votre nom, adresse, téléphone et horaires directement dans les résultats de recherche (rich snippets).",
      recommendation: "Ajoutez un schema LocalBusiness. Sur WordPress : plugin Rank Math ou Yoast. Sur Wix/Squarespace : paramètres SEO du site.",
      url,
    });
  } else {
    issues.push({
      id: id(), category: "Données structurées", severity: "success",
      title: `Schema.org détecté (${meta.schemaMarkup.join(", ")})`,
      description: "Vos données structurées sont en place — Google peut afficher des informations enrichies.",
      recommendation: "", url,
    });
  }

  // ── OPEN GRAPH ────────────────────────────────────────────────────────────
  if (!meta.ogImage) {
    issues.push({
      id: id(), category: "Réseaux sociaux", severity: "warning",
      title: "Pas d'image de partage (Open Graph)",
      description: "Quand quelqu'un partage votre site sur Facebook, Instagram ou LinkedIn, aucune image ne s'affiche. Cela réduit drastiquement le taux de clic.",
      recommendation: "Ajoutez une balise og:image avec une photo professionnelle de vous ou de votre espace (1200×630px recommandé).",
      url,
    });
  } else {
    issues.push({
      id: id(), category: "Réseaux sociaux", severity: "success",
      title: "Image de partage configurée",
      description: "Votre site affiche une image quand il est partagé sur les réseaux sociaux.",
      recommendation: "", url,
    });
  }

  if (!meta.ogTitle || !meta.ogDescription) {
    issues.push({
      id: id(), category: "Réseaux sociaux", severity: "warning",
      title: "Balises Open Graph incomplètes",
      description: "Le titre ou la description Open Graph manque. Vos partages sur les réseaux sociaux seront moins attractifs.",
      recommendation: "Ajoutez og:title et og:description dans votre CMS (Yoast, Rank Math, ou balises meta manuelles).",
      url,
    });
  }

  // ── DOUBLE PÉNALITÉ : contenu court + pas de localisation ────────────────
  if (content.wordCount < 300 && !semantic.hasLocalKeyword) {
    issues.push({
      id: id(), category: "Sémantique", severity: "error",
      title: "Double problème : contenu insuffisant ET localisation absente",
      description: "Votre page est trop courte ET ne mentionne pas votre ville. C'est la combinaison la plus pénalisante pour le SEO local — vous êtes quasiment invisible sur Google.",
      recommendation: "Priorité 1 : ajoutez votre ville dans le titre, H1 et meta description. Priorité 2 : développez votre page à 500+ mots en décrivant votre approche et vos séances.",
      url,
    });
  }

  // ── ANALYSE SÉMANTIQUE APPROFONDIE ───────────────────────────────────────

  // Densité mot-clé activité dans zones clés
  const activityInTitle = ACTIVITY_KEYWORDS.some(kw => titleText.includes(kw));
  const activityInH1 = ACTIVITY_KEYWORDS.some(kw => h1Text2.includes(kw));
  const activityInFirst = ACTIVITY_KEYWORDS.some(kw => firstParagraph.includes(kw));

  if (semantic.hasActivityKeyword && !activityInTitle && !activityInH1) {
    issues.push({
      id: id(), category: "Sémantique", severity: "warning",
      title: "Spécialité absente des zones clés",
      description: "Votre activité est mentionnée sur la page mais pas dans le titre ou le H1 — les zones les plus importantes pour Google.",
      recommendation: "Intégrez votre spécialité (naturopathe, sophrologue…) dans votre balise title ET votre H1.",
      url,
    });
  }

  if (semantic.hasActivityKeyword && !activityInFirst) {
    issues.push({
      id: id(), category: "Sémantique", severity: "info",
      title: "Spécialité tardive dans le contenu",
      description: "Votre activité n'apparaît pas dans le premier paragraphe de texte — Google accorde plus de poids aux mots en début de page.",
      recommendation: "Mentionnez votre spécialité dès les premières lignes de votre page.",
      url,
    });
  }

  // ── STRUCTURE H2 / H3 ────────────────────────────────────────────────────
  if (content.h2Count === 0 && content.wordCount > 200) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "warning",
      title: "Aucun H2 — page sans structure",
      description: "Votre page n'a pas de titres secondaires H2. Google utilise la hiérarchie des titres pour comprendre et indexer le contenu. Une page sans H2 semble plate et difficile à lire.",
      recommendation: "Ajoutez 3 à 5 H2 pour structurer votre page. Exemples : « Mon approche », « Pour qui est fait cet accompagnement ? », « Comment se déroule une séance ? », « Tarifs », « Questions fréquentes ».",
      url,
    });
  } else if (content.h2Count === 1 && content.wordCount > 400) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "info",
      title: "Un seul H2 pour beaucoup de contenu",
      description: `Votre page contient ${content.wordCount} mots mais un seul H2. Les grandes sections de texte sans titre sont difficiles à lire et à indexer.`,
      recommendation: "Visez 3 à 5 H2 pour découper le contenu en sections claires. Chaque H2 devrait introduire un thème distinct.",
      url,
    });
  } else if (content.h2Count >= 3) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "success",
      title: `${content.h2Count} titres H2 — bonne structure`,
      description: "Votre page est bien structurée avec plusieurs sections titrées.",
      recommendation: "", url,
    });
  }

  if (content.h2Count > 0 && content.h3Count === 0 && content.wordCount > 500) {
    issues.push({
      id: id(), category: "Structure Hn", severity: "info",
      title: "Aucun H3 — sous-sections absentes",
      description: "Les H3 permettent d'approfondir chaque section H2 avec des sous-titres. Ils améliorent la lisibilité et aident Google à comprendre la profondeur du contenu.",
      recommendation: "Sous chaque H2 dense, ajoutez 1 à 3 H3. Ex. sous « Comment se déroule une séance ? » → « La première séance », « Le déroulement type », « En ligne ou en présentiel ».",
      url,
    });
  }

  // ── FAUX TITRES (texte visuellement mis en forme comme titre, sans Hn) ─────
  const fakeHeadings = detectFakeHeadings($);
  if (fakeHeadings.length > 0) {
    const examples = fakeHeadings.map(t => `« ${t} »`).join(", ");
    issues.push({
      id: id(), category: "Structure Hn", severity: "warning",
      title: `${fakeHeadings.length} texte(s) visuellement mis en titre, sans balise Hn`,
      description: `Ces textes sont stylisés comme des titres (gras, grande taille, classe CSS) mais ne sont pas balisés H2/H3. Google les traite comme du texte ordinaire et ne les prend pas en compte pour la structure. Détectés : ${examples}.`,
      recommendation: "Remplacez le style visuel par une vraie balise H2 ou H3. Exemple : au lieu de <p class=\"titre\">Mon approche</p>, utilisez <h2>Mon approche</h2>. Sur WordPress/Wix, sélectionnez le texte et choisissez « Titre 2 » dans le menu de formatage.",
      url,
    });
  }

  return issues;
}

// ─── Analyse IA SEO (sémantique + Hn + GEO) ──────────────────────────────────

async function analyzeSeoWithAI(
  text: string,
  profession: string,
  hnStructure: HnStructureSuggestion,
  content: SeoContentResult
): Promise<string> {
  const client = new Anthropic();

  const currentHn = hnStructure.current.length > 0
    ? hnStructure.current.map(h => `${h.level} : « ${h.text} »`).join("\n")
    : "Aucun titre H2/H3 détecté.";

  const excerpt = text.slice(0, 3000);

  const prompt = `Tu es experte en SEO et en GEO (optimisation pour les moteurs de recherche IA comme ChatGPT, Perplexity, Gemini) pour les sites web de praticiens du bien-être en France.

Profession analysée : ${profession || "praticien bien-être"}
Nombre de mots : ${content.wordCount}
Titres H1 : ${content.h1Count} | H2 : ${content.h2Count} | H3 : ${content.h3Count}

Titres H2/H3 actuellement présents sur la page :
${currentHn}

Extrait du contenu de la page :
---
${excerpt}
---

Rédige une analyse SEO et GEO en 4 parties claires, concises et actionnables :

**1. Champ sémantique — mots présents et manquants**
Liste les 5-8 mots/expressions clés de la profession qui sont présents sur la page.
Liste les 5-8 mots/expressions importants pour le SEO local qui manquent, en les adaptant à la profession détectée (ex : pour une naturopathe, citer des termes spécifiques à la naturopathie).

**2. Structure H2/H3 — évaluation et suggestions**
Évalue chaque titre H2/H3 existant : est-il optimisé (contient un mot-clé, est clair) ou trop générique ?
Propose 3-4 titres H2 améliorés ou manquants, formulés avec des mots-clés naturels.
Indique si des H3 seraient utiles et lesquels.

**3. GEO — questions à ajouter pour apparaître dans les réponses IA**
Identifie 4-5 questions que les internautes posent aux IA (ChatGPT, Perplexity…) sur cette profession/ces thèmes.
Ces questions sont absentes de la page mais devraient être traitées sous forme de FAQ ou de paragraphes explicatifs pour apparaître dans les réponses générées par l'IA.

**4. Priorité n°1**
Une seule action concrète à faire en premier pour améliorer le référencement de cette page.

Réponse en français, ton professionnel et actionnable, pas de mise en forme excessive.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    messages: [{ role: "user", content: prompt }],
  });

  return (message.content[0] as { type: "text"; text: string }).text;
}

// ─── Score ────────────────────────────────────────────────────────────────────

function calculateScore(issues: AuditIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "error") score -= 20;
    else if (issue.severity === "warning") score -= 8;
    else if (issue.severity === "info") score -= 3;
  }
  return Math.max(0, Math.min(100, score));
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function analyzeSeo(
  url: string,
  options: { profession?: string; useAI?: boolean } = {}
): Promise<SeoScore & {
  hnStructure: HnStructureSuggestion;
  semantic: SemanticAnalysis;
  linking: InternalLinkingAnalysis;
}> {
  const profession = options.profession ?? "";
  const { html, loadTimeMs } = await fetchPage(url);
  const $ = cheerio.load(html);

  const meta = extractMeta($);
  const content = extractContent($, url);
  const semantic = analyzeSemantics($, meta);
  const linking = analyzeInternalLinking($, url);
  const hnStructure = analyzeHnStructure($, profession);
  const allText = ($("body").text() || "").toLowerCase();
  const titleText = ($("title").text() || "").toLowerCase();
  const h1TextSem = ($("h1").text() || "").toLowerCase();
  const firstParagraph = ($("p").first().text() || "").toLowerCase();
  const h2Texts = $("h2").map((_, el) => $(el).text().trim()).get();
  const issues = generateIssues(meta, content, semantic, linking, loadTimeMs, url, allText, titleText, h1TextSem, firstParagraph, $);
  const score = calculateScore(issues);

  const lexicalField = computeLexicalField(
    $("body").text(),
    meta.titleTag || "",
    content.h1Text.join(" "),
    h2Texts,
    allText,
  );

  let seoAiAnalysis: string | undefined;
  if (options.useAI) {
    try {
      seoAiAnalysis = await analyzeSeoWithAI(allText, profession, hnStructure, content);
    } catch (err) {
      console.error("SEO AI analysis failed:", err);
    }
  }

  return {
    score,
    grade: scoreToGrade(score),
    issues,
    meta,
    content,
    hnStructure,
    semantic,
    linking,
    seoAiAnalysis,
    lexicalField,
  };
}
