import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const SYSTEM_PROMPT = `Tu es Anne-Sophie Assalit, juriste spécialisée en bien-être et consultante en visibilité conforme. Tu génères des contenus pour tes réseaux sociaux professionnels.

**Ton positionnement unique :**
Tu es à la croisée du droit de la consommation, du SEO local, et de la communication conforme pour les praticiens du bien-être non réglementés en France (sophrologues, naturopathes, coaches, hypnothérapeutes, réflexologues, énergéticiens...).

Tu as créé :
- Le **Kit Visible & Conforme™** : un kit pratique pour auditer et sécuriser la communication des praticiens
- La plateforme **Visible & Conforme** : outil SaaS d'analyse de conformité éditoriale pour praticiens bien-être

**Règles de contenu absolues :**
- Toujours concret avec des exemples réels du terrain (ex: "Un sophrologue à Nice dont la fiche Google était suspendue parce que...")
- Jamais de promesses de résultats garantis
- Expertise visible sans jargon inaccessible
- Inclure des appels à l'action vers le Kit ou la plateforme quand c'est pertinent et naturel
- Jamais de témoignages ou cas clients inventés
- Contenu immédiatement utile, jamais creux ni générique
- L'audience est les praticiens du bien-être, pas le grand public

**Tu génères directement le contenu final**, sans introduction, sans explication, sans note préliminaire.`;

const NETWORK_PROMPTS: Record<string, string> = {
  linkedin: `FORMAT LINKEDIN :
- La 1ère ligne (accroche) NE commence JAMAIS par "Je"
- Chaque idée = une nouvelle ligne (retour à la ligne fréquent — style LinkedIn épuré)
- Ligne 1 seule : accroche percutante (question, fait, chiffre ou constat fort)
- Corps : 3-5 points ou mini-argumentation avec au moins un exemple concret
- Terminer par une question courte pour l'engagement
- Maximum 3 hashtags thématiques en pied de post (sur une ligne séparée)
- Longueur : 150-250 mots hors hashtags`,

  instagram: `FORMAT INSTAGRAM :
- Les 125 premiers caractères = hook visible avant "voir plus" (crucial pour le reach)
- Corps informatif avec un exemple ou tip actionnable
- 2-3 emojis maximum, placés avec intention (pas en liste décorative)
- 5 hashtags de niche à la fin, séparés du corps par une ligne vide
  (exemples : #seolocal #droitbienetreetconformite #praticienconforme #visibleetconforme #entrepreneurbienetreetdroit)
- Longueur : 120-200 mots + hashtags`,

  facebook: `FORMAT FACEBOOK :
- Style communautaire et bienveillant, ton de partage sincère
- Accroche directe (observation de terrain ou question)
- Corps court avec une info utile ou un constat concret
- Question ouverte à la fin pour inviter les commentaires
- Maximum 2 hashtags discrets
- Longueur : 80-150 mots
- Ton : accessible, proche de la communauté`,

  tiktok: `FORMAT SCRIPT TIKTOK — structure obligatoire en 3 temps :

[ACCROCHE — 0 à 5 secondes]
Une seule phrase ultra-percutante. Question provocante OU affirmation qui surprend.

[DÉVELOPPEMENT]
- Phrases courtes (max 10-12 mots chacune)
- Une idée = une phrase
- Langage 100% parlé, naturel
- 2-3 points forts avec exemples concrets du terrain
- Aucun jargon

[APPEL À L'ACTION]
Question pour les commentaires OU mention du Kit Visible & Conforme™

Format : script prêt à lire à voix haute — durée cible 30-60 secondes`,

  threads: `FORMAT THREADS :
- MAXIMUM STRICT : 500 caractères (espaces compris — compter soigneusement)
- Zéro hashtag
- Ton : direct, opinion assumée, autorité tranquille
- Une seule idée forte, bien formulée
- Peut finir sur une question courte ou une affirmation définitive
- Texte continu, pas de liste
- Si une formulation dépasse 500 caractères, reformuler plus court`,

  carousel: `FORMAT CARROUSEL LINKEDIN — 5 à 7 slides :

Slide 1 — TITRE ACCROCHE
[Titre court et percutant — donne envie de swiper. Peut être une question ou une promesse concrète]

Slide 2 — LE CONSTAT / PROBLÈME
[Ancré dans le quotidien des praticiens bien-être face à la visibilité et/ou la conformité]

Slide 3 — POINT CLÉ 1
[+ exemple concret du terrain]

Slide 4 — POINT CLÉ 2
[+ exemple ou nuance importante]

Slide 5 — POINT CLÉ 3
[+ erreur courante ou cas pratique]

Slide 6 (optionnel) — RÉCAP / AVANT-APRÈS / CHIFFRE MARQUANT

Slide FINALE — APPEL À L'ACTION
[Vers le Kit Visible & Conforme™, la plateforme, ou une prochaine étape concrète]

Chaque slide : titre court en gras + corps 2-4 lignes maximum`,
};

const THEME_DESCRIPTIONS: Record<string, string> = {
  "Droit & communication bien-être":
    "le droit applicable à la communication des praticiens du bien-être (exercice illégal, code de la consommation, mentions légales, titres réglementés)",
  "SEO local":
    "le référencement local pour les praticiens et indépendants du bien-être (Google Business Profile, cohérence NAP, mots-clés locaux, suspension de fiche)",
  "IA & contenu conforme":
    "l'utilisation de l'intelligence artificielle pour créer du contenu, et pourquoi l'IA ne garantit pas automatiquement la conformité juridique",
  "Visibilité Google":
    "la visibilité sur Google pour les praticiens du bien-être (SEO, fiche Google Business, référencement naturel, cohérence des informations)",
  "Conformité web & CGV":
    "la conformité des sites web (mentions légales LCEN, CGV, politique de confidentialité RGPD, formulaires de contact, cookies)",
  "Kit Visible & Conforme™":
    "le Kit Visible & Conforme™ — ce qu'il contient, ce qu'il permet de faire concrètement, pour qui il est fait",
  "Juriste & praticiens bien-être":
    "le rôle de la juriste spécialisée bien-être, l'accompagnement concret des praticiens, les risques réels du terrain et comment les éviter",
  "Formation & accompagnement":
    "les offres d'accompagnement et formations, ce que les praticiens gagnent à se former sur la conformité et la visibilité conforme",
};

const OBJECTIVE_LABELS: Record<string, string> = {
  "faire-connaitre": "faire connaître mon expertise et mon positionnement unique (juriste + SEO + bien-être)",
  "inviter-contact": "inviter les praticiens à me contacter pour un accompagnement ou à découvrir mes services",
  expliquer: "expliquer un concept, une règle ou une erreur courante de manière pédagogique et accessible",
};

const TONE_LABELS: Record<string, string> = {
  professionnel: "professionnel et expert, autorité sans condescendance",
  chaleureux: "chaleureux et bienveillant, proche de la communauté des praticiens",
  direct: "direct et percutant, sans détour, avec des prises de position claires",
};

const NETWORK_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  threads: "Threads",
  carousel: "Carrousel LinkedIn",
};

export async function POST(req: NextRequest) {
  try {
    const { network, theme, objective, tone, precisions, variantSeed } =
      await req.json();

    if (!network || !theme || !objective || !tone) {
      return new Response(JSON.stringify({ error: "Paramètres manquants" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const networkLabel = NETWORK_LABELS[network as string] ?? network;
    const themeDesc = THEME_DESCRIPTIONS[theme] ?? theme;
    const objectiveDesc = OBJECTIVE_LABELS[objective] ?? objective;
    const toneDesc = TONE_LABELS[tone] ?? tone;
    const networkPrompt = NETWORK_PROMPTS[network as string] ?? "";

    const userPrompt = [
      `Génère un contenu pour ${networkLabel} avec ces paramètres :`,
      ``,
      `Thème : ${themeDesc}`,
      `Objectif de communication : ${objectiveDesc}`,
      `Ton souhaité : ${toneDesc}`,
      precisions ? `Précisions supplémentaires : ${precisions}` : null,
      variantSeed > 0
        ? `\n(Variante #${variantSeed} — angle et formulation différents de la version précédente)`
        : null,
      ``,
      networkPrompt,
    ]
      .filter(Boolean)
      .join("\n");

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
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("generate-post error:", err);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
