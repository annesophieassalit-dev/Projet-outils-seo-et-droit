import Anthropic from '@anthropic-ai/sdk';
import type { Content, ContentType, Pillar, Slide } from '@/types/content';
import { slidesToSvgs } from './svg';

const client = new Anthropic();

const SYSTEM = `Tu es directeur créatif TikTok spécialisé en contenus viraux.
Thème : préparation alimentaire intelligente — anticiper sans paniquer.
Ton : direct, factuel, utile. JAMAIS survivaliste, catastrophiste, complotiste.
IMPORTANT : génère TOUJOURS un sujet NOUVEAU et SPÉCIFIQUE — les exemples du prompt sont des inspirations, pas des modèles à copier. Trouve un angle original à chaque fois.
Pattern gagnant prouvé : 2e personne + angle fort selon le format imposé.
INTERDIT dans les hooks : toute formulation santé-peur ("va te rendre malade", "dangereux", "toxique", "empoisonner") — nuit à la crédibilité.
DURÉES DE CONSERVATION : cite uniquement des durées réalistes en conditions domestiques normales. Jamais > 5 ans. Riz blanc 2-5 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.
Réponds UNIQUEMENT en JSON valide sans markdown.`;

const HASHTAGS_TIKTOK = ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'];

// Instagram : mix petit/moyen/grand volume pour discovery
export const HASHTAGS_INSTA = [
  // Petits — très ciblés (5k-50k posts)
  '#stockalimentaire','#reservealimentaire','#autonomiealimentaire','#stockpilingfrance',
  // Moyens — niche (50k-500k)
  '#organisationalimentaire','#preparationrepas','#conservesmaison','#economiedomestique','#frugalite','#vieorganisee',
  // Grands — reach (500k-5M)
  '#astucescuisine','#astucesvie','#antigaspi','#mealprep','#organisation','#conseilscuisine',
];

// 10 formats — weight 3 = fréquent, weight 2 = normal, weight 1 = rare
const FORMATS = [
  {
    pillar: 'urgence' as Pillar,
    label: 'URGENCE',
    weight: 3,
    hookGuide: `Slogan TikTok MAX 6 MOTS, ton panique/urgence concret. 2e personne, scénario imminent.
❌ Trop long : "Si une pénurie survenait demain tu oublierais ça" → ✅ "Si les rayons se vident demain"
Exemples d'inspiration (ne pas copier) : "Ce produit part en premier" / "Ton stock est fragile" / "Tu oublies ça en premier"`,
  },
  {
    pillar: 'deconstruction_mythes' as Pillar,
    label: 'MYTHE',
    weight: 3,
    hookGuide: `Slogan TikTok MAX 6 MOTS, déconstruction directe d'une idée reçue. Assertion courte et tranchante.
❌ Trop long : "Il ne faut pas forcément remplir son garage de pâtes" → ✅ "Non. Pas des pâtes en premier"
Exemples d'inspiration (ne pas copier) : "Non, le congélateur ne suffit pas" / "Ton jardin ne te sauve pas" / "Les conserves. Tu fais faux"`,
  },
  {
    pillar: 'scenarios_realistes' as Pillar,
    label: 'SCÉNARIO',
    weight: 3,
    hookGuide: `Slogan TikTok MAX 6 MOTS, scénario concret + durée précise. Factuel et projetant.
❌ Trop long : "Que ferais-tu si tu n'avais pas accès au supermarché pendant 72 heures" → ✅ "72h sans supermarché. T'es prêt ?"
Exemples d'inspiration (ne pas copier) : "24h sans eau courante" / "Semaine de grève. Ton frigo" / "Tempête. Jour 3."`,
  },
  {
    pillar: 'experience_personnelle' as Pillar,
    label: "J'AI TESTÉ",
    weight: 2,
    hookGuide: `Slogan TikTok MAX 6 MOTS, expérience personnelle. 1ère personne, aveu ou résultat surprenant.
❌ Trop long : "J'ai essayé de vivre sans faire de courses pendant 48 heures" → ✅ "48h sans courses. Résultat"
Exemples d'inspiration (ne pas copier) : "J'ai mal acheté ça" / "Mon erreur de débutant" / "Ce que j'ai jeté en premier"`,
  },
  {
    pillar: 'micro_autonomie' as Pillar,
    label: 'AUTONOMIE',
    weight: 2,
    hookGuide: `Slogan TikTok MAX 6 MOTS, autonomie accessible sans jardin. Concret, atteignable par tous.
❌ Trop long : "Voici ce qu'un balcon peut vraiment vous permettre de produire" → ✅ "Ton balcon peut faire ça"
Exemples d'inspiration (ne pas copier) : "3 légumes inutiles en pot" / "Germer sans jardin" / "Ce qui pousse partout"`,
  },
  {
    pillar: 'budget' as Pillar,
    label: 'BUDGET',
    weight: 3,
    hookGuide: `Slogan TikTok MAX 6 MOTS, budget précis + résultat concret. Chiffre en euros obligatoire dans le hook.
❌ Trop long : "Ce que tu peux acheter pour constituer un stock avec un budget de 20 euros" → ✅ "20€ de stock. La liste"
Exemples d'inspiration (ne pas copier) : "Stock étudiant avec 30€" / "50€ pour 1 mois" / "10€. Ce que j'achèterais"`,
  },
  {
    pillar: 'newsjacking' as Pillar,
    label: 'ACTU',
    weight: 1,
    hookGuide: `Slogan TikTok MAX 6 MOTS, lien actualité + préparation concrète. Factuel, jamais alarmiste.
❌ Trop long : "Face aux tensions mondiales voici comment tu dois te préparer maintenant" → ✅ "Inflation. Ce que tu stockes"
Exemples d'inspiration (ne pas copier) : "Sécheresse. Ton eau" / "Grève transport. Prêt ?" / "Tension. Ce qui manque d'abord"`,
  },
  {
    pillar: 'erreurs_frequentes' as Pillar,
    label: 'ERREUR',
    weight: 3,
    hookGuide: `Slogan TikTok MAX 6 MOTS, 2e personne + erreur cachée. Pas de formulation santé-peur.
❌ Trop long : "Tu fais cette erreur sans t'en rendre compte" → ✅ "Tu stockes mal sans le savoir"
Exemples d'inspiration (ne pas copier) : "Tu jettes ça trop tôt" / "Tu oublies toujours ça" / "Mauvaise idée. Voilà pourquoi."`,
  },
  {
    pillar: 'vrai_faux' as Pillar,
    label: 'VRAI / FAUX',
    weight: 2,
    hookGuide: `Slogan TikTok MAX 6 MOTS, idée reçue percutante. Assertion courte, pas de point d'interrogation.
❌ Trop long : "Le riz blanc dure plus longtemps que tu ne le crois" → ✅ "Le riz blanc dure plus"
Exemples d'inspiration (ne pas copier) : "Les pâtes ne suffisent pas" / "Tu n'es pas prêt" / "Tu stockes les mauvaises choses"`,
  },
  {
    pillar: 'checklist' as Pillar,
    label: 'CHECKLIST',
    weight: 2,
    hookGuide: `Slogan TikTok MAX 6 MOTS, chiffre + contre-intuition. Court et direct.
❌ Trop long : "Les 3 produits que tout le monde achète en premier c'est une erreur" → ✅ "Tu achètes ça en premier. Erreur."
Exemples d'inspiration (ne pas copier) : "Tu oublies ces 5 choses" / "La liste dans le mauvais ordre" / "3 erreurs de débutant"`,
  },
];

const TOTAL_WEIGHT = FORMATS.reduce((s, f) => s + f.weight, 0);

function pickWeightedFormat(): typeof FORMATS[0] {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const f of FORMATS) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FORMATS[FORMATS.length - 1];
}

function pickThreeDistinct(): Array<{ fmt: typeof FORMATS[0]; idx: number }> {
  const picked: number[] = [];
  const result: Array<{ fmt: typeof FORMATS[0]; idx: number }> = [];
  while (result.length < 3) {
    const fmt = pickWeightedFormat();
    const idx = FORMATS.indexOf(fmt);
    if (!picked.includes(idx)) {
      picked.push(idx);
      result.push({ fmt, idx });
    }
  }
  return result;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export async function generateContent(type: ContentType, pillar: Pillar, topic?: string, fmtIdx?: number): Promise<Content> {
  const themeIdx = fmtIdx !== undefined
    ? fmtIdx
    : FORMATS.findIndex(f => f.pillar === pillar);
  const safeIdx = themeIdx >= 0 ? themeIdx : 0;
  const fmt = FORMATS[safeIdx];
  const isVideo = type === 'video_long';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Crée un contenu TikTok ${isVideo ? 'vidéo longue (1min+)' : 'carrousel texte'}.
${topic ? `Sujet imposé : ${topic}` : `Format imposé : ${fmt.label} — trouve un sujet ORIGINAL et NOUVEAU dans cet angle, jamais déjà vu.`}

FORMAT VISUEL : "${fmt.label}"
STYLE DU HOOK : ${fmt.hookGuide}

RÈGLES STRICTES :
- Slide 1 (hook) : MAX 6 MOTS — slogan, pas un titre. Couper impitoyablement. PAS de formulation santé-peur.
- Slides 2 à ${isVideo ? '9' : '6'} : 1 phrase courte, max 90 caractères, chiffre si possible, info concrète et originale
- Dernière slide info : conseil actionnable ou question directe en 1 phrase
- Highlights : max 2 mots par slide (chiffres ou mots-clés forts uniquement)
- DURÉES INTERDITES : jamais > 5 ans. Riz 2-4 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.

JSON exact :
{
  "title": "titre interne court",
  "hook": "hook direct max 6 mots",
  "slides": [{"order":1,"type":"hook","text":"texte","highlight":["mot"]}],
  "caption": "légende TikTok emojis, max 150 chars",
  "hashtags": ["tag1","tag2","tag3"]
}`,
    }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text;
  const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  const data = JSON.parse(cleaned);

  const hashtags = Array.from(new Set((data.hashtags as string[]).concat(HASHTAGS_TIKTOK.slice(0, 4)))).slice(0, 8);

  const rawSlides = (data.slides as Slide[]).filter(s => s.type !== 'conclusion');
  const slides: Slide[] = [
    ...rawSlides,
    { order: rawSlides.length + 1, type: 'conclusion', text: 'Lien en bio', highlight: [] },
  ];

  // Hashtags Instagram : 4 ciblés du sujet + mix petit/moyen/grand volume
  const instaTopicTags = (data.hashtags as string[]).slice(0, 4);
  const hashtags_insta = Array.from(new Set([
    ...instaTopicTags,
    ...HASHTAGS_INSTA,
  ])).slice(0, 14);

  const content: Content = {
    id: generateId(),
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

  content.image_svgs = slidesToSvgs(content.slides, safeIdx);
  return content;
}

export async function generateTopicsAndContent(): Promise<Content[]> {
  const picks = pickThreeDistinct();
  return Promise.all(
    picks.map(({ fmt, idx }) => generateContent('carousel', fmt.pillar, undefined, idx))
  );
}
