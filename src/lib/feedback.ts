import type { FeedbackEntry } from '../types';
import { getPublicSupabaseConfig, supabaseServiceRequest } from './supabase';

export async function getFeedbackList(): Promise<FeedbackEntry[]> {
  return supabaseServiceRequest<FeedbackEntry[]>(
    'feedback?is_private=eq.false&order=created_at.desc&select=id,is_anonymous,x_username,x_avatar_url,x_followers_count,x_account_created_at,is_suspicious,title,feedback_text,image_paths,owner_response,owner_response_at,created_at',
  );
}

export function getPublicImageUrl(bucketPath: string): string {
  const browserUrl = typeof window !== 'undefined' ? window.__APP_CONFIG__?.supabaseUrl : '';
  const { supabaseUrl } = getPublicSupabaseConfig();
  const baseUrl = browserUrl || supabaseUrl;
  if (!baseUrl) {
    return bucketPath;
  }

  return `${baseUrl}/storage/v1/object/public/feedback-images/${bucketPath}`;
}
