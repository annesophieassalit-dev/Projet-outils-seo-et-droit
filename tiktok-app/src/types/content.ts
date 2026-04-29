export type ContentType = 'carousel' | 'video_long';

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
  | 'checklist';

export interface Slide {
  order: number;
  type: 'hook' | 'info' | 'complement' | 'conclusion';
  text: string;
  highlight?: string[];
}

export interface Content {
  id: string;
  content_type: ContentType;
  pillar: Pillar;
  title: string;
  hook: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  status: 'draft' | 'ready';
  created_at: string;
  image_svgs?: string[];
  themeIndex?: number;
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  urgence: 'Urgence / Panique',
  deconstruction_mythes: 'Déconstruction de mythes',
  scenarios_realistes: 'Scénarios réalistes',
  experience_personnelle: "J'ai testé",
  micro_autonomie: 'Micro autonomie',
  budget: 'Budget',
  newsjacking: 'Actu / News',
  erreurs_frequentes: 'Erreurs fréquentes',
  vrai_faux: 'Vrai / Faux',
  checklist: 'Checklist',
};
