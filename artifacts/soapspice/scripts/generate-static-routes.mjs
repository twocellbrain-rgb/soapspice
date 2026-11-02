import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist/public');
// Bundle the actual React pages for build-time rendering; no browser download,
// network request, production backend, or extra runtime hosting is needed.
await build({
  configFile: path.join(root, 'vite.config.ts'),
  mode: 'production',
  build: {
    ssr: path.join(root, 'src/entry-server.tsx'),
    outDir: path.join(root, 'dist/prerender'),
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: 'entry-server.mjs' } },
  },
});
const { render, pageSeo, staticPaths, indexablePaths, sitemapXml } =
  await import(pathToFileURL(path.join(root, 'dist/prerender/entry-server.mjs')).href);
const template = await readFile(path.join(output, 'index.html'), 'utf8');
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);

function documentFor(route) {
  const seo = pageSeo(route);
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(seo.title)}</title>`);
  for (const key of ['description', 'og:description', 'twitter:description', 'og:title', 'twitter:title', 'robots']) {
    const value = key === 'robots' ? seo.robots : key.endsWith('title') ? seo.title : seo.description;
    html = html.replace(new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*(")`), (_, before, after) => `${before}${escape(value)}${after}`);
  }
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  const schema = seo.structuredData
    ? `<script type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}</script>` : '';
  html = html.replace('</head>', `<link rel="canonical" href="${escape(seo.canonical)}" />\n<meta property="og:url" content="${escape(seo.canonical)}" />\n${schema}\n</head>`);
  const body = render(route);
  if (!body.includes('<h1')) throw new Error(`Missing rendered page content for ${route}`);
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing React root in build template');
  return html.replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
}
for (const route of staticPaths) {
  if (!/^\/[a-z0-9/-]*$/.test(route) || route.split('/').includes('..')) throw new Error(`Invalid route: ${route}`);
  const directory = path.join(output, route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), documentFor(route));
}
await writeFile(path.join(output, '404.html'), documentFor('/not-found'));
await writeFile(path.join(output, 'sitemap.xml'), sitemapXml());
console.log(`Pre-rendered ${staticPaths.length} complete HTML pages and a noindex 404; sitemap lists ${indexablePaths.length} public URLs.`);
