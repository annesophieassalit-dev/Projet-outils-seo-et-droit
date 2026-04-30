export type ContentType = 'carousel' | 'video_long';
export type PersonaId = 'prevoir_utile' | 'maman_organisee';

export type Pillar =
  | 'urgence'
  | 'deconstruction_mythes'
  | 'scenarios_realistes'
  | 'experience_personnelle'
  | 'micro_autonomie'
  | 'budget'
  | 'newsjacking'
  | 'erreurs_frequentes'
  | 'vrai_faux'
  | 'checklist'
  | 'repas_debrouille'
  | 'enfants'
  | 'organisation'
  | 'produits_cles'
  | 'mini_systemes';

export interface Slide {
  order: number;
  type: 'hook' | 'info' | 'complement' | 'conclusion';
  text: string;
  highlight?: string[];
}

export interface Content {
  id: string;
  persona: PersonaId;
  content_type: ContentType;
  pillar: Pillar;
  title: string;
  hook: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  hashtags_insta?: string[];
  status: 'draft' | 'ready';
  created_at: string;
  image_svgs?: string[];
  themeIndex?: number;
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  urgence: 'Urgence',
  deconstruction_mythes: 'Mythe',
  scenarios_realistes: 'Scénario',
  experience_personnelle: "J'ai testé",
  micro_autonomie: 'Micro autonomie',
  budget: 'Budget',
  newsjacking: 'Actu',
  erreurs_frequentes: 'Erreur',
  vrai_faux: 'Vrai / Faux',
  checklist: 'Checklist',
  repas_debrouille: 'Repas débrouille',
  enfants: 'Enfants',
  organisation: 'Organisation',
  produits_cles: 'Produits clés',
  mini_systemes: 'Mini système',
};
