import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

const SYSTEM = `Tu es expert en contenu TikTok sur l'organisation alimentaire et l'anticipation simple.
Ton : direct, factuel, percutant. JAMAIS catastrophisme, politique, complot.
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

// Chaque format guide le style du hook ET correspond à un thème visuel
const FORMATS = [
  { label: 'ERREUR',      hookGuide: 'une erreur concrète à éviter. Exemples : "TU STOCKES MAL ÇA", "CETTE ERREUR COÛTE CHER", "ARRÊTE DE FAIRE ÇA". Max 5 mots, MAJUSCULES.' },
  { label: 'ASTUCE',      hookGuide: 'une astuce chiffrée ou concrète. Exemples : "5 ALIMENTS INDISPENSABLES", "LE SECRET DES FAMILLES PRÉPARÉES", "CE QUE PERSONNE NE DIT". Max 5 mots, MAJUSCULES.' },
  { label: 'VRAI / FAUX', hookGuide: 'une idée reçue à démystifier. Exemples : "LE RIZ NE DURE PAS TOUJOURS", "L\'EAU EN BOUTEILLE PÉRIME", "LES PÂTES NE SUFFISENT PAS". Max 6 mots, MAJUSCULES.' },
  { label: 'SAVAIS-TU ?', hookGuide: 'un fait surprenant ou contre-intuitif. Exemples : "1 KG DE LENTILLES = 8 REPAS", "LE SEL DURE ILLIMITÉ", "LE MIEL NE PÉRIME JAMAIS". Max 6 mots, MAJUSCULES.' },
  { label: 'CHECKLIST',   hookGuide: 'une liste pratique avec chiffre. Exemples : "7 ESSENTIELS POUR 1 SEMAINE", "LA LISTE QUE TOUT LE MONDE OUBLIE", "3 CHOSES À FAIRE CE WEEK-END". Max 6 mots, MAJUSCULES.' },
];

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

let _themeCounter = 0;

export async function generateContent(type: ContentType, pillar: Pillar, topic?: string): Promise<Content> {
  const themeIdx = _themeCounter++ % 5;
  const fmt = FORMATS[themeIdx];
  const isVideo = type === 'video_long';
  const slideCount = isVideo ? '7 à 10' : '5 à 7';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Crée un contenu TikTok ${isVideo ? 'vidéo longue (1min+)' : 'carrousel court'}.
${topic ? `Sujet : ${topic}` : `Pilier : ${pillar}`}

Format visuel : "${fmt.label}"
Style du hook (slide 1) : ${fmt.hookGuide}

${slideCount} slides. Structure :
- Slide 1 : hook percutant MAX 6 MOTS en MAJUSCULES, style "${fmt.label}"
- Slides 2+ : fait concret, 1 phrase courte max 100 caractères, avec chiffres si possible
- Dernière : conseil actionnable en 1 phrase ou question directe

Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement).

JSON exact :
{
  "title": "titre interne",
  "hook": "HOOK MAJUSCULES MAX 6 MOTS",
  "slides": [{"order":1,"type":"hook","text":"texte","highlight":["mot"]}],
  "caption": "légende TikTok avec emojis, max 150 chars",
  "hashtags": ["tag1","tag2","tag3"]
}`,
    }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const data = JSON.parse(cleaned);

  const hashtags = Array.from(new Set((data.hashtags as string[]).concat(HASHTAGS.slice(0, 4)))).slice(0, 8);

  const content: Content = {
    id: generateId(),
    content_type: type,
    pillar,
    title: data.title,
    hook: data.hook,
    slides: data.slides as Slide[],
    caption: data.caption,
    hashtags,
    status: 'ready',
    created_at: new Date().toISOString(),
    themeIndex: themeIdx,
  };

  content.image_svgs = slidesToSvgs(content.slides, themeIdx);
  return content;
}

export async function generateTopicsAndContent(): Promise<Content[]> {
  const combinations: { type: ContentType; pillar: Pillar }[] = [
    { type: 'carousel', pillar: 'erreurs_frequentes' },
    { type: 'carousel', pillar: 'checklist' },
    { type: 'video_long', pillar: 'vrai_faux' },
  ];

  const results = await Promise.all(
    combinations.map(({ type, pillar }) => generateContent(type, pillar))
  );
  return results;
}
