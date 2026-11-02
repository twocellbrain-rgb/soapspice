import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { indexablePaths, staticPaths, pageSeo, sitemapXml } from '../dist/prerender/entry-server.mjs';

const output = new URL('../dist/public/', import.meta.url);
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const htmlFor = route => readFile(new URL(`${route === '/' ? '' : route.slice(1) + '/'}index.html`, output), 'utf8');

test('every route contains real React-rendered HTML, unique metadata, and one canonical URL', async () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of staticPaths) {
    const html = await htmlFor(route);
    const seo = pageSeo(route);
    assert.match(html, /<div id="root"><(?:link|div|section|main)/, route);
    assert.match(html, /<h1[\s>]/, route);
    assert.ok(html.includes(`<title>${escape(seo.title)}</title>`), route);
    assert.ok(html.includes(`name="description" content="${escape(seo.description)}"`), route);
    assert.ok(html.includes(`name="robots" content="${seo.robots}"`), route);
    assert.ok(html.includes(`rel="canonical" href="${escape(seo.canonical)}"`), route);
    assert.ok(html.includes(`property="og:url" content="${escape(seo.canonical)}"`), route);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, route);
    assert.equal((html.match(/<title>/g) ?? []).length, 1, route);
    assert.ok(!html.includes('janeway.replit.dev'), route);
    assert.ok(!titles.has(seo.title), `Duplicate title: ${route}`);
    assert.ok(!descriptions.has(seo.description), `Duplicate description: ${route}`);
    titles.add(seo.title);
    descriptions.add(seo.description);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.equal(JSON.parse(match[1]).url, seo.canonical, route);
    }
  }
});

test('all 42 ingredient pages expose names, SAP values, and source citations without JavaScript', async () => {
  const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url)));
  assert.equal(catalog.length, 42);
  for (const ingredient of catalog) {
    const html = await htmlFor(`/ingredients/${ingredient.id}`);
    assert.ok(html.includes(escape(ingredient.name)), ingredient.id);
    assert.ok(html.includes(ingredient.naohSap.toFixed(3)), ingredient.id);
    assert.ok(html.includes(escape(ingredient.sapSourceUrl)), ingredient.id);
    assert.ok(html.includes('Use in calculator'), ingredient.id);
  }
});

test('generated sitemap includes every indexable canonical page and excludes session pages', async () => {
  const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8');
  assert.equal(sitemap, sitemapXml());
  assert.match(sitemap, /^<\?xml/);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, indexablePaths.map(route => pageSeo(route).canonical));
  assert.equal(new Set(urls).size, urls.length);
  for (const route of staticPaths.filter(route => !indexablePaths.includes(route))) {
    assert.ok(!urls.includes(pageSeo(route).canonical), route);
  }
  const robots = await readFile(new URL('robots.txt', output), 'utf8');
  assert.ok(robots.includes('Sitemap: https://soapspice.com/sitemap.xml'));
  assert.ok(robots.includes('Allow: /'));
});

test('the colorful branded SVG favicon is present in the deployment output', async () => {
  const index = await readFile(new URL('index.html', output), 'utf8');
  const icon = await readFile(new URL('favicon.svg', output), 'utf8');
  assert.match(index, /rel="icon" type="image\/svg\+xml" href="\/favicon\.svg\?v=2" sizes="any"/);
  assert.match(icon, /viewBox="0 0 64 64"/);
  assert.ok(icon.includes('#21484A') && icon.includes('#F47A24') && icon.includes('>S</text>'));
});

test('404 and unknown ingredients are noindex; Apache no longer returns the homepage for unknown paths', async () => {
  const html = await readFile(new URL('404.html', output), 'utf8');
  assert.ok(html.includes('name="robots" content="noindex, follow"'));
  assert.equal(pageSeo('/ingredients/not-a-real-ingredient').indexable, false);
  assert.equal(pageSeo('/ingredients/olive-oil/?tracking=anything').canonical, 'https://soapspice.com/ingredients/olive-oil/');
  const htaccess = await readFile(new URL('.htaccess', output), 'utf8');
  assert.match(htaccess, /ErrorDocument 404 \/404.html/);
  assert.ok(!htaccess.includes('RewriteRule ^ index.html'));
});
