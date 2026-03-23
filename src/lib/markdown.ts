import { marked } from 'marked';

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])javascript:[\s\S]*?\2/gi, ' $1="#"');
}

export function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

export function renderMarkdown(markdown: string) {
  const contentWithoutTitle = markdown.replace(/^#\s+.+$/m, '').trim();
  let html = marked.parse(contentWithoutTitle) as string;
  html = html.replace(/src="\.\.\/assets\//g, 'src="https://ddbobialzdjkzainyqgb.supabase.co/storage/v1/object/public/assets/');
  html = html.replace(/<video([^>]*)>/g, '<video$1 playsinline preload="metadata" muted>');
  return sanitizeHtml(html);
}
