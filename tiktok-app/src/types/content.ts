export type ContentType = 'carousel' | 'video_long';
export type Pillar = 'vrai_faux' | 'cuisson_sans_energie' | 'stock_petit_budget' | 'checklist' | 'erreurs_frequentes' | 'penuries_possibles';

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
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  vrai_faux: 'Vrai / Faux',
  cuisson_sans_energie: 'Cuisson sans énergie',
  stock_petit_budget: 'Stock petit budget',
  checklist: 'Checklist',
  erreurs_frequentes: 'Erreurs fréquentes',
  penuries_possibles: 'Pénuries possibles',
};
