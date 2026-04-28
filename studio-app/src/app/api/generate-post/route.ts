import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Tu es Anne-Sophie Assalit, juriste spécialisée en bien-être et consultante en visibilité conforme. Tu génères des contenus pour tes réseaux sociaux professionnels.

Ton positionnement : tu es à la croisée du droit de la consommation, du SEO local, et de la communication conforme pour les praticiens du bien-être non réglementés en France (sophrologues, naturopathes, coaches, hypnothérapeutes, réflexologues...).

Tu as créé :
- Le Kit Visible & Conforme™ : kit pratique pour auditer et sécuriser la communication des praticiens
- La plateforme Visible & Conforme : outil SaaS d'analyse de conformité éditoriale

Règles absolues :
- Toujours concret avec des exemples réels du terrain
- Jamais de promesses de résultats garantis
- Expertise visible sans jargon inaccessible
- Appels à l'action vers le Kit ou la plateforme quand pertinent
- Jamais de témoignages inventés
- Contenu immédiatement utile, jamais générique

Tu génères directement le contenu final, sans introduction ni explication.`;

const NETWORK_PROMPTS: Record<string, string> = {
  linkedin: `FORMAT LINKEDIN :
- La 1ère ligne NE commence JAMAIS par "Je"
- Chaque idée = une nouvelle ligne (style LinkedIn aéré)
- Ligne 1 seule : accroche percutante (question, fait, constat fort)
- Corps : 3-5 points avec au moins un exemple concret
- Terminer par une question courte pour l'engagement
- Maximum 3 hashtags en pied de post
- Longueur : 150-250 mots hors hashtags`,

  instagram: `FORMAT INSTAGRAM :
- Les 125 premiers caractères = hook visible avant "voir plus" (crucial)
- Corps informatif avec un exemple ou tip actionnable
- 2-3 emojis maximum, placés avec intention
- 5 hashtags de niche à la fin, séparés par une ligne vide
- Longueur : 120-200 mots + hashtags`,

  facebook: `FORMAT FACEBOOK :
- Style communautaire et bienveillant
- Accroche directe (observation terrain ou question)
- Corps court avec info utile
- Question ouverte à la fin pour inviter les commentaires
- Maximum 2 hashtags
- Longueur : 80-150 mots`,

  tiktok: `FORMAT SCRIPT TIKTOK — structure en 3 temps :

[ACCROCHE — 0 à 5 secondes]
Une seule phrase ultra-percutante. Question provocante OU affirmation surprenante.

[DÉVELOPPEMENT]
- Phrases courtes (max 12 mots)
- Une idée = une phrase
- Langage parlé, naturel
- 2-3 points avec exemples concrets

[APPEL À L'ACTION]
Question pour commentaires OU mention du Kit Visible & Conforme™

Script prêt à lire à voix haute — 30-60 secondes`,

  threads: `FORMAT THREADS :
- MAXIMUM STRICT : 500 caractères espaces compris
- Zéro hashtag
- Ton direct, opinion assumée, autorité tranquille
- Une seule idée forte
- Texte continu, pas de liste`,

  carousel: `FORMAT CARROUSEL LINKEDIN — 5 à 7 slides :

Slide 1 — TITRE ACCROCHE
[Titre court, donne envie de swiper]

Slide 2 — LE CONSTAT / PROBLÈME
[Ancré dans le quotidien des praticiens bien-être]

Slide 3 — POINT CLÉ 1
[+ exemple concret]

Slide 4 — POINT CLÉ 2
[+ exemple ou nuance]

Slide 5 — POINT CLÉ 3
[+ erreur courante ou cas pratique]

Slide 6 (optionnel) — RÉCAP / CHIFFRE MARQUANT

Slide FINALE — APPEL À L'ACTION
[Vers le Kit Visible & Conforme™ ou la plateforme]

Chaque slide : titre court + corps 2-4 lignes maximum`,
};

const THEMES: Record<string, string> = {
  "Droit & communication bien-être": "le droit applicable à la communication des praticiens du bien-être (exercice illégal, code de la consommation, mentions légales, titres réglementés)",
  "SEO local": "le référencement local pour les praticiens bien-être (Google Business Profile, cohérence NAP, mots-clés locaux, suspension de fiche)",
  "IA & contenu conforme": "l'utilisation de l'IA pour créer du contenu, et pourquoi elle ne garantit pas la conformité juridique",
  "Visibilité Google": "la visibilité sur Google pour les praticiens bien-être (SEO, fiche Google Business, référencement naturel)",
  "Conformité web & CGV": "la conformité des sites web (mentions légales LCEN, CGV, politique RGPD, formulaires)",
  "Kit Visible & Conforme™": "le Kit Visible & Conforme™ — ce qu'il contient et ce qu'il permet de faire concrètement",
  "Juriste & praticiens bien-être": "le rôle de la juriste spécialisée bien-être, l'accompagnement des praticiens, les risques réels du terrain",
  "Formation & accompagnement": "les offres d'accompagnement et formations sur la conformité et la visibilité conforme",
};

const OBJECTIVES: Record<string, string> = {
  "faire-connaitre": "faire connaître mon expertise et mon positionnement unique (juriste + SEO + bien-être)",
  "inviter-contact": "inviter les praticiens à me contacter ou à découvrir mes services",
  "expliquer": "expliquer un concept, une règle ou une erreur courante de manière pédagogique",
};

const TONES: Record<string, string> = {
  professionnel: "professionnel et expert, autorité sans condescendance",
  chaleureux: "chaleureux et bienveillant, proche de la communauté des praticiens",
  direct: "direct et percutant, avec des prises de position claires",
};

export async function POST(req: NextRequest) {
  try {
    const { network, theme, objective, tone, precisions, variantSeed } = await req.json();

    if (!network || !theme || !objective || !tone) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const networkLabels: Record<string, string> = {
      linkedin: "LinkedIn", instagram: "Instagram", facebook: "Facebook",
      tiktok: "TikTok", threads: "Threads", carousel: "Carrousel LinkedIn",
    };

    const userPrompt = [
      `Génère un contenu pour ${networkLabels[network] ?? network} :`,
      ``,
      `Thème : ${THEMES[theme] ?? theme}`,
      `Objectif : ${OBJECTIVES[objective] ?? objective}`,
      `Ton : ${TONES[tone] ?? tone}`,
      precisions ? `Précisions : ${precisions}` : null,
      variantSeed > 0 ? `\n(Variante #${variantSeed} — angle différent de la version précédente)` : null,
      ``,
      NETWORK_PROMPTS[network] ?? "",
    ].filter(Boolean).join("\n");

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const stream = anthropic.messages.stream({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          });

          for await (const text of stream.textStream) {
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
