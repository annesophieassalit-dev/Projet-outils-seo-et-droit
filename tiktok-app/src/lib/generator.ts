import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, PersonaId, Pillar, Slide } from '@/types/content';
import { PERSONAS } from './personas';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function pickWeightedFormat(personaId: PersonaId) {
  const formats = PERSONAS[personaId].formats;
  const total = formats.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of formats) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return formats[formats.length - 1];
}

function pickThreeDistinct(personaId: PersonaId) {
  const formats = PERSONAS[personaId].formats;
  const picked: number[] = [];
  const result: Array<{ fmt: typeof formats[0]; idx: number }> = [];
  let attempts = 0;
  while (result.length < 3 && attempts < 50) {
    attempts++;
    const fmt = pickWeightedFormat(personaId);
    const idx = formats.indexOf(fmt);
    if (!picked.includes(idx)) {
      picked.push(idx);
      result.push({ fmt, idx });
    }
  }
  return result;
}

export async function generateContent(
  type: ContentType,
  personaId: PersonaId,
  pillar?: Pillar,
  topic?: string,
  fmtIdx?: number,
): Promise<Content> {
  const persona = PERSONAS[personaId];
  const formats = persona.formats;

  let fmt = formats[0];
  let safeIdx = 0;

  if (fmtIdx !== undefined && fmtIdx < formats.length) {
    safeIdx = fmtIdx;
    fmt = formats[safeIdx];
  } else if (pillar) {
    const found = formats.findIndex(f => f.pillar === pillar);
    safeIdx = found >= 0 ? found : 0;
    fmt = formats[safeIdx];
  }

  const theme = persona.themes[safeIdx % persona.themes.length];
  const isVideo = type === 'video_long';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: persona.system,
    messages: [{
      role: 'user',
      content: `Crée un contenu ${isVideo ? 'vidéo longue (1min+)' : 'carrousel texte'} pour ${persona.name}.
${topic ? `Sujet imposé : ${topic}` : `Format imposé : ${fmt.label} — trouve un sujet ORIGINAL et NOUVEAU dans cet angle, jamais déjà vu.`}

FORMAT VISUEL : "${fmt.label}"
STYLE DU HOOK : ${fmt.hookGuide}

RÈGLES STRICTES :
- Slide 1 (visuel) : MAX 6 MOTS — slogan choc affiché sur l'image. Court, percutant, coupé impitoyablement.
- "hook" JSON : phrase d'accroche pour la légende — DIFFÉRENTE du texte slide 1, plus narrative. Question ou tension forte, 10-15 mots max. Ex: "Tu sais pas par quoi remplacer l'huile d'olive en ce moment ?" ou "Cette semaine les rayons étaient encore vides — voilà ce que j'ai fait."
- Slides 2 à ${isVideo ? '9' : '4'} : 1 phrase courte, max 90 caractères, chiffre si possible, info concrète et originale
- Dernière slide info : conseil actionnable ou question directe en 1 phrase (pas "conclusion")
- Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement)
- DURÉES INTERDITES : jamais > 5 ans. Riz 2-4 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.
- Caption SEO : 450-550 caractères avec emojis. Structure : hook (repris ou reformulé) → 2-3 phrases avec mots-clés naturels que les gens cherchent (ex: stock alimentaire famille, pénurie courses, repas sans courses, frigo vide enfants, budget courses) → tip concret → question qui invite les commentaires. Optimisé pour être trouvé dans la recherche TikTok/Instagram.

JSON exact :
{
  "title": "titre interne court",
  "hook": "phrase accroche légende 10-15 mots différente du slide 1",
  "slides": [{"order":1,"type":"hook","text":"MAX 6 MOTS visuel","highlight":["mot"]}],
  "caption": "légende SEO 450-550 chars avec emojis et mots-clés recherchés",
  "hashtags": ["tag1","tag2","tag3"]
}`,
    }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const data = JSON.parse(cleaned);

  const hashtags = Array.from(new Set(
    (data.hashtags as string[]).concat(persona.hashtagsTiktok.slice(0, 4))
  )).slice(0, 8);

  const instaTopicTags = (data.hashtags as string[]).slice(0, 4);
  const hashtags_insta = Array.from(new Set([
    ...instaTopicTags,
    ...persona.hashtagsInsta,
  ])).slice(0, 14);

  const rawSlides = (data.slides as Slide[]).filter(s => s.type !== 'conclusion' && s.type !== 'subscribe');
  const slides: Slide[] = [
    ...rawSlides,
    { order: rawSlides.length + 1, type: 'subscribe', text: 'Abonne-toi', highlight: [] },
    { order: rawSlides.length + 2, type: 'conclusion', text: 'Lien en bio', highlight: [] },
  ];

  const content: Content = {
    id: generateId(),
    persona: personaId,
    content_type: type,
    pillar: fmt.pillar,
    title: data.title,
    hook: data.hook,
    slides,
    caption: data.caption,
    hashtags,
    hashtags_insta,
    status: 'ready',
    created_at: new Date().toISOString(),
    themeIndex: safeIdx,
  };

  content.image_svgs = slidesToSvgs(slides, theme, persona.name, persona.ctaSubtitle);
  return content;
}

export async function generateTopicsAndContent(personaId: PersonaId): Promise<Content[]> {
  const picks = pickThreeDistinct(personaId);
  return Promise.all(
    picks.map(({ fmt, idx }) => generateContent('carousel', personaId, fmt.pillar, undefined, idx))
  );
}
