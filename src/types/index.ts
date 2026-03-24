export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  formattedDate: string;
}

export interface PostDetail extends PostSummary {
  html: string;
}

export interface PostPageData {
  post: PostDetail | null;
  prevPost: PostSummary | null;
  nextPost: PostSummary | null;
}

export interface FeedbackEntry {
  id: string;
  is_anonymous: boolean;
  x_username: string | null;
  x_avatar_url: string | null;
  x_followers_count: number | null;
  x_account_created_at: string | null;
  is_suspicious: boolean;
  feedback_text: string;
  image_paths: string[];
  owner_response: string | null;
  owner_response_at: string | null;
  created_at: string;
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export type InitialData =
  | { page: 'home' }
  | { page: 'posts'; posts: PostSummary[] }
  | { page: 'post'; postPage: PostPageData }
  | { page: 'assorted' }
  | { page: 'feedback'; feedback: FeedbackEntry[] }
  | { page: 'accountability' }
  | { page: 'projects' }
  | { page: 'crypto-conversations' }
  | { page: 'crypto-conversation'; conversationId: string }
  | { page: 'mute-list' }
  | { page: '404' };
