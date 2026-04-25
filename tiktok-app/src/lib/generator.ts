import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

const SYSTEM = `Tu es directeur créatif TikTok spécialisé en contenus viraux.
Thème : préparation alimentaire intelligente — anticiper sans paniquer.
Ton : direct, factuel, utile. JAMAIS survivaliste, catastrophiste, complotiste.
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

// Chaque format guide le hook ET le thème visuel
const FORMATS = [
  {
    label: 'ERREUR',
    hookGuide: `Hook court viral, max 5 mots MAJUSCULES, type erreur/problème. Style direct, pas de titre d'ebook.
Exemples validés : "TU STOCKES MAL ÇA" / "NE STOCKE PAS ÇA" / "3 ERREURS DE DÉBUTANT" / "TON FRIGO EST VIDE EN 72H" / "TU JETTES ÇA TROP VITE"`,
  },
  {
    label: 'ASTUCE',
    hookGuide: `Hook court viral, max 5 mots MAJUSCULES, type révélation ou astuce. Simple, percutant.
Exemples validés : "STOCKE ÇA D'ABORD" / "ÇA SE GARDE 5 ANS" / "CE QUE PERSONNE NE DIT" / "LE SECRET DES FAMILLES PRÉPARÉES"`,
  },
  {
    label: 'VRAI / FAUX',
    hookGuide: `Hook court viral, max 6 mots MAJUSCULES, type idée reçue à démystifier. Assertion provocante.
Exemples validés : "LE RIZ BLANC DURE PLUS LONGTEMPS" / "LES PÂTES NE SUFFISENT PAS" / "N'ACHÈTE PAS ÇA"`,
  },
  {
    label: 'SAVAIS-TU ?',
    hookGuide: `Hook court viral, max 6 mots MAJUSCULES, type fait surprenant ou scénario concret.
Exemples validés : "EAU : TU N'EN AS PAS ASSEZ" / "SI L'EAU COUPE ?" / "SI L'ÉLECTRICITÉ COUPE ?" / "TON FRIGO EST VIDE EN 72H"`,
  },
  {
    label: 'CHECKLIST',
    hookGuide: `Hook court viral, max 5 mots MAJUSCULES, type liste pratique avec chiffre ou urgence.
Exemples validés : "7 ESSENTIELS POUR 1 SEMAINE" / "LA LISTE QUE TOUT LE MONDE OUBLIE" / "3 CHOSES À FAIRE CE WEEK-END"`,
  },
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
      content: `Crée un contenu TikTok ${isVideo ? 'vidéo longue (1min+)' : 'carrousel texte'}.
${topic ? `Sujet : ${topic}` : `Pilier : ${pillar}`}

FORMAT VISUEL : "${fmt.label}"
STYLE DU HOOK : ${fmt.hookGuide}

RÈGLES STRICTES :
- Slide 1 (hook) : MAX 6 MOTS, MAJUSCULES, style TikTok viral — PAS un titre d'ebook
- Slides 2 à ${isVideo ? '9' : '6'} : 1 phrase courte, max 90 caractères, chiffre si possible, info concrète
- Dernière slide : question directe ou conseil actionnable en 1 phrase
- Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement)

JSON exact :
{
  "title": "titre interne court",
  "hook": "HOOK MAX 6 MOTS MAJUSCULES",
  "slides": [{"order":1,"type":"hook","text":"texte","highlight":["mot"]}],
  "caption": "légende TikTok emojis, max 150 chars",
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
