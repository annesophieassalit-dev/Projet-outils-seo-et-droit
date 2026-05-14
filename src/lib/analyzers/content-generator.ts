import Anthropic from "@anthropic-ai/sdk";
import type { GeneratorInput, GeneratedContent, ContentType } from "@/types/scanner";

// ─── Prompt système — règles immuables ───────────────────────────────────────

const SYSTEM_PROMPT = `Tu es une assistante spécialisée en communication pour les praticiens du bien-être non réglementés en France (naturopathes, coachs, hypnothérapeutes, sophrologues, réflexologues, etc.).

Ta mission : aider ces praticiens à écrire des contenus à la fois visibles, performants sur les réseaux sociaux, et juridiquement sûrs.

## Règles absolues (ne jamais enfreindre)

INTERDITS dans tous les contenus :
- Termes d'actes médicaux : soigner, traiter, diagnostiquer, guérir, prescrire, ordonnance, rééduquer, rétablir
- Titres protégés : docteur, médecin, infirmier, psychologue clinicien, psychothérapeute, clinicien, expert médical
- Lieux médicaux : clinique, cabinet médical, centre de soins
- Pathologies avec promesse d'action : "je traite la dépression", "soulage le diabète", "élimine l'anxiété"
- Promesses de résultats : "résultats garantis", "100% efficace", "prouvé scientifiquement", "immédiat", "définitif", "radical"
- Allégations : "miracle", "révolutionnaire", "remède", "je garantis"
- Superlatifs non prouvés : "le meilleur", "unique en France"
- Pression commerciale : "dernières places", "offre limitée", urgence artificielle

TOUJOURS utiliser :
- Accompagnement, soutien, exploration, chemin, espace, présence
- "personnes qui traversent / vivent / rencontrent [situation]" (jamais "patients atteints de")
- Nuances : "peut contribuer à", "favorise", "soutient", "selon les personnes", "à votre rythme"
- Précision du rôle : "praticien(ne) bien-être", "accompagnateur(trice)"
- Ton posé et crédible — jamais clinique ni vendeur agressif

## Ton par défaut
Posé, professionnel, humain, crédible. Le contenu doit inspirer confiance, pas l'urgence d'acheter.`;

// ─── Prompts par type de contenu ──────────────────────────────────────────────

function buildPrompt(input: GeneratorInput): string {
  const { contentType, profession, themes, specificites, tone, intention } = input;

  const toneDescriptions: Record<string, string> = {
    professionnel: "professionnel et posé, sobre, inspire la crédibilité",
    chaleureux: "chaleureux et humain, proche, accessible sans être familier",
    sobre: "sobre et minimaliste, épuré, va à l'essentiel",
  };

  const intentionInstructions: Record<string, string> = {
    faire_connaitre: "L'objectif de ce contenu est de faire découvrir l'approche et l'univers du praticien. Privilégie la narration, le partage de vision, le 'pourquoi'. Aucun appel à l'action direct.",
    inviter_contact: "L'objectif de ce contenu est d'inciter doucement à prendre contact ou à réserver une séance. Termine par une invitation naturelle, sans pression ni urgence artificielle.",
    expliquer: "L'objectif de ce contenu est d'expliquer clairement ce que le praticien propose : son approche, son déroulé, pour qui c'est fait. Sois pédagogique et rassurant.",
  };

  const toneInstruction = toneDescriptions[tone || "chaleureux"];
  const intentionInstruction = intentionInstructions[intention || "faire_connaitre"];
  const themesText = themes.length > 0 ? themes.join(", ") : "bien-être général";

  const contentInstructions: Record<ContentType, string> = {
    bio_instagram: `Rédige une bio Instagram percutante pour ${profession}.

Contraintes strictes :
- 150 caractères maximum (compter espaces et emojis)
- Structure : [Ce que tu fais · Pour qui · Lien d'action]
- 1 à 2 emojis maximum, choisis sobrement
- Accroche immédiate : les 3 premiers mots doivent retenir l'attention
- Call-to-action sobre en fin (ex : "→ lien en bio", "Prendre rdv ↓")
- Ton : ${toneInstruction}

Objectif performance : une bio Instagram efficace doit dire en un coup d'œil QUI tu es, POUR QUI tu travailles, et QUOI faire ensuite.`,

    presentation_activite: `Rédige un texte de présentation d'activité pour ${profession}.

Structure et longueur :
- 150–200 mots
- §1 : l'approche (comment tu travailles, pas ce que tu "guéris")
- §2 : les situations accompagnées, thèmes : ${themesText}
- §3 : une phrase d'invitation sobre (pas de pression)

Optimisation SEO + clarté :
- Utiliser naturellement des mots-clés de la profession (ex: naturopathe, accompagnement, bien-être)
- Phrases courtes, lisibles, sans jargon
- Ton : ${toneInstruction}`,

    article_blog: `Rédige un article de blog COMPLET et SEO-friendly pour ${profession}.

Thèmes : ${themesText}
Longueur obligatoire : 850–1000 mots rédigés (pas un plan, pas un résumé — du texte complet)

Structure sémantique SEO à respecter — indique chaque balise Hn explicitement :

H1 (titre principal) : accrocheur, contient le mot-clé principal de la profession, 55–65 caractères
Méta-description suggérée : 1 phrase de 140–155 caractères, résume l'article et donne envie de cliquer

Introduction (sans balise) : 80–100 mots — situation vécue par le lecteur, accroche empathique, annonce du plan. Pas de promesse de résultat.

H2 — Première section : présente le contexte ou le problème (150–180 mots)
  H3 — Sous-point si pertinent (60–80 mots)

H2 — Deuxième section : l'approche ou les solutions pratiques (150–180 mots)
  H3 — Sous-point si pertinent (60–80 mots)

H2 — Troisième section : conseils concrets ou ce que l'accompagnement apporte (150–180 mots)
  H3 — Sous-point si pertinent (60–80 mots)

H2 — Conclusion : synthèse en 2-3 phrases + invitation douce à prendre contact ou en savoir plus

Optimisation SEO sémantique :
- Champ lexical riche autour du thème principal : utiliser des synonymes, expressions proches, termes associés
- Mots-clés secondaires intégrés naturellement dans les H2 et H3
- Phrases courtes et lisibles (max 20 mots), pas de jargon
- Ton : ${toneInstruction}

Important : rédige tout le texte de chaque section en entier. Indique les balises entre crochets : [H1], [H2], [H3], [Méta-description].`,

    post_linkedin: `Rédige un post LinkedIn optimisé pour la portée organique, pour ${profession}.

Thèmes : ${themesText}
Longueur : 200–280 mots

Structure optimisée pour l'algorithme LinkedIn :
- Ligne 1 (accroche) : affirmation courte ou observation, sans point d'exclamation, sans question rhétorique — doit donner envie de cliquer "voir plus"
- Ne PAS commencer par "Je"
- Ligne 2 : saut de ligne (espace vide intentionnel)
- Développement : 4–6 paragraphes courts (2–3 lignes max chacun), espacés
- Avant-dernière ligne : question ouverte sobre pour encourager les commentaires
- Dernière ligne : call-to-action discret (ex : "Lien en commentaire." ou "En savoir plus dans ma bio.")
- Pas de hashtags dans le corps — 3 hashtags maximum à la toute fin

Ton : ${toneInstruction}`,

    fiche_google: `Rédige la description complète pour une fiche Google Business Profile pour ${profession}.

Longueur : 600–750 caractères (Google autorise 750 caractères — utilise cet espace pour être complet et convaincant)

Structure en 3 temps :
1. Présentation de l'activité et de l'approche (2-3 phrases)
2. Public accompagné et thèmes traités : ${themesText} (1-2 phrases)
3. Appel à l'action local (1 phrase, ex : "Consultations à [ville] et en ligne. Prenez rendez-vous.")

Optimisation locale :
- Intégrer naturellement la spécialité + ville si fournie
- Mots-clés locaux : activité + lieu
- Ton sobre et professionnel, inspire confiance

Objectif : apparaître dans les recherches locales + donner envie de cliquer sur la fiche.`,

    post_instagram: `Rédige un post Instagram pour ${profession}.

Thèmes : ${themesText}
Longueur : 150–220 mots (caption) + éléments de performance

Structure optimisée pour Instagram :
- Ligne 1 (accroche) : 1 phrase courte et percutante, visible avant "voir plus" — déclaration, chiffre, ou observation concrète
- Corps : 3–4 paragraphes courts (2–3 lignes), espacés, lisibles sur mobile
- 2–3 emojis maximum, placés avec intention (pas décoratifs)
- Appel à l'action final sobre : question courte ou invitation
- 5 hashtags en fin, séparés du texte par un saut de ligne :
  * 2 hashtags de niche (ex: #naturopathie #accompagnementbienetre)
  * 2 hashtags de situation (liés aux thèmes)
  * 1 hashtag local si pertinent

Ton : ${toneInstruction}`,

    accroche_site: `Rédige une accroche de page d'accueil pour ${profession}.

Structure :
- H1 : 1 phrase, 50–65 caractères maximum (Google affiche ~60 caractères), claire sur le rôle
- Sous-titre : 2–3 phrases, 100–150 mots, présente l'approche + les personnes accompagnées + la promesse d'accompagnement (pas de résultat)

Optimisation SEO :
- H1 : inclure naturellement le mot-clé principal (ex: "naturopathe à [ville]" ou "accompagnement bien-être")
- Sous-titre : phrases lisibles, mot-clés secondaires inclus naturellement
- Ton : ${toneInstruction}`,

    post_facebook: `Rédige un post Facebook pour ${profession} sur les thèmes : ${themesText}.

Format Facebook :
- Ton communautaire et chaleureux — Facebook = lien humain, proximité, partage
- Longueur idéale : 80–150 mots (le texte complet est visible sans "voir plus")
- Commence par une question ou une observation du quotidien qui parle directement à ta communauté
- 1 à 2 sauts de ligne pour aérer
- Termine par une question simple qui invite les commentaires (l'algorithme Facebook valorise les échanges)
- Maximum 2 hashtags, placés en fin de post — les hashtags ont peu d'impact sur Facebook
- Pas d'emojis excessifs : 1 à 3 maximum, naturels
- Ton : ${toneInstruction}`,

    post_tiktok: `Rédige le script COMPLET d'une vidéo courte TikTok pour ${profession} sur les thèmes : ${themesText}.

Format script TikTok (60 à 90 secondes) — rédige les 3 parties en entier :

[0–5 sec] ACCROCHE
1 phrase choc ou question qui stoppe le scroll. Doit créer une curiosité immédiate.

[5–55 sec] CONTENU
3 à 4 points numérotés, chacun sur 1-2 phrases courtes. Écrits comme on parle, pas comme on écrit. Maximum 10 mots par phrase.
Indique entre crochets les intentions visuelles : [sourire], [montrer les mains], [texte à l'écran : "…"]

[55–90 sec] FIN
1 message fort de conclusion + invitation douce à s'abonner ou découvrir le lien en bio.

Puis sur une nouvelle ligne : 3 hashtags niche (1 activité + 1 thème + 1 local ou situation)

Ton : ${toneInstruction}

Important : rédige les 3 parties en entier, du début à la fin du script.`,

    post_threads: `Rédige un post Threads pour ${profession} sur les thèmes : ${themesText}.

Format Threads :
- 500 caractères maximum — chaque mot compte
- Ton direct, authentique, légèrement personnel — Threads = micro-blog conversationnel
- 1 seule idée par post, exprimée avec clarté et impact
- Peut commencer par une affirmation courte, une question, ou une observation tranchée
- Pas de hashtags (inutiles sur Threads)
- Pas d'emojis ou 1 maximum — la force vient des mots, pas de la mise en forme
- Se termine par une phrase ouverte ou une invitation à réagir, jamais par un lien direct
- Ton : ${toneInstruction}`,

    hook_reseaux: `Génère 5 accroches (hooks) percutantes pour ${profession}, adaptées aux réseaux sociaux, sur les thèmes : ${themesText}.

Ces hooks sont des premières phrases destinées à stopper le scroll et donner envie de lire la suite. Chacun doit être utilisable indépendamment comme première ligne d'un post Instagram, LinkedIn, Facebook ou Threads.

Produis exactement 5 hooks numérotés, chacun d'un type différent :

1. **Hook Empathie** — parle directement à une situation vécue par ton lecteur (ex : "Vous avez l'impression de tourner en rond malgré tous vos efforts ?")
2. **Hook Affirmation** — une déclaration courte et tranchée qui crée une friction positive (ex : "Ce n'est pas votre volonté qui manque.")
3. **Hook Curiosité** — crée une attente, une question implicite (ex : "Il y a une chose que personne ne dit sur la fatigue chronique.")
4. **Hook Identification** — une observation concrète du quotidien que le lecteur reconnaît immédiatement (ex : "Se lever fatigué alors qu'on a dormi 8h…")
5. **Hook Storytelling** — une amorce de récit courte, commence par une scène ou un moment (ex : "Une de mes clientes m'a dit une phrase qui m'a marquée.")

Règles :
- Maximum 15 mots par hook
- Jamais de promesses de résultats ni de termes médicaux
- Ton : ${toneInstruction}
- Ne PAS inclure de suite ou développement — juste la première phrase d'accroche

Après les 5 hooks, ajoute une ligne : "💡 Conseil d'usage : combinez l'accroche avec un développement en 3–4 paragraphes courts."`,

    script_youtube: `Rédige un script de vidéo YouTube pour ${profession} sur les thèmes : ${themesText}.

Format script YouTube (5 à 8 minutes, environ 600–900 mots parlés) :

[0–30 sec] INTRODUCTION : accroche forte + annonce du sujet + promesse de valeur ("Dans cette vidéo, vous allez comprendre…")
[30 sec–5 min] DÉVELOPPEMENT : 3 points principaux, chacun structuré en : point clé → explication simple → exemple ou anecdote
[5–7 min] APPROFONDISSEMENT : conseils pratiques, ce que le spectateur peut faire concrètement
[7–8 min] CONCLUSION : résumé en 2-3 phrases + invitation à s'abonner ou commenter ("Dites-moi en commentaire…")

Format de rédaction :
- Écris comme on parle, phrases courtes et naturelles
- Indique entre crochets les intentions visuelles : [sourire], [montrer un document], [coupe], [texte à l'écran : "…"]
- Chaque paragraphe = une idée, maximum 3 phrases
- Inclure 1–2 moments de pause ("Prenez le temps d'y réfléchir…")
- Titre suggéré en fin + description courte pour YouTube (150 mots SEO-friendly)

Ton : ${toneInstruction}`,

    post_google: `Rédige un post Google Business Profile pour ${profession} sur les thèmes : ${themesText}.

Un post Google Business est une courte publication visible directement sur la fiche Google — c'est un contenu éphémère (7 jours) qui sert à montrer que la fiche est active et à attirer des clics.

Longueur : 200–300 mots (Google affiche les 100 premiers mots, le reste est visible en cliquant "voir plus")

Structure :
- Ligne d'accroche (les 100 premiers mots doivent être autonomes et donner envie de lire la suite)
- Corps : 2-3 paragraphes courts sur le thème, pédagogiques, accessibles
- Appel à l'action final clair et sobre : "Prenez rendez-vous", "Contactez-moi", "En savoir plus"

Optimisation locale :
- Mentionner naturellement la profession + ville si fournie
- Intégrer 1-2 mots-clés de recherche locale (ex: "naturopathe Lyon", "sophrologie en ligne")
- Ton communautaire et de proximité

Ton : ${toneInstruction}`,
  };

  const specificitesText = specificites
    ? `\n\nInformations supplémentaires fournies par le praticien : ${specificites}`
    : "";

  return `${contentInstructions[contentType]}

Intention : ${intentionInstruction}${specificitesText}

RÈGLE DE FOCUS (impérative) :
Ce contenu doit traiter UN SEUL angle ou sujet précis. Si plusieurs thèmes sont listés, choisis celui qui semble le plus pertinent pour ce type de contenu et développe-le en profondeur. Ne cherche pas à tout couvrir. Un contenu ciblé sur une seule idée est toujours plus efficace qu'un contenu qui survole plusieurs sujets.

RÈGLES DE FORMAT (impératives) :
- Ne commence PAS par un label ou une étiquette de type (ex: "POST INSTAGRAM —", "SCRIPT TIKTOK :", "Voici votre contenu", etc.)
- Commence DIRECTEMENT par le contenu lui-même
- Exception : pour un article de blog ou un script YouTube, commence par le titre du contenu (pas par un label technique)

Après le contenu, ajoute sur une nouvelle ligne séparée par "---" :
Note de conformité en 1 phrase (pour le praticien uniquement) : pourquoi ce contenu est safe juridiquement.`;
}

// ─── Tokens par type de contenu ───────────────────────────────────────────────

const MAX_TOKENS_BY_TYPE: Record<string, number> = {
  article_blog: 3500,
  script_youtube: 3500,
  post_tiktok: 1500,
  presentation_activite: 1200,
  fiche_google: 800,
  post_google: 900,
};

function maxTokensFor(contentType: string): number {
  return MAX_TOKENS_BY_TYPE[contentType] ?? 1000;
}

// ─── Générateur principal ─────────────────────────────────────────────────────

export async function generateContent(input: GeneratorInput): Promise<GeneratedContent> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokensFor(input.contentType),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const raw = (message.content[0] as { type: "text"; text: string }).text;
  const parts = raw.split("---");
  const rawContent = parts[0].trim();
  // Strip any residual markdown title line at the start (e.g. "**POST INSTAGRAM — …**")
  const content = rawContent.replace(/^\*\*[^\n]+\*\*\s*\n?/, "").trim();
  const complianceNote = parts[1]?.trim() || "Contenu rédigé en respectant les règles applicables aux praticiens du bien-être non réglementés.";

  return { contentType: input.contentType, content, complianceNote };
}

// ─── Variante ─────────────────────────────────────────────────────────────────

export async function generateVariant(
  original: string,
  contentType: ContentType,
  profession: string
): Promise<string> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: `Propose une variante de ce contenu (${contentType}) pour ${profession}.
Même sens, même informations — angle ou tournure différente.
Si c'est un post réseau social, adapte aussi la structure et l'accroche.
Respecte toutes les règles de communication prudente.

Contenu original :
${original}

Variante :`,
    }],
  });

  return (message.content[0] as { type: "text"; text: string }).text.trim();
}
