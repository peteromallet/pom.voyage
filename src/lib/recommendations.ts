import type { RecommendationEntry } from '../types';
import { supabaseRestRequest } from './supabase';

export async function getRecommendationsList(): Promise<RecommendationEntry[]> {
  return supabaseRestRequest<RecommendationEntry[]>(
    'recommendations?order=created_at.desc&select=id,name,role_title,emoji,linkedin_url,location,body_markdown,image_url,intro_url,context,status,is_hired,is_freelancer,sort_order,created_at',
  );
}
