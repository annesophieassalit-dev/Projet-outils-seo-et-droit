import Anthropic from "@anthropic-ai/sdk";
import type { GeneratorInput, GeneratedContent, ContentType } from "@/types/scanner";

// ─── Prompt système — les règles de fond immuables ────────────────────────────
// Ces règles ne changent jamais, quelle que soit la demande de personnalisation

const SYSTEM_PROMPT = `Tu es une assistante spécialisée en communication pour les praticiens du bien-être non réglementés en France (naturopathes, coachs, hypnothérapeutes, sophrologues, réflexologues, etc.).

Ta mission : aider ces praticiens à écrire des contenus visibles, crédibles et juridiquement sûrs.

## Règles absolues (ne jamais enfreindre)

INTERDITS dans tous les contenus :
- Termes d'actes médicaux : soigner, traiter, diagnostiquer, guérir, prescrire, ordonnance
- Titres protégés : docteur, médecin, infirmier, psychologue clinicien, psychothérapeute
- Lieux médicaux : clinique, cabinet médical, centre de soins
- Pathologies avec promesse d'action : "je traite la dépression", "soulage le diabète"
- Promesses de résultats : "résultats garantis", "100% efficace", "prouvé scientifiquement"
- Superlatifs non prouvés : "le meilleur", "révolutionnaire", "unique en France"
- Urgence artificielle ou pression commerciale : "dernières places", "offre limitée"
- Témoignages mis en avant comme preuves médicales

TOUJOURS utiliser :
- Accompagnement, soutien, exploration, chemin, espace
- "personnes qui traversent / vivent / rencontrent [situation]" (pas "patients atteints de")
- Nuances : "peut contribuer à", "favorise", "soutient", "selon les personnes"
- Précision du rôle : "praticien(ne) bien-être", "accompagnateur(trice)", jamais "thérapeute" seul
- Disclaimer implicite via le ton : jamais de certitude absolue sur les résultats

## Ton par défaut
Posé, professionnel, humain, crédible. Jamais clinique ni vendeur agressif.
Le contenu doit inspirer confiance, pas l'urgence d'acheter.`;

// ─── Prompts par type de contenu ──────────────────────────────────────────────

function buildPrompt(input: GeneratorInput): string {
  const { contentType, profession, themes, specificites, tone } = input;

  const toneDescriptions: Record<string, string> = {
    professionnel: "professionnel et posé, sobre, inspire la crédibilité",
    chaleureux: "chaleureux et humain, proche, accessible sans être familier",
    sobre: "sobre et minimaliste, épuré, va à l'essentiel",
  };

  const toneInstruction = toneDescriptions[tone || "chaleureux"];
  const themesText = themes.length > 0 ? themes.join(", ") : "bien-être général";

  const contentInstructions: Record<ContentType, string> = {
    bio_instagram: `Rédige une bio Instagram pour ${profession}.
Contraintes : 150 caractères maximum, une accroche + ce qu'on accompagne + un lien d'action.
Ne pas utiliser d'emojis de coeur ou d'étoile.
Exemple de structure : [Ce que tu fais en 5 mots] · [Pour qui] · [Call to action sobre]`,

    presentation_activite: `Rédige un texte de présentation d'activité pour ${profession}.
Longueur : 150–200 mots.
Structure : 1 paragraphe sur l'approche, 1 paragraphe sur les situations accompagnées (avec les thèmes : ${themesText}), 1 phrase d'invitation sobre.
Éviter tout ton publicitaire.`,

    description_programme: `Rédige une description de programme/forfait pour ${profession}.
Thèmes : ${themesText}.
Longueur : 100–150 mots.
Inclure : ce que la personne va explorer, le format, la durée, sans promettre de résultats précis.`,

    post_linkedin: `Rédige un post LinkedIn pour ${profession}.
Thèmes : ${themesText}.
Longueur : 200–300 mots.
Structure : accroche en 1 ligne (sans point d'exclamation), développement en 3–5 courts paragraphes, invitation sobre en fin.
Ton : ${toneInstruction}.
Ne pas commencer par "Je" ni par une question rhétorique aguicheuse.`,

    fiche_google: `Rédige la description courte pour une fiche Google My Business pour ${profession}.
Longueur : 250–300 caractères maximum.
Inclure : spécialité, approche, public accompagné (thèmes : ${themesText}), localisation si mentionnée.`,

    post_instagram: `Rédige un post Instagram pour ${profession}.
Thèmes : ${themesText}.
Longueur : 150–200 mots + 5 hashtags pertinents en fin (pas de hashtag médical).
Ton : ${toneInstruction}.
Pas d'emojis excessifs (max 3 dans tout le post).`,

    accroche_site: `Rédige une accroche de page d'accueil pour ${profession}.
Longueur : 1 phrase H1 (60 caractères max) + 2–3 phrases de sous-titre.
La H1 doit être claire sur le rôle sans termes médicaux.
Le sous-titre présente brièvement l'approche et les personnes accompagnées.`,
  };

  const specificitesText = specificites
    ? `\n\nInformations supplémentaires fournies par le praticien : ${specificites}`
    : "";

  return `${contentInstructions[contentType]}${specificitesText}

Après le contenu, ajoute sur une nouvelle ligne séparée par "---" :
Une note de conformité en 1–2 phrases expliquant pourquoi ce contenu est safe juridiquement (invisible pour les visiteurs, destinée au praticien).`;
}

// ─── Générateur principal ─────────────────────────────────────────────────────

export async function generateContent(input: GeneratorInput): Promise<GeneratedContent> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildPrompt(input),
      },
    ],
  });

  const raw = (message.content[0] as { type: "text"; text: string }).text;

  // Séparer le contenu de la note de conformité
  const parts = raw.split("---");
  const content = parts[0].trim();
  const complianceNote = parts[1]?.trim() || "Contenu rédigé en respectant les règles applicables aux praticiens du bien-être non réglementés.";

  return {
    contentType: input.contentType,
    content,
    complianceNote,
  };
}

// ─── Variante (reformulation du même contenu) ─────────────────────────────────

export async function generateVariant(
  original: string,
  contentType: ContentType,
  profession: string
): Promise<string> {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Propose une variante de ce contenu (${contentType}) pour ${profession}.
Garde le même sens et les mêmes informations mais avec un angle ou une tournure différente.
Respecte toutes les règles de communication prudente.

Contenu original :
${original}

Variante :`,
      },
    ],
  });

  return (message.content[0] as { type: "text"; text: string }).text.trim();
}
