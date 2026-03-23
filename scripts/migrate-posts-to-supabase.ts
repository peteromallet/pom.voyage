import fs from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter, extractExcerpt } from '../src/lib/local-posts';

const POSTS_DIR = path.resolve(process.cwd(), 'posts');

function extractTitle(content: string) {
  const titleMatch = content.match(/^#\s+(.+)/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled';
}

async function main() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  }

  const files = (await fs.readdir(POSTS_DIR)).filter((file) => file.endsWith('.md'));
  const payload = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, '');
      const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
      const { metadata, content } = parseFrontmatter(raw);

      return {
        slug,
        title: extractTitle(content),
        date: metadata.date || null,
        draft: metadata.draft === 'true',
        markdown: content,
        excerpt: extractExcerpt(content),
      };
    }),
  );

  const response = await fetch(`${supabaseUrl}/rest/v1/posts?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Migration failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  console.log(`Upserted ${data.length} posts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
