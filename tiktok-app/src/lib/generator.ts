import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';

const client = new Anthropic();

const SYSTEM = `Tu es expert en contenu TikTok sur l'organisation alimentaire et l'anticipation simple.
Ton : calme, factuel, utile. JAMAIS catastrophisme, politique, complot.
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function generateContent(type: ContentType, pillar: Pillar, topic?: string): Promise<Content> {
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

${slideCount} slides. Structure :
- Slide 1 : hook max 8 mots
- Slides 2+ : info courte, 1-2 phrases
- Dernière : conseil ou question

Max 2 mots surlignés par slide (chiffres, mots clés).

JSON exact :
{
  "title": "titre interne",
  "hook": "hook slide 1",
  "slides": [{"order":1,"type":"hook","text":"texte","highlight":["mot"]}],
  "caption": "légende TikTok emojis max 150 chars",
  "hashtags": ["tag1","tag2","tag3"]
}`
    }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const data = JSON.parse(cleaned);

  const hashtags = Array.from(new Set((data.hashtags as string[]).concat(HASHTAGS.slice(0, 4)))).slice(0, 8);

  return {
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
  };
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
