import fs from 'node:fs/promises';
import path from 'node:path';
import type { PostDetail, PostPageData, PostSummary } from '../types';
import { formatDate, renderMarkdown } from './markdown';

export function parseFrontmatter(raw: string) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = raw.match(frontmatterRegex);

  if (!match) {
    return { metadata: {} as Record<string, string>, content: raw };
  }

  const metadata: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;
    metadata[line.slice(0, colonIndex).trim()] = line.slice(colonIndex + 1).trim();
  }

  return {
    metadata,
    content: raw.slice(match[0].length),
  };
}

function extractTitle(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (!titleMatch) return null;
  return titleMatch[1].trim();
}

export function extractExcerpt(content: string) {
  const contentWithoutTitle = content.replace(/^#\s+.+$/m, '').trim();
  const lines = contentWithoutTitle.split('\n');
  let excerpt = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('<')) continue;
    excerpt = trimmed;
    break;
  }

  excerpt = excerpt.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const fullExcerpt = excerpt;
  const shortened = fullExcerpt.substring(0, 30);
  return shortened.length === 30 && fullExcerpt.length > 30 ? `${shortened}...` : shortened;
}

async function readLocalPosts(): Promise<PostDetail[]> {
  const POSTS_DIR = path.resolve(process.cwd(), 'posts');
  const files = (await fs.readdir(POSTS_DIR)).filter((file) => file.endsWith('.md'));
  const posts = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
      const { metadata, content } = parseFrontmatter(raw);
      if (metadata.draft === 'true') return null;
      const date = metadata.date;
      if (!date) return null;
      const title = extractTitle(content);
      if (!title) return null;

      return {
        slug,
        title,
        excerpt: extractExcerpt(content),
        date,
        formattedDate: formatDate(date),
        html: renderMarkdown(content),
      } satisfies PostDetail;
    }),
  );

  return posts
    .filter((post): post is PostDetail => Boolean(post))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getLocalPosts() {
  const posts = await readLocalPosts();
  return posts.map(({ html: _html, ...summary }) => summary satisfies PostSummary);
}

export async function getLocalPostPage(slug: string): Promise<PostPageData> {
  const posts = await readLocalPosts();
  const currentIndex = posts.findIndex((post) => post.slug === slug);

  if (currentIndex === -1) {
    return {
      post: null,
      prevPost: null,
      nextPost: null,
    };
  }

  const post = posts[currentIndex];
  const prev = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const next = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;
  const toSummary = (value: PostDetail): PostSummary => ({
    slug: value.slug,
    title: value.title,
    excerpt: value.excerpt,
    date: value.date,
    formattedDate: value.formattedDate,
  });

  return {
    post,
    prevPost: prev ? toSummary(prev) : null,
    nextPost: next ? toSummary(next) : null,
  };
}
