import * as cheerio from "cheerio";
import type {
  SeoScore,
  SeoMetaResult,
  SeoContentResult,
  AuditIssue,
} from "@/types/audit";
import { scoreToGrade } from "@/lib/utils";

// ─── Fetch avec timeout ───────────────────────────────────────────────────────

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "ConformiWeb-Bot/1.0 (+https://conformiweb.fr/bot)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Extraction meta ─────────────────────────────────────────────────────────

function extractMeta($: cheerio.CheerioAPI, baseUrl: string): SeoMetaResult {
  const titleTag = $("title").first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr("content")?.trim() || null;
  const canonicalUrl =
    $('link[rel="canonical"]').attr("href")?.trim() || null;
  const robotsMeta =
    $('meta[name="robots"]').attr("content")?.trim() || null;
  const ogTitle =
    $('meta[property="og:title"]').attr("content")?.trim() || null;
  const ogDescription =
    $('meta[property="og:description"]').attr("content")?.trim() || null;
  const ogImage =
    $('meta[property="og:image"]').attr("content")?.trim() || null;

  // Détecter les schemas JSON-LD
  const schemaMarkup: string[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || "{}");
      if (json["@type"]) schemaMarkup.push(json["@type"]);
    } catch {
      // JSON mal formé, on ignore
    }
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

function extractContent(
  $: cheerio.CheerioAPI,
  url: string
): SeoContentResult {
  const h1 = $("h1");
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
  const parsedUrl = new URL(url);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    try {
      const linkUrl = new URL(href, url);
      if (linkUrl.hostname === parsedUrl.hostname) internalLinks++;
      else externalLinks++;
    } catch {
      // lien relatif ou invalide
    }
  });

  const hasMobileViewport =
    $('meta[name="viewport"]').attr("content")?.includes("width=device-width") ?? false;

  return {
    h1Count: h1.length,
    h1Text: h1
      .map((_, el) => $(el).text().trim())
      .get()
      .slice(0, 5),
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

// ─── Génération des problèmes ─────────────────────────────────────────────────

function generateSeoIssues(
  meta: SeoMetaResult,
  content: SeoContentResult,
  url: string
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  let i = 0;
  const id = () => `seo-${++i}`;

  // HTTPS
  if (!content.hasHttps) {
    issues.push({
      id: id(),
      category: "Sécurité",
      severity: "error",
      title: "Site non sécurisé (HTTP)",
      description:
        "Votre site n'utilise pas HTTPS. Google pénalise les sites non sécurisés dans son classement.",
      recommendation:
        "Activez un certificat SSL/TLS (gratuit avec Let's Encrypt). Contactez votre hébergeur.",
      url,
    });
  }

  // Balise title
  if (!meta.titleTag) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "error",
      title: "Balise <title> manquante",
      description:
        "Votre page n'a pas de balise title. C'est le critère SEO le plus important.",
      recommendation:
        "Ajoutez une balise <title> entre 50 et 60 caractères décrivant précisément votre activité et localisation.",
      url,
    });
  } else if (meta.titleLength < 30) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "warning",
      title: "Balise <title> trop courte",
      description: `Votre title ne fait que ${meta.titleLength} caractères. Il manque probablement votre spécialité ou localisation.`,
      recommendation:
        "Visez 50–60 caractères. Exemple : « Naturopathe à Lyon | Marie Dupont – Bien-être naturel »",
      excerpt: meta.titleTag,
      url,
    });
  } else if (meta.titleLength > 60) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "warning",
      title: "Balise <title> trop longue",
      description: `Votre title fait ${meta.titleLength} caractères. Google tronque au-delà de 60 caractères dans les résultats de recherche.`,
      recommendation: "Raccourcissez à 50–60 caractères en priorisant les mots-clés principaux.",
      excerpt: meta.titleTag,
      url,
    });
  } else {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "success",
      title: "Balise <title> bien optimisée",
      description: `Votre title fait ${meta.titleLength} caractères, dans la plage idéale.`,
      recommendation: "",
      excerpt: meta.titleTag,
      url,
    });
  }

  // Meta description
  if (!meta.metaDescription) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "error",
      title: "Meta description manquante",
      description:
        "Aucune meta description trouvée. Google génère alors lui-même un extrait, souvent peu engageant.",
      recommendation:
        "Ajoutez une meta description de 150–160 caractères avec un appel à l'action et vos mots-clés.",
      url,
    });
  } else if (meta.metaDescriptionLength < 100) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "warning",
      title: "Meta description trop courte",
      description: `Votre meta description ne fait que ${meta.metaDescriptionLength} caractères.`,
      recommendation: "Visez 150–160 caractères pour maximiser l'espace dans les résultats Google.",
      excerpt: meta.metaDescription,
      url,
    });
  } else if (meta.metaDescriptionLength > 160) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "warning",
      title: "Meta description trop longue",
      description: `Votre meta description fait ${meta.metaDescriptionLength} caractères et sera tronquée par Google.`,
      recommendation: "Raccourcissez à 150–160 caractères en conservant les informations essentielles.",
      excerpt: meta.metaDescription,
      url,
    });
  } else {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "success",
      title: "Meta description bien optimisée",
      description: `Votre meta description fait ${meta.metaDescriptionLength} caractères.`,
      recommendation: "",
      excerpt: meta.metaDescription,
      url,
    });
  }

  // H1
  if (content.h1Count === 0) {
    issues.push({
      id: id(),
      category: "Structure de contenu",
      severity: "error",
      title: "Aucune balise H1",
      description:
        "Votre page n'a pas de titre principal H1. C'est un signal fort pour Google sur le sujet de la page.",
      recommendation:
        "Ajoutez un seul H1 décrivant clairement votre activité principale. Ex : « Naturopathe certifiée à Bordeaux »",
      url,
    });
  } else if (content.h1Count > 1) {
    issues.push({
      id: id(),
      category: "Structure de contenu",
      severity: "warning",
      title: `${content.h1Count} balises H1 détectées`,
      description:
        "Une page doit avoir un seul H1. Plusieurs H1 diluent le signal SEO et désorienten la hiérarchie.",
      recommendation: "Conservez un seul H1 et transformez les autres en H2 ou H3.",
      excerpt: content.h1Text.join(" | "),
      url,
    });
  } else {
    issues.push({
      id: id(),
      category: "Structure de contenu",
      severity: "success",
      title: "Un seul H1 — correct",
      description: `H1 : « ${content.h1Text[0]} »`,
      recommendation: "",
      url,
    });
  }

  // Images sans alt
  if (content.imagesWithoutAlt > 0) {
    issues.push({
      id: id(),
      category: "Accessibilité & SEO",
      severity: content.imagesWithoutAlt > 3 ? "error" : "warning",
      title: `${content.imagesWithoutAlt} image(s) sans attribut alt`,
      description: `${content.imagesWithoutAlt} de vos ${content.totalImages} images n'ont pas de description alt. Google ne peut pas les indexer.`,
      recommendation:
        "Ajoutez un attribut alt descriptif à chaque image. Ex : alt=\"consultation naturopathie bien-être Paris\"",
      url,
    });
  }

  // Viewport mobile
  if (!content.hasMobileViewport) {
    issues.push({
      id: id(),
      category: "Mobile",
      severity: "error",
      title: "Site non optimisé pour mobile",
      description:
        "La balise viewport est manquante. Google indexe en priorité la version mobile (Mobile-First Indexing).",
      recommendation:
        'Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1"> dans le <head>.',
      url,
    });
  }

  // Open Graph
  if (!meta.ogTitle || !meta.ogDescription || !meta.ogImage) {
    issues.push({
      id: id(),
      category: "Réseaux sociaux",
      severity: "info",
      title: "Balises Open Graph incomplètes",
      description:
        "Les balises Open Graph sont utilisées par Facebook, Instagram, LinkedIn pour afficher un aperçu de votre page. Il en manque.",
      recommendation:
        "Ajoutez og:title, og:description et og:image pour contrôler l'affichage de vos partages sociaux.",
      url,
    });
  }

  // Schema markup
  if (meta.schemaMarkup.length === 0) {
    issues.push({
      id: id(),
      category: "Données structurées",
      severity: "info",
      title: "Pas de données structurées (Schema.org)",
      description:
        "Les données structurées permettent à Google d'afficher des rich snippets dans les résultats : avis, horaires, localisation.",
      recommendation:
        "Ajoutez au minimum un schema LocalBusiness ou HealthAndBeautyBusiness avec votre nom, adresse, téléphone et horaires.",
      url,
    });
  }

  // Contenu
  if (content.wordCount < 300) {
    issues.push({
      id: id(),
      category: "Contenu",
      severity: "warning",
      title: "Page trop courte en contenu",
      description: `Votre page ne contient que ${content.wordCount} mots. Google privilégie les pages avec un contenu substantiel.`,
      recommendation:
        "Visez minimum 500 mots par page importante. Décrivez votre approche, vos prestations, vos bénéfices.",
      url,
    });
  }

  // Canonical
  if (!meta.canonicalUrl) {
    issues.push({
      id: id(),
      category: "Balises meta",
      severity: "info",
      title: "URL canonique non définie",
      description:
        "L'absence d'URL canonique peut entraîner du contenu dupliqué si votre page est accessible via plusieurs URLs.",
      recommendation: "Ajoutez une balise <link rel=\"canonical\" href=\"URL-principale\"> dans le <head>.",
      url,
    });
  }

  return issues;
}

// ─── Score SEO ────────────────────────────────────────────────────────────────

function calculateSeoScore(issues: AuditIssue[]): number {
  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "error") score -= 15;
    else if (issue.severity === "warning") score -= 5;
    else if (issue.severity === "info") score -= 2;
  }
  return Math.max(0, Math.min(100, score));
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function analyzeSeo(url: string): Promise<SeoScore> {
  const html = await fetchPage(url);
  const $ = cheerio.load(html);

  const meta = extractMeta($, url);
  const content = extractContent($, url);
  const issues = generateSeoIssues(meta, content, url);
  const score = calculateSeoScore(issues);

  return {
    score,
    grade: scoreToGrade(score),
    issues,
    meta,
    content,
  };
}
