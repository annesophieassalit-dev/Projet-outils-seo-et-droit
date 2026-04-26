import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

const SYSTEM = `Tu es directeur créatif TikTok spécialisé en contenus viraux.
Thème : préparation alimentaire intelligente — anticiper sans paniquer.
Ton : direct, factuel, utile. JAMAIS survivaliste, catastrophiste, complotiste.
Pattern gagnant prouvé : 2e personne + erreur cachée ("Tu stockes mal sans le savoir").
INTERDIT dans les hooks : toute formulation santé-peur ("va te rendre malade", "dangereux", "toxique", "empoisonner") — trop signalable, nuit à la crédibilité.
DURÉES DE CONSERVATION : cite uniquement des durées réalistes en conditions domestiques normales (placard, congélateur standard). Jamais de durées extrêmes type "25 ans" qui relèvent du stockage professionnel sous vide à l'azote. Références prudentes : riz blanc 2-5 ans, pâtes 2-3 ans, conserves 2-5 ans selon produit, huile 1-2 ans.
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

// Chaque format guide le hook ET le thème visuel
const FORMATS = [
  {
    label: 'ERREUR',
    hookGuide: `Slogan TikTok, MAX 6 MOTS, 2e personne + erreur cachée. Pas de formulation santé-peur.
❌ Trop long : "Tu fais cette erreur sans t'en rendre compte" → ✅ Court : "Tu stockes mal sans le savoir"
❌ Peur santé : "Ton huile stockée va te rendre malade" → ✅ Factuel : "Tu stockes mal ton huile"
Autres exemples courts validés : "Tu jettes ça trop tôt" / "Tu oublies toujours ça" / "Mauvaise idée. Voilà pourquoi."`,
  },
  {
    label: 'ASTUCE',
    hookGuide: `Slogan TikTok, MAX 6 MOTS, révélation contre-intuitive. Court, percutant.
❌ Trop long : "Ce que personne ne te dit sur le stockage" → ✅ Court : "Personne ne te dit ça"
Autres exemples courts validés : "Tu peux stocker ça 5 ans" / "Tu fais ça à l'envers" / "Stocke ça en premier"`,
  },
  {
    label: 'VRAI / FAUX',
    hookGuide: `Slogan TikTok, MAX 6 MOTS, idée reçue percutante. Assertion courte, pas de point d'interrogation.
❌ Trop long : "Le riz blanc dure plus longtemps que tu crois" → ✅ Court : "Le riz blanc dure plus"
Autres exemples courts validés : "Les pâtes ne suffisent pas" / "Tu n'es pas prêt" / "Tu stockes les mauvaises choses"`,
  },
  {
    label: 'SAVAIS-TU ?',
    hookGuide: `Slogan TikTok, MAX 6 MOTS, scénario concret ou chiffre choc. 2e personne.
❌ Trop long : "Tu n'as probablement pas assez d'eau pour 3 jours" → ✅ Court : "Pas assez d'eau pour 72h"
Autres exemples courts validés : "Si l'eau coupe ce soir ?" / "Ton frigo vide en 72h" / "Tu n'as pas assez d'eau"`,
  },
  {
    label: 'CHECKLIST',
    hookGuide: `Slogan TikTok, MAX 6 MOTS, chiffre + contre-intuition. Court et direct.
❌ Trop long : "Les 3 produits que tout le monde achète en premier… erreur" → ✅ Court : "Tu achètes ça en premier. Erreur."
Autres exemples courts validés : "Tu oublies ces 5 choses" / "La liste dans le mauvais ordre" / "3 erreurs de débutant"`,
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
- Slide 1 (hook) : MAX 6 MOTS — slogan, pas un titre. Couper impitoyablement. PAS de formulation santé-peur.
- Slides 2 à ${isVideo ? '9' : '6'} : 1 phrase courte, max 90 caractères, chiffre si possible, info concrète
- Dernière slide : question directe ou conseil actionnable en 1 phrase
- Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement)
- DURÉES INTERDITES : ne jamais écrire de durée supérieure à 5 ans. Le riz se conserve 2-4 ans, pas 25 ans. Toute durée > 5 ans est FAUSSE dans un contexte domestique normal.

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
