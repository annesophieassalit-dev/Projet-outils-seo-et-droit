import Anthropic from '@anthropic-ai/sdk';
import type { ContentType, Pillar, Slide, TikTokTopic } from '@/types/tiktok';
import { HASHTAGS_BASE } from '@/types/tiktok';

const client = new Anthropic();

const PILLAR_PROMPTS: Record<Pillar, string> = {
  vrai_faux: 'Format VRAI ou FAUX sur la conservation/stockage alimentaire. Très viral, format simple.',
  cuisson_sans_energie: 'Comment cuisiner sans électricité ou gaz. Très concret et pratique.',
  stock_petit_budget: 'Constituer un stock alimentaire avec peu d\'argent. Touche au pouvoir d\'achat.',
  checklist: 'Liste pratique sur l\'organisation alimentaire. Génère des sauvegardes.',
  erreurs_frequentes: 'Erreurs courantes dans le stockage ou l\'organisation alimentaire. Fort engagement.',
  penuries_possibles: 'Produits souvent en rupture ou à forte rotation. Rester factuel et neutre.',
  general: 'Organisation alimentaire simple et pratique au quotidien.',
};

const SYSTEM_PROMPT = `Tu es un expert en création de contenu TikTok pour un compte dédié à l'organisation alimentaire et à l'anticipation simple.

POSITIONNEMENT : Pratique, rationnel, utile. Ton calme et factuel.
JAMAIS : catastrophisme, survivalisme extrême, politique, complot, peur excessive.
TOUJOURS : utile, partageable, crédible, grand public.

Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.`;

export interface GeneratedContent {
  title: string;
  hook: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  pillar: Pillar;
  content_type: ContentType;
}

export async function generateTopics(count: number = 10): Promise<Omit<TikTokTopic, 'id' | 'user_id' | 'created_at' | 'used'>[]> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Génère ${count} idées de sujets TikTok variés pour un compte sur l'organisation alimentaire et l'anticipation simple.

Répartis les sujets sur ces piliers : vrai_faux, cuisson_sans_energie, stock_petit_budget, checklist, erreurs_frequentes, penuries_possibles.
Pour chaque sujet, précise si c'est un carrousel court (carousel) ou une vidéo longue (video_long).

Réponds avec ce JSON exact :
{
  "topics": [
    {
      "title": "titre du sujet",
      "pillar": "nom_du_pilier",
      "hook": "hook court max 8 mots",
      "content_type": "carousel ou video_long",
      "priority": 1 à 10
    }
  ]
}`
    }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const data = JSON.parse(text);
  return data.topics;
}

export async function generateCarousel(topic: { title: string; pillar: Pillar; hook?: string }): Promise<GeneratedContent> {
  const pillarContext = PILLAR_PROMPTS[topic.pillar] || PILLAR_PROMPTS.general;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Crée un carrousel TikTok court sur : "${topic.title}"

Pilier : ${pillarContext}
${topic.hook ? `Hook suggéré : ${topic.hook}` : ''}

Structure : 5 à 7 slides
- Slide 1 : hook accrocheur (max 8 mots)
- Slides 2-5 : informations courtes, 1-2 phrases max par slide
- Dernière slide : mini conseil ou question légère

Pour les highlights : max 2 mots surlignés par slide (chiffres, mots clés, actions importantes).

Réponds avec ce JSON exact :
{
  "title": "titre interne",
  "hook": "hook de la slide 1",
  "slides": [
    {
      "order": 1,
      "type": "hook",
      "text": "texte de la slide",
      "highlight": ["mot1", "mot2"]
    }
  ],
  "caption": "légende TikTok avec emojis, max 150 caractères",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "pillar": "${topic.pillar}",
  "content_type": "carousel"
}`
    }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const data = JSON.parse(text);
  data.hashtags = mergeHashtags(data.hashtags);
  return data;
}

export async function generateVideoScript(topic: { title: string; pillar: Pillar; hook?: string }): Promise<GeneratedContent> {
  const pillarContext = PILLAR_PROMPTS[topic.pillar] || PILLAR_PROMPTS.general;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Crée une vidéo longue TikTok (1 minute minimum) sur : "${topic.title}"

Pilier : ${pillarContext}
${topic.hook ? `Hook suggéré : ${topic.hook}` : ''}

Structure : 7 à 10 slides/scènes
- Slide 1 : hook fort (3 secondes, max 8 mots)
- Slides 2-8 : développement avec infos utiles
- Dernière slide : conclusion + mini appel à action

Contenu varié selon le pilier :
- Vrai/Faux : réponse claire + explication courte
- Checklist : items numérotés
- Erreurs : erreur + correction
- Général : conseil + application pratique

Pour les highlights : max 2 mots surlignés par slide.

Réponds avec ce JSON exact :
{
  "title": "titre interne",
  "hook": "hook de la slide 1",
  "slides": [
    {
      "order": 1,
      "type": "hook",
      "text": "texte",
      "highlight": ["mot"]
    }
  ],
  "caption": "légende TikTok avec emojis, max 200 caractères",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "pillar": "${topic.pillar}",
  "content_type": "video_long"
}`
    }],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const data = JSON.parse(text);
  data.hashtags = mergeHashtags(data.hashtags);
  return data;
}

function mergeHashtags(generated: string[]): string[] {
  const all = Array.from(new Set(generated.concat(HASHTAGS_BASE.slice(0, 5))));
  return all.slice(0, 8);
}

export async function generateDailyContent(userId: string): Promise<GeneratedContent[]> {
  const results: GeneratedContent[] = [];

  const carouselTopics = await generateTopics(3);
  const carousel1 = carouselTopics[0];
  const carousel2 = carouselTopics[1];
  const videoTopic = carouselTopics[2];

  const [c1, c2, v1] = await Promise.all([
    generateCarousel({ title: carousel1.title, pillar: carousel1.pillar as Pillar, hook: carousel1.hook }),
    generateCarousel({ title: carousel2.title, pillar: carousel2.pillar as Pillar, hook: carousel2.hook }),
    generateVideoScript({ title: videoTopic.title, pillar: videoTopic.pillar as Pillar, hook: videoTopic.hook }),
  ]);

  results.push(c1, c2, v1);
  return results;
}
