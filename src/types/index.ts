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

export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export type InitialData =
  | { page: 'home' }
  | { page: 'posts'; posts: PostSummary[] }
  | { page: 'post'; postPage: PostPageData }
  | { page: 'assorted' }
  | { page: 'accountability' }
  | { page: 'projects' }
  | { page: 'crypto-conversations' }
  | { page: 'crypto-conversation'; conversationId: string }
  | { page: 'mute-list' }
  | { page: '404' };
