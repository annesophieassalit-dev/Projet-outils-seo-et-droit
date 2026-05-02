import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import path from "path";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Sample of existing content so Claude understands the tone and style
function getSampleContent() {
  const base = path.join(process.cwd(), "..", "instagram-automation", "content");
  const blanc = JSON.parse(readFileSync(path.join(base, "carousels_blanc.json"), "utf-8"));
  return blanc.slice(0, 2); // 2 examples are enough
}

const SYSTEM_PROMPT = `Tu es Anne-Sophie Assalit, juriste spécialisée en droit du numérique et SEO local pour les praticiens du bien-être non réglementés (naturopathes, coachs, hypnothérapeutes, sophrologues, énergéticiens, etc.).

Tu crées du contenu Instagram pédagogique, clair et bienveillant. Ton ton est direct, professionnel mais accessible. Tu n'utilises jamais de jargon inutile. Tu alertes sans faire peur.

Tes thèmes de prédilection :
- RGPD et collecte de données sur les sites web
- Pratiques commerciales trompeuses (DGCCRF)
- SEO local et Google My Business
- Mentions légales (LCEN)
- Droits à l'image et photos clients
- Politique de confidentialité
- Conformité des contenus Instagram/LinkedIn

RÈGLES DE TON :
- Phrases courtes et percutantes
- Toujours commencer par un constat concret ("Si votre site...", "Beaucoup de praticiens...")
- Finir par un appel à l'action soft ("Vérifiez...", "Prenez le contrôle...")
- Sources juridiques réelles (RGPD, DGCCRF, Code de la consommation, CNIL)
- Hashtags : #RGPD #SEOlocal #visibleetconforme #praticienbienettre #bienetrelegal

FORMAT DE SORTIE (JSON strict, aucun texte autour) :
{
  "style": "blanc",
  "slides": [
    {
      "title": "Titre court accrocheur (max 6 mots)",
      "bold": "Phrase d'accroche en gras (1 phrase percutante)",
      "paragraphs": ["Paragraphe 1", "Paragraphe 2 si besoin"]
    },
    {
      "title": "Slide 2...",
      "bold": "...",
      "paragraphs": ["..."]
    },
    {
      "title": "Slide 3...",
      "bold": "...",
      "paragraphs": ["..."]
    },
    {
      "title": "Slide finale CTA",
      "bold": "Question ou action directe",
      "paragraphs": ["Phrase courte d'action"],
      "sources": "Sources : RGPD art. X, CNIL, ...",
      "is_last": true
    }
  ],
  "caption": "Caption Instagram complet (3-4 phrases + hashtags)"
}`;

export async function POST(req: Request) {
  try {
    const { topic, autoTopic } = await req.json();

    const userMessage = autoTopic
      ? `Génère un carrousel Instagram sur un sujet lié à la conformité juridique ou au SEO local pour praticiens du bien-être.
         Choisis un angle original que tu n'as pas encore traité parmi : ${getSampleContent().map((c: {slides: {title: string}[]}) => c.slides[0]?.title).join(", ")}.
         Ne génère QUE le JSON, aucun commentaire.`
      : `Génère un carrousel Instagram sur ce sujet : "${topic}"
         Adapte le contenu aux praticiens du bien-être non réglementés.
         Ne génère QUE le JSON, aucun commentaire.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON even if Claude added any text around it
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Claude n'a pas retourné de JSON valide");

    const carousel = JSON.parse(match[0]);

    return Response.json({ carousel, raw: match[0] });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
