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
  text?: string; // text override for light backgrounds
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

// ─── MAMAN ORGANISÉE (@toujoursprete) — pénurie + quotidien famille ──────────
const MAMAN_ORGANISEE: Persona = {
  id: 'maman_organisee',
  name: 'MAMAN ORGANISÉE',
  tagline: 'Toujours prête',
  ctaSubtitle: 'Guide famille & potager — 11€',
  system: `Tu es créatrice de contenu TikTok/Instagram pour @toujoursprete.
Positionnement : "Anticiper les galères du quotidien avec des enfants — pénuries, frigo vide, fin de mois — sans paniquer."
Audience : mamans et femmes qui gèrent un foyer avec un budget réel.
Ton : complice, direct, pratique. Comme une amie qui a les solutions. Jamais moralisateur, jamais catastrophiste.

THÈME CENTRAL : la pénurie et l'imprévu au quotidien. Chaque post part d'un problème concret (rayon vide, fin de mois, frigo vide, coupure imprévue) et donne une solution immédiatement applicable.

ANGLES (varie impérativement à chaque post) :
• Pénuries concrètes : "il n'y a plus de X — voici par quoi je le remplace et comment j'adapte les repas"
• Fin de mois serrée : menu, courses, repas avec ce qui reste, chiffre euros obligatoire
• Rangement malin : frigo, placard, FIFO, rotation des stocks, éviter le gaspillage
• Charge mentale : systèmes simples pour ne plus y penser (menus fixes, listes automatiques, batch cooking)
• Potager avec rien : balcon, rebord de fenêtre, germination, herbes fraîches sans jardin
• Nutrition avec le stock : protéines, vitamines, équilibre sans produits frais
• Actu économique et sociale réelle : chiffres INSEE inflation, grèves (transports/commerce), sécheresses impact récoltes, tensions sociales pouvoir d'achat — toujours lié à la solution famille concrète

JAMAIS : catastrophisme, survivalisme, "fin du monde". TOUJOURS : solutions pratiques dans le vrai quotidien.
INTERDIT : hooks génériques sans tension, ton éducatif neutre.
DURÉES : jamais > 5 ans. Riz 2-5 ans, pâtes 2-3 ans, conserves 2-5 ans, huile 1-2 ans.
IMPORTANT : sujet SPÉCIFIQUE à chaque fois — "les lentilles corail quand la viande manque" pas "les protéines en stock".
Réponds UNIQUEMENT en JSON valide sans markdown.`,
  formats: [
    { pillar: 'penuries',           label: 'PÉNURIE',       weight: 3, hookGuide: `MAX 6 MOTS, produit manquant + réaction directe. Tension immédiate.\n✅ "Plus d'huile. Voici mes remplaçants" / "Ces rayons sont vides. Mon plan" / "Cette pénurie change mes repas"` },
    { pillar: 'budget',             label: 'FIN DE MOIS',   weight: 3, hookGuide: `MAX 6 MOTS, chiffre euros + situation famille. Ultra relatable.\n✅ "20€ pour tenir 3 jours" / "Frigo vide, enfants affamés" / "Fin de mois. J'ai fait ça"` },
    { pillar: 'organisation',       label: 'RANGEMENT',     weight: 2, hookGuide: `MAX 6 MOTS, erreur de rangement ou révélation. 2e personne.\n✅ "Tu ranges ton frigo comme ça ?" / "FIFO tu le fais vraiment ?" / "Ton placard te coûte cher"` },
    { pillar: 'mini_systemes',      label: 'CHARGE MENTALE',weight: 2, hookGuide: `MAX 6 MOTS, système libérateur, résultat concret.\n✅ "J'ai arrêté de réfléchir aux repas" / "Le système qui m'a soulagée" / "Plus jamais la panique du soir"` },
    { pillar: 'micro_autonomie',    label: 'POTAGER',       weight: 2, hookGuide: `MAX 6 MOTS, mini-potager accessible, résultat surprenant.\n✅ "Mon rebord de fenêtre me nourrit" / "Germer sans jardin, sans argent" / "Ce balcon change tout"` },
    { pillar: 'repas_debrouille',   label: 'NUTRITION',     weight: 2, hookGuide: `MAX 6 MOTS, nutrition réelle avec stock. Concret enfants.\n✅ "Tes enfants mangent équilibré. Sans frigo" / "Protéines sans viande avec stock" / "Vitamines même sans légumes frais"` },
    { pillar: 'newsjacking',        label: 'ACTU',          weight: 2, hookGuide: `MAX 6 MOTS, actu économique ou sociale RÉELLE + impact famille. Chiffre ou fait précis.\n✅ "+8% sur les courses ce mois" / "Grève annoncée. Je prépare quoi ?" / "Ces récoltes manqueront cet hiver" / "Canicule prolongée. Mon stock s'adapte"` },
    { pillar: 'erreurs_frequentes', label: 'ERREUR',        weight: 2, hookGuide: `MAX 6 MOTS, erreur courante + tension. 2e personne.\n✅ "Tu stockes ce qui expire en premier" / "Ton frigo gaspille sans le savoir" / "Cette erreur te coûte 50€/mois"` },
    { pillar: 'scenarios_realistes',label: 'SCÉNARIO',      weight: 1, hookGuide: `MAX 6 MOTS, scénario réel + durée précise. Relatable.\n✅ "48h sans supermarché avec enfants" / "Bloquée chez toi 3 jours — menu" / "Grève ce weekend. T'es prête ?"` },
    { pillar: 'deconstruction_mythes',label: 'MYTHE',       weight: 1, hookGuide: `MAX 6 MOTS, idée reçue percutante. Direct.\n✅ "Non, 10kg de pâtes ça suffit pas" / "Faux. Le congélo ne sauve pas tout" / "Le bio en stock ? À revoir"` },
  ],
  // Alternance : dark bordeaux / rose vif / blanc ACTU — feed varié
  themes: [
    { la: 'PÉNURIE',       ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'FIN DE MOIS',   ca: '#FFFFFF', bg: '#FF3D9A', card: '#CC1060' },
    { la: 'RANGEMENT',     ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'CHARGE MENTALE',ca: '#FFFFFF', bg: '#FF3D9A', card: '#CC1060' },
    { la: 'POTAGER',       ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
    { la: 'NUTRITION',     ca: '#FFFFFF', bg: '#FF3D9A', card: '#CC1060' },
    { la: 'ACTU',          ca: '#FF3D9A', bg: '#FFFFFF', card: '#FFF0F5', text: '#3D0825' },
    { la: 'ERREUR',        ca: '#FF3D9A', bg: '#5C1035', card: '#3D0825' },
    { la: 'SCÉNARIO',      ca: '#FFFFFF', bg: '#FF3D9A', card: '#CC1060' },
    { la: 'MYTHE',         ca: '#FF80C0', bg: '#3D0825', card: '#5C1035' },
  ],
  hashtagsTiktok: ['#toujoursprete','#penuriestock','#frugalite','#stockmaison','#chargementale','#astucesmaman','#budgetfamille','#organisationfoyer'],
  hashtagsInsta: ['#toujoursprete','#penuriestock','#stockmaison','#organisationrepas','#chargementale','#astucesmaman','#budgetfamille','#organisationfoyer','#mealprep','#frugalite','#cuisinefamille','#astucesvie','#antigaspi','#autonomiealimentaire'],
};

export const PERSONAS: Record<PersonaId, Persona> = {
  prevoir_utile: PREVOIR_UTILE,
  maman_organisee: MAMAN_ORGANISEE,
};
