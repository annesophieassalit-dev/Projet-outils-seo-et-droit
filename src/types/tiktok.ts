export type ContentType = 'carousel' | 'video_long';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type Pillar = 'vrai_faux' | 'cuisson_sans_energie' | 'stock_petit_budget' | 'checklist' | 'erreurs_frequentes' | 'penuries_possibles' | 'general';

export interface Slide {
  order: number;
  type: 'hook' | 'info' | 'complement' | 'conclusion';
  text: string;
  highlight?: string[];
}

export interface TikTokContent {
  id: string;
  user_id: string;
  account_id?: string;
  content_type: ContentType;
  status: ContentStatus;
  pillar: Pillar;
  title: string;
  hook: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
  scheduled_at?: string;
  published_at?: string;
  tiktok_post_id?: string;
  views_count: number;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  image_urls: string[];
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface TikTokTopic {
  id: string;
  user_id: string;
  title: string;
  pillar: Pillar;
  hook?: string;
  content_type: ContentType;
  used: boolean;
  priority: number;
  created_at: string;
}

export interface TikTokSettings {
  id: string;
  user_id: string;
  auto_publish: boolean;
  post_times: string[];
  timezone: string;
  daily_carousel_count: number;
  daily_video_count: number;
  auto_generate: boolean;
}

export interface TikTokAccount {
  id: string;
  user_id: string;
  tiktok_user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  token_expires_at: string;
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  vrai_faux: 'Vrai / Faux',
  cuisson_sans_energie: 'Cuisson sans énergie',
  stock_petit_budget: 'Stock petit budget',
  checklist: 'Checklist',
  erreurs_frequentes: 'Erreurs fréquentes',
  penuries_possibles: 'Pénuries possibles',
  general: 'Général',
};

export const HASHTAGS_BASE = [
  '#organisationalimentaire',
  '#stockalimentaire',
  '#anticipation',
  '#autonomiealimentaire',
  '#conservesmaison',
  '#conseilspratiques',
  '#organisationcuisine',
  '#preparationsimple',
  '#stockutile',
  '#vieorganisee',
];
