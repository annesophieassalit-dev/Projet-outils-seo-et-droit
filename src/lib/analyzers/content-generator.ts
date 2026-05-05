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

    article_blog: `Rédige un article de blog pour ${profession}.

Thèmes : ${themesText}
Longueur : 400–600 mots

Structure :
- Titre accrocheur et naturel (optimisé SEO, sans majuscules excessives)
- Introduction : situation vécue par le lecteur (pas de promesse)
- Développement : 3-4 paragraphes courts, pédagogiques, accessibles
- Conclusion : invitation douce à en savoir plus ou à prendre contact

Optimisation SEO :
- Utiliser naturellement les mots-clés de la profession
- Phrases courtes, lisibles, sans jargon
- Ton : ${toneInstruction}`,

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

    fiche_google: `Rédige la description pour une fiche Google My Business pour ${profession}.

Longueur : 250 caractères maximum (Google tronque au-delà)

Optimisation locale :
- Mentionner la spécialité + l'approche + le public accompagné (thèmes : ${themesText})
- Si des informations de localisation sont fournies, les inclure naturellement
- Mots-clés locaux en priorité (ville + activité)
- Finir par un appel à l'action simple (ex : "Prenez rendez-vous.")

Objectif : apparaître dans les recherches locales + donner envie de cliquer.`,

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

    post_tiktok: `Rédige un script de vidéo courte TikTok pour ${profession} sur les thèmes : ${themesText}.

Format script TikTok (60 à 90 secondes) :
- Structure en 3 temps clairement marqués :
  [0–5 sec] ACCROCHE : 1 phrase choc ou question qui stoppe le scroll — doit créer une curiosité immédiate
  [5–55 sec] CONTENU : 3 à 4 points courts, énoncés simplement, parlés naturellement — pas de jargon
  [55–90 sec] FIN : message fort + invitation douce à s'abonner ou découvrir le lien en bio
- Écris comme on parle, pas comme on écrit
- Chaque phrase = maximum 10 mots — le montage TikTok est rapide
- Indique entre crochets les intentions visuelles si pertinent : [sourire], [montrer les mains], [texte à l'écran]
- Suggestion de 3 hashtags niche en fin : 1 activité + 1 thème + 1 local ou situation
- Ton : ${toneInstruction}`,

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
  };

  const specificitesText = specificites
    ? `\n\nInformations supplémentaires fournies par le praticien : ${specificites}`
    : "";

  return `${contentInstructions[contentType]}

Intention : ${intentionInstruction}${specificitesText}

Après le contenu, ajoute sur une nouvelle ligne séparée par "---" :
Note de conformité en 1 phrase (pour le praticien uniquement) : pourquoi ce contenu est safe juridiquement.`;
}

// ─── Générateur principal ─────────────────────────────────────────────────────

export async function generateContent(input: GeneratorInput): Promise<GeneratedContent> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const raw = (message.content[0] as { type: "text"; text: string }).text;
  const parts = raw.split("---");
  const content = parts[0].trim();
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
