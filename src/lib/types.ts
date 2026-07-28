import { supabase } from './supabase';
import type { BoardType } from './board';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

/**
 * v4.0 評分維度 key。未來加維度只加 key，schema/RLS 不改。
 * 必填：overall
 * 選填：teaching / material / admin / environment / transport / price (Phase C 開放)
 */
export type RatingDimension =
  | 'overall'
  | 'teaching'
  | 'material'
  | 'admin'
  | 'environment'
  | 'transport'
  | 'price';

export type RatingSchema = Partial<Record<RatingDimension, number>> & {
  overall: number;
};

export interface SchoolReview {
  id: number;
  school_id: string;
  user_id: string;
  stars: RatingSchema;
  comment_text: string;
  created_at: string;
  profile?: Profile | null;
}

export interface Listing {
  id: number;
  user_id: string;
  type: BoardType;
  region: string;
  title: string;
  description: string;
  price: string | null;
  contact_info: string;
  photo_urls: string[];
  expires_at: string;
  created_at: string;
  profile?: Profile | null;
}

export interface School {
  id: string;
  name_zh: string;
  name_de: string;
  city: string;
  city_key?: string;
  level: string;
  website?: string;
  note?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

/** 有值維度算術平均；至少含 overall。 */
export function computeOverall(stars: RatingSchema): number {
  const vals = Object.values(stars).filter((v): v is number => typeof v === 'number');
  if (vals.length === 0) return stars.overall;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

export async function attachProfiles<T extends { user_id: string; profile?: Profile | null }>(
  rows: T[]
): Promise<T[]> {
  if (rows.length === 0) return rows;
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, created_at')
    .in('id', ids);
  if (error || !data) return rows;
  const map = new Map<string, Profile>(data.map((p) => [p.id, p as Profile]));
  return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
}
