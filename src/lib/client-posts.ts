import type { AppConfig, PostDetail, PostPageData, PostSummary } from '../types';
import { formatDate, renderMarkdown } from './markdown';

interface SupabasePostRow {
  slug: string;
  title: string;
  date: string;
  markdown?: string;
  excerpt: string;
}

function getClientConfig(): AppConfig | null {
  const config = (window as any).__APP_CONFIG__ as AppConfig | undefined;
  if (!config?.supabaseUrl || !config?.supabaseAnonKey) return null;
  return config;
}

async function clientFetch<T>(config: AppConfig, path: string): Promise<T> {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
    },
  });
  if (!response.ok) throw new Error(`Supabase request failed (${response.status})`);
  return response.json();
}

function normalizeSummary(row: SupabasePostRow): PostSummary {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    date: row.date,
    formattedDate: formatDate(row.date),
  };
}

export async function getClientPosts(): Promise<PostSummary[] | null> {
  const config = getClientConfig();
  if (!config) return null;

  const rows = await clientFetch<SupabasePostRow[]>(
    config,
    'posts?select=slug,title,date,excerpt&draft=is.false&order=date.desc',
  );
  return rows.map(normalizeSummary);
}

export async function getClientPostPage(slug: string): Promise<PostPageData | null> {
  const config = getClientConfig();
  if (!config) return null;

  const encodedSlug = encodeURIComponent(slug);
  const [postRows, allRows] = await Promise.all([
    clientFetch<SupabasePostRow[]>(
      config,
      `posts?select=slug,title,date,excerpt,markdown&slug=eq.${encodedSlug}&draft=is.false&limit=1`,
    ),
    clientFetch<SupabasePostRow[]>(
      config,
      'posts?select=slug,title,date,excerpt&draft=is.false&order=date.desc',
    ),
  ]);

  const current = postRows[0];
  if (!current) return { post: null, prevPost: null, nextPost: null };

  const posts = allRows.map(normalizeSummary);
  const currentIndex = posts.findIndex((p) => p.slug === slug);

  return {
    post: {
      ...normalizeSummary(current),
      html: renderMarkdown(current.markdown ?? ''),
    },
    prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
}
