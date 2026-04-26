import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

const SYSTEM = `Tu es directeur créatif TikTok spécialisé en contenus viraux.
Thème : préparation alimentaire intelligente — anticiper sans paniquer.
Ton : direct, factuel, utile. JAMAIS survivaliste, catastrophiste, complotiste.
Pattern gagnant prouvé : 2e personne + erreur cachée ("Tu fais X mal sans le savoir").
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

// Chaque format guide le hook ET le thème visuel
const FORMATS = [
  {
    label: 'ERREUR',
    hookGuide: `Phrase directe, max 8 mots, 2e personne + erreur cachée. Pas tout en majuscules.
Exemples validés : "Tu stockes mal sans le savoir" / "Tu jettes ça trop tôt" / "Tu oublies toujours cet aliment" / "Tout le monde achète ça en premier. Mauvaise idée." / "Tu fais cette erreur sans t'en rendre compte"`,
  },
  {
    label: 'ASTUCE',
    hookGuide: `Phrase directe, max 8 mots, révélation contre-intuitive. 2e personne si possible.
Exemples validés : "Ce que personne ne te dit sur le stockage" / "Tu peux conserver ça 5 ans" / "La plupart des gens font ça à l'envers" / "Tu achètes ça en dernier. C'est une erreur."`,
  },
  {
    label: 'VRAI / FAUX',
    hookGuide: `Phrase directe, max 8 mots, idée reçue à démystifier. Assertion provocante, sans majuscules.
Exemples validés : "Le riz blanc dure plus longtemps que tu crois" / "Les pâtes ne suffisent pas" / "Tu penses être prêt. Tu ne l'es pas." / "Ce que tu stockes en premier est une erreur"`,
  },
  {
    label: 'SAVAIS-TU ?',
    hookGuide: `Phrase directe, max 8 mots, fait surprenant ou scénario concret. 2e personne.
Exemples validés : "Tu n'as pas assez d'eau pour 3 jours" / "Si l'électricité coupe ce soir, tu manges quoi ?" / "Tu penses être prêt. Tu ne l'es probablement pas." / "Ton frigo est vide en 72h sans le savoir"`,
  },
  {
    label: 'CHECKLIST',
    hookGuide: `Phrase directe, max 8 mots, liste avec chiffre ou contre-intuition. 2e personne préférée.
Exemples validés : "Les 3 produits que tout le monde achète en premier… erreur" / "Tu oublies toujours ces 5 choses" / "La liste que tu fais est dans le mauvais ordre"`,
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
- Slide 1 (hook) : max 8 mots, style phrase directe 2e personne, PAS tout en majuscules, PAS un titre d'ebook
- Slides 2 à ${isVideo ? '9' : '6'} : 1 phrase courte, max 90 caractères, chiffre si possible, info concrète
- Dernière slide : question directe ou conseil actionnable en 1 phrase
- Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement)

JSON exact :
{
  "title": "titre interne court",
  "hook": "hook direct max 8 mots",
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
