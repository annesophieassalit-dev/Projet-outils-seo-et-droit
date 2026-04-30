import type { Pillar, PersonaId } from '@/types/content';

export interface Format {
  pillar: Pillar;
  label: string;
  weight: number;
  hookGuide: string;
}

export interface PersonaTheme {
  la: string;
  ca: string;   // accent color
  bg: string;   // background
  card: string; // card background
}

export interface Persona {
  id: PersonaId;
  name: string;
  tagline: string;
  ctaSubtitle: string;
  system: string;
  formats: Format[];
  themes: PersonaTheme[];
  hashtagsTiktok: string[];
  hashtagsInsta: string[];
}

// ─── PRÉVOIR UTILE — dark premium, or/vert/brique ────────────────────────────
const PREVOIR_UTILE: Persona = {
  id: 'prevoir_utile',
  name: 'PRÉVOIR UTILE',
  tagline: 'TikTok Auto',
  ctaSubtitle: 'Guide PDF — 11€',
  system: `Tu es directeur créatif TikTok spécialisé en contenus viraux.
Thème : préparation alimentaire intelligente — anticiper sans paniquer.
Ton : direct, factuel, utile. JAMAIS survivaliste, catastrophiste, complotiste.
IMPORTANT : génère TOUJOURS un sujet NOUVEAU et SPÉCIFIQUE.
INTERDIT dans les hooks : formulation santé-peur ("va te rendre malade", "dangereux", "toxique", "empoisonner").
DURÉES : jamais > 5 ans. Riz 2-5 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.
Réponds UNIQUEMENT en JSON valide sans markdown.`,
  formats: [
    { pillar: 'urgence', label: 'URGENCE', weight: 3, hookGuide: `MAX 6 MOTS, scénario imminent, 2e personne.\n✅ "Si les rayons se vident demain" / "Ton stock est fragile"` },
    { pillar: 'deconstruction_mythes', label: 'MYTHE', weight: 3, hookGuide: `MAX 6 MOTS, déconstruction directe.\n✅ "Non. Pas des pâtes en premier" / "Ton jardin ne te sauve pas"` },
    { pillar: 'scenarios_realistes', label: 'SCÉNARIO', weight: 3, hookGuide: `MAX 6 MOTS, scénario + durée précise.\n✅ "72h sans supermarché. T'es prêt ?" / "24h sans eau courante"` },
    { pillar: 'experience_personnelle', label: "J'AI TESTÉ", weight: 2, hookGuide: `MAX 6 MOTS, 1ère personne, résultat surprenant.\n✅ "48h sans courses. Résultat" / "J'ai mal acheté ça"` },
    { pillar: 'micro_autonomie', label: 'AUTONOMIE', weight: 2, hookGuide: `MAX 6 MOTS, autonomie accessible.\n✅ "Ton balcon peut faire ça" / "Germer sans jardin"` },
    { pillar: 'budget', label: 'BUDGET', weight: 3, hookGuide: `MAX 6 MOTS, chiffre euros obligatoire.\n✅ "20€ de stock. La liste" / "50€ pour 1 mois"` },
    { pillar: 'newsjacking', label: 'ACTU', weight: 1, hookGuide: `MAX 6 MOTS, lien actualité + préparation.\n✅ "Inflation. Ce que tu stockes" / "Sécheresse. Ton eau"` },
    { pillar: 'erreurs_frequentes', label: 'ERREUR', weight: 3, hookGuide: `MAX 6 MOTS, 2e personne + erreur cachée.\n✅ "Tu stockes mal sans le savoir" / "Tu jettes ça trop tôt"` },
    { pillar: 'vrai_faux', label: 'VRAI / FAUX', weight: 2, hookGuide: `MAX 6 MOTS, idée reçue percutante.\n✅ "Les pâtes ne suffisent pas" / "Tu n'es pas prêt"` },
    { pillar: 'checklist', label: 'CHECKLIST', weight: 2, hookGuide: `MAX 6 MOTS, chiffre + contre-intuition.\n✅ "Tu oublies ces 5 choses" / "3 erreurs de débutant"` },
  ],
  themes: [
    { la: 'URGENCE',     ca: '#C25B42', bg: '#141414', card: '#252525' },
    { la: 'MYTHE',       ca: '#D4A843', bg: '#141414', card: '#252525' },
    { la: 'SCÉNARIO',    ca: '#7A9E72', bg: '#141414', card: '#252525' },
    { la: "J'AI TESTÉ",  ca: '#D4A843', bg: '#141414', card: '#252525' },
    { la: 'AUTONOMIE',   ca: '#7A9E72', bg: '#141414', card: '#252525' },
    { la: 'BUDGET',      ca: '#C25B42', bg: '#141414', card: '#252525' },
    { la: 'ACTU',        ca: '#D4A843', bg: '#141414', card: '#252525' },
    { la: 'ERREUR',      ca: '#C25B42', bg: '#141414', card: '#252525' },
    { la: 'VRAI / FAUX', ca: '#D4A843', bg: '#141414', card: '#252525' },
    { la: 'CHECKLIST',   ca: '#7A9E72', bg: '#141414', card: '#252525' },
  ],
  hashtagsTiktok: ['#organisationalimentaire','#stockalimentaire','#anticipation','#autonomiealimentaire','#conseilspratiques','#preparationsimple','#stockutile','#vieorganisee'],
  hashtagsInsta: ['#stockalimentaire','#reservealimentaire','#autonomiealimentaire','#organisationalimentaire','#preparationrepas','#conservesmaison','#economiedomestique','#frugalite','#vieorganisee','#astucescuisine','#astucesvie','#antigaspi','#mealprep','#organisation'],
};

// ─── MAMAN ORGANISÉE — rose foncé / magenta, texte blanc ─────────────────────
const MAMAN_ORGANISEE: Persona = {
  id: 'maman_organisee',
  name: 'MAMAN ORGANISÉE',
  tagline: 'Foyer sans galères',
  ctaSubtitle: 'Guide famille & potager — 11€',
  system: `Tu es créatrice de contenu TikTok/Instagram spécialisée dans la vie de famille organisée.
Positionnement : "Anticiper le quotidien d'un foyer sans paniquer."
Audience : mamans, femmes au foyer, mères de famille qui gèrent la maison et les repas.
Ton : chaleureux, complice, direct. Jamais moralisateur. Jamais survivaliste. Ancré dans le quotidien réel.
Angle : L'IMPRÉVU DU QUOTIDIEN — "quand tu n'as plus rien", "quand tu ne peux pas faire les courses", "quand tout est fermé", "quand tu dois improviser".
JAMAIS : "pénurie", "survie", "catastrophe". TOUJOURS : charge mentale, repas, enfants, budget, organisation.
INTERDIT : contenu éducatif pur, ton neutre, "5 aliments que...", "le savais-tu".
DURÉES : jamais > 5 ans. Riz 2-5 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.
Réponds UNIQUEMENT en JSON valide sans markdown.`,
  formats: [
    { pillar: 'erreurs_frequentes', label: 'ERREUR', weight: 3, hookGuide: `MAX 6 MOTS, erreur concrète de gestion foyer. Tension légère, 2e personne.\n✅ "Tu stockes mal pour une famille" / "Ton stock tient pas 3 jours" / "Tu oublies ça aux courses"` },
    { pillar: 'scenarios_realistes', label: 'SCÉNARIO', weight: 2, hookGuide: `MAX 6 MOTS, scénario quotidien stressant avec enfants.\n✅ "48h sans courses avec enfants" / "Frigo vide + enfants affamés" / "Bloquée chez toi 3 jours"` },
    { pillar: 'repas_debrouille', label: 'REPAS', weight: 2, hookGuide: `MAX 6 MOTS, repas de débrouille sans courses.\n✅ "3 repas sans faire les courses" / "Quand t'as plus rien au frigo" / "Repas rapide avec le stock"` },
    { pillar: 'budget', label: 'BUDGET', weight: 1, hookGuide: `MAX 6 MOTS, budget précis famille. Chiffre euros obligatoire.\n✅ "20€ pour tenir 3 jours" / "Stock famille avec 50€" / "Courses intelligentes maman solo"` },
    { pillar: 'enfants', label: 'ENFANTS', weight: 1, hookGuide: `MAX 6 MOTS, enfants + alimentation. Concret, pas moralisateur.\n✅ "Ce qu'ils mangent vraiment en stock" / "Goûter longue conservation" / "Stock qu'ils acceptent"` },
    { pillar: 'organisation', label: 'ORGANISATION', weight: 1, hookGuide: `MAX 6 MOTS, organisation placard/frigo, charge mentale.\n✅ "Tu ranges mal ton placard" / "FIFO tu le fais mal" / "Ton frigo t'épuise"` },
    { pillar: 'deconstruction_mythes', label: 'MYTHE', weight: 1, hookGuide: `MAX 6 MOTS, idée reçue famille + alimentation.\n✅ "Non, 10kg de pâtes ça suffit pas" / "Faux. Les conserves après date"` },
    { pillar: 'produits_cles', label: 'PRODUITS', weight: 1, hookGuide: `MAX 6 MOTS, produit oublié mais essentiel. Surprise.\n✅ "Personne ne pense à ça" / "Tu oublies toujours ce produit"` },
    { pillar: 'mini_systemes', label: 'SYSTÈME', weight: 1, hookGuide: `MAX 6 MOTS, astuce simple qui change tout.\n✅ "Le truc simple que j'ai mis en place" / "Menu d'urgence façon maman"` },
    { pillar: 'micro_autonomie', label: 'AUTONOMIE', weight: 1, hookGuide: `MAX 6 MOTS, petite autonomie accessible sans jardin.\n✅ "Ce que mon balcon m'évite" / "Germer sans jardin c'est simple"` },
  ],
  // Palette rose foncé bordeaux — alternance bg rose profond / rose moyen, accents magenta/rose vif
  themes: [
    { la: 'ERREUR',       ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'SCÉNARIO',     ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
    { la: 'REPAS',        ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'BUDGET',       ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
    { la: 'ENFANTS',      ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'ORGANISATION', ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
    { la: 'MYTHE',        ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'PRODUITS',     ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
    { la: 'SYSTÈME',      ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'AUTONOMIE',    ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
  ],
  hashtagsTiktok: ['#mamanorganisee','#organisationrepas','#repasenfants','#stockmaison','#chargementale','#astucesmaman','#budgetfamille','#organisationfoyer'],
  hashtagsInsta: ['#mamanorganisee','#organisationrepas','#repasenfants','#stockmaison','#chargementale','#astucesmaman','#budgetfamille','#organisationfoyer','#mealprep','#repasrapide','#cuisinefamille','#astucesvie','#antigaspi','#organisation'],
};

export const PERSONAS: Record<PersonaId, Persona> = {
  prevoir_utile: PREVOIR_UTILE,
  maman_organisee: MAMAN_ORGANISEE,
};
