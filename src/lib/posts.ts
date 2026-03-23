import type { PostDetail, PostPageData, PostSummary } from '../types';
import { getLocalPostPage, getLocalPosts } from './local-posts';
import { formatDate, renderMarkdown } from './markdown';
import { hasPublicSupabaseConfig, supabaseRestRequest } from './supabase';

interface SupabasePostRow {
  slug: string;
  title: string;
  date: string;
  draft?: boolean;
  markdown?: string;
  excerpt: string;
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

function normalizeDetail(row: SupabasePostRow): PostDetail {
  return {
    ...normalizeSummary(row),
    html: renderMarkdown(row.markdown ?? ''),
  };
}

async function getSupabasePosts() {
  const rows = await supabaseRestRequest<SupabasePostRow[]>(
    'posts?select=slug,title,date,excerpt&draft=is.false&order=date.desc',
  );
  return rows.map(normalizeSummary);
}

async function getSupabasePostPage(slug: string): Promise<PostPageData> {
  const encodedSlug = encodeURIComponent(slug);
  const [postRows, allRows] = await Promise.all([
    supabaseRestRequest<SupabasePostRow[]>(
      `posts?select=slug,title,date,excerpt,markdown&slug=eq.${encodedSlug}&draft=is.false&limit=1`,
    ),
    supabaseRestRequest<SupabasePostRow[]>(
      'posts?select=slug,title,date,excerpt&draft=is.false&order=date.desc',
    ),
  ]);

  const current = postRows[0];
  if (!current) {
    return {
      post: null,
      prevPost: null,
      nextPost: null,
    };
  }

  const posts = allRows.map(normalizeSummary);
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  return {
    post: normalizeDetail(current),
    prevPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
    nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
  };
}

export async function getPosts(): Promise<PostSummary[]> {
  if (!hasPublicSupabaseConfig()) {
    return getLocalPosts();
  }

  try {
    return await getSupabasePosts();
  } catch (error) {
    console.warn('Falling back to local markdown posts:', error);
    return getLocalPosts();
  }
}

export async function getPostPage(slug: string): Promise<PostPageData> {
  if (!hasPublicSupabaseConfig()) {
    return getLocalPostPage(slug);
  }

  try {
    return await getSupabasePostPage(slug);
  } catch (error) {
    console.warn(`Falling back to local markdown for post ${slug}:`, error);
    return getLocalPostPage(slug);
  }
}
