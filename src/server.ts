import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import type { ViteDevServer } from 'vite';
import { CONVERSATION_DETAILS } from './data/assorted-content';
import { getPostPage, getPosts } from './lib/posts';
import { getPublicSupabaseConfig } from './lib/supabase';
import type { InitialData } from './types';

const root = process.cwd();

// In dev, load .env file vars into process.env. In production, Railway provides them directly.
async function loadDevEnv() {
  try {
    const { loadEnv } = await import('vite');
    const envVars = loadEnv('development', root, '');
    for (const [key, value] of Object.entries(envVars)) {
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // vite not available (production) — env vars come from Railway
  }
}
await loadDevEnv();

const PAGE_TITLES: Partial<Record<InitialData['page'], string>> = {
  accountability: 'Accountability - POM',
  projects: 'Projects - POM',
  'crypto-conversations': 'Crypto Conversations - POM',
  'mute-list': 'Mute List - POM',
  assorted: 'Assorted - POM',
  '404': '404 - Page Not Found',
};

function getPageTitle(data: InitialData) {
  if (data.page === 'post' && data.postPage?.post) {
    return `${data.postPage.post.title} - POM`;
  }
  if (data.page === 'crypto-conversation' && data.conversationId && CONVERSATION_DETAILS[data.conversationId]) {
    return `${CONVERSATION_DETAILS[data.conversationId].title} - POM`;
  }
  return PAGE_TITLES[data.page] ?? 'POM';
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

async function createApp() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = Number(process.env.PORT || 3002);
  const host = '0.0.0.0';
  const app = express();
  let vite: ViteDevServer | undefined;

  app.use('/assets', express.static(path.resolve(root, 'assets')));
  app.use('/favicon.ico', express.static(path.resolve(root, 'favicon.ico')));
  app.use('/CNAME', express.static(path.resolve(root, 'CNAME')));

  if (!isProd) {
    const viteModule = await import('vite');
    vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(root, 'dist/client'), { index: false }));
  }

  app.use(async (req, res) => {
    try {
      const pathname = req.path;

      if (pathname === '/projects' || pathname === '/projects/') {
        res.redirect(301, '/assorted/projects');
        return;
      }

      if (pathname.startsWith('/housekeeping')) {
        res.redirect(301, pathname.replace('/housekeeping', '/assorted'));
        return;
      }

      if (pathname.startsWith('/sorted')) {
        res.redirect(301, pathname.replace('/sorted', '/assorted'));
        return;
      }

      if (pathname.length > 1 && pathname.endsWith('/') && !pathname.startsWith('/assets/')) {
        res.redirect(301, pathname.replace(/\/+$/, '') + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
        return;
      }

      let status = 200;
      let data: InitialData = { page: 'home' };

      if (pathname === '/') {
        data = { page: 'home' };
      } else if (pathname === '/404') {
        status = 404;
        data = { page: '404' };
      } else if (pathname === '/posts') {
        data = { page: 'posts', posts: await getPosts() };
      } else if (/^\/posts\/[^/]+$/.test(pathname)) {
        const slug = pathname.split('/').pop() ?? '';
        const postPage = await getPostPage(slug);
        if (!postPage.post) {
          status = 404;
          data = { page: '404' };
        } else {
          data = { page: 'post', postPage };
        }
      } else if (
        pathname === '/assorted' ||
        pathname === '/assorted/accountability' ||
        pathname === '/assorted/projects' ||
        pathname === '/assorted/crypto-conversations' ||
        pathname === '/assorted/mute-list' ||
        /^\/assorted\/crypto-conversations\/[A-Za-z0-9_]+$/.test(pathname)
      ) {
        if (pathname.startsWith('/assorted/crypto-conversations/')) {
          const conversationId = pathname.split('/').pop() ?? '';
          if (!CONVERSATION_DETAILS[conversationId]) {
            status = 404;
            data = { page: '404' };
          } else {
            data = { page: 'crypto-conversation', conversationId };
          }
        } else if (pathname === '/assorted/accountability') {
          data = { page: 'accountability' };
        } else if (pathname === '/assorted/projects') {
          data = { page: 'projects' };
        } else if (pathname === '/assorted/crypto-conversations') {
          data = { page: 'crypto-conversations' };
        } else if (pathname === '/assorted/mute-list') {
          data = { page: 'mute-list' };
        } else {
          data = { page: 'assorted' };
        }
      } else {
        status = 404;
        data = { page: '404' };
      }

      const config = getPublicSupabaseConfig();
      const templatePath = !isProd ? path.resolve(root, 'index.html') : path.resolve(root, 'dist/client/index.html');
      let template = await fs.readFile(templatePath, 'utf8');
      let render: (url: string, data: InitialData) => { html: string };

      let headTags = '';

      if (!isProd && vite) {
        template = await vite.transformIndexHtml(req.originalUrl, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
        // Collect CSS from SSR module graph to prevent FOUC in dev mode
        const modules = vite.moduleGraph.getModulesByFile(path.resolve(root, 'src/entry-server.tsx'));
        const cssUrls = new Set<string>();
        function collectCss(mod: any, seen = new Set<string>()) {
          if (!mod?.id || seen.has(mod.id)) return;
          seen.add(mod.id);
          if (mod.id.endsWith('.css') || mod.id.includes('.module.css')) {
            cssUrls.add(mod.url);
          }
          mod.importedModules?.forEach((dep: any) => collectCss(dep, seen));
        }
        modules?.forEach((mod: any) => collectCss(mod));
        // Also collect from all loaded modules
        for (const [, mod] of vite.moduleGraph.idToModuleMap) {
          if (mod.id && (mod.id.endsWith('.css') || mod.id.includes('.module.css'))) {
            cssUrls.add(mod.url);
          }
        }
        if (cssUrls.size > 0) {
          headTags = Array.from(cssUrls).map(url => `<link rel="stylesheet" href="${url}">`).join('\n');
        }
      } else {
        render = (await import(path.resolve(root, 'dist/server/entry-server.js'))).render;
        // Rewrite dev paths to production bundle paths from Vite manifest
        try {
          const manifestPath = path.resolve(root, 'dist/client/.vite/manifest.json');
          const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
          const entry = manifest['src/entry-client.tsx'];
          if (entry?.css) {
            headTags = entry.css.map((f: string) => `<link rel="stylesheet" href="/${f}">`).join('\n');
          }
          if (entry?.file) {
            // Replace dev script with production bundle
            template = template.replace(
              '<script type="module" src="/src/entry-client.tsx"></script>',
              `<script type="module" src="/${entry.file}"></script>`,
            );
          }
          // Remove dev-only global.css link (it's bundled into the CSS file in prod)
          template = template.replace(
            '<link rel="stylesheet" href="/src/styles/global.css" />',
            '',
          );
        } catch { /* manifest read failed */ }
      }

      const { html } = render(req.originalUrl, data);
      const title = getPageTitle(data);

      const responseHtml = template
        .replace('__APP_TITLE__', title)
        .replace('__APP_HTML__', html)
        .replace('"%%INJECT_DATA%%"', safeJson(data))
        .replace('"%%INJECT_CONFIG%%"', safeJson(config))
        .replace('__APP_HEAD__', headTags);

      res.status(status).set({ 'Content-Type': 'text/html' }).end(responseHtml);
    } catch (error) {
      vite?.ssrFixStacktrace(error as Error);
      console.error(error);
      res.status(500).end('Internal Server Error');
    }
  });

  app.listen(port, host, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}

createApp();
