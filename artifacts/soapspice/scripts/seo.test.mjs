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
    assert.ok(html.includes('property="og:site_name" content="SoapSpice"'), route);
    assert.ok(html.includes('property="og:locale" content="en_US"'), route);
    assert.ok(html.includes('property="og:image" content="https://soapspice.com/images/soapspice-social-card.jpg"'), route);
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), route);
    assert.ok(html.includes('name="twitter:image" content="https://soapspice.com/images/soapspice-social-card.jpg"'), route);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, route);
    assert.equal((html.match(/<title>/g) ?? []).length, 1, route);
    assert.ok(!html.includes('janeway.replit.dev'), route);
    assert.ok(!titles.has(seo.title), `Duplicate title: ${route}`);
    assert.ok(!descriptions.has(seo.description), `Duplicate description: ${route}`);
    if (seo.indexable) {
      assert.ok(seo.description.length >= 130 && seo.description.length <= 160, `Description should be concise but useful: ${route}`);
    }
    titles.add(seo.title);
    descriptions.add(seo.description);
    for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const graph = JSON.parse(match[1]);
      assert.ok(graph['@graph'].some(entity => entity.url === seo.canonical), route);
      assert.ok(graph['@graph'].some(entity =>
        entity['@type'] === 'Organization'
        && entity.email === 'contactus@soapspice.com'
        && entity.contactPoint?.url === 'https://soapspice.com/contact/'
      ), route);
      assert.ok(graph['@graph'].some(entity => entity['@type'] === 'WebSite' && entity.about?.['@id'] === 'https://soapspice.com/about/'), route);
    }
  }
});

test('the social sharing image is present and is a usable JPEG', async () => {
  const image = await readFile(new URL('images/soapspice-social-card.jpg', output));
  assert.ok(image.length > 30_000, 'Social card image should contain the complete card');
  assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('public pages allow search snippets and identify the soap making calculator', async () => {
  for (const route of indexablePaths) {
    const seo = pageSeo(route);
    assert.match(seo.robots, /^index, follow,/);
    assert.ok(seo.robots.includes('max-snippet:-1'), route);
    assert.doesNotMatch(seo.robots, /noindex|nosnippet|max-snippet:0/);
  }
  const home = (await htmlFor('/')).replace(/<[^>]+>/g, ' ');
  assert.match(home, /Soap making\s+calculator\./);
  assert.match(pageSeo('/').title, /^Soap Making Calculator for Cold-Process Soap/);
  assert.match(pageSeo('/calculators/cold-process-soap').title, /Soap Making Calculator/);
});

test('all 42 ingredient pages expose names, SAP values, and source citations without JavaScript', async () => {
  const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url)));
  const notes = JSON.parse(await readFile(new URL('../src/data/ingredient-soapmaking-notes.json', import.meta.url)));
  assert.equal(catalog.length, 42);
  assert.deepEqual(Object.keys(notes).sort(), catalog.map(({ id }) => id).sort());
  const catalogHtml = (await htmlFor('/ingredients')).replace(/<!--[\s\S]*?-->/g, '').replace(/&#x27;/g, "'");
  assert.ok(!/review pending|values need administrator review/i.test(catalogHtml));
  for (const ingredient of catalog) {
    assert.ok(catalogHtml.includes(notes[ingredient.id].coldProcessEffect), `Catalog card effect missing: ${ingredient.id}`);
  }
  for (const ingredient of catalog) {
    const html = await htmlFor(`/ingredients/${ingredient.id}`);
    const renderedText = html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&');
    const note = notes[ingredient.id];
    assert.ok(html.includes(escape(ingredient.name)), ingredient.id);
    assert.ok(html.includes(ingredient.naohSap.toFixed(3)), ingredient.id);
    assert.ok(html.includes(escape(ingredient.sapSourceUrl)), ingredient.id);
    assert.ok(html.includes('Use in calculator'), ingredient.id);
    assert.ok(renderedText.includes(note.coldProcessEffect), `Soap effect missing: ${ingredient.id}`);
    assert.ok(renderedText.includes(note.workabilityNote), `Workability note missing: ${ingredient.id}`);
    assert.ok(renderedText.includes(`How ${ingredient.name} affects cold-process soap`), ingredient.id);
    assert.ok(renderedText.includes(note.workabilityLevel), ingredient.id);
    assert.ok(!/review pending|values need administrator review/i.test(renderedText), `Review status should not appear on catalog details: ${ingredient.id}`);
    assert.ok(!/bramble\s*berry|soap\s*queen/i.test(renderedText), `Third-party learning links should be hidden: ${ingredient.id}`);
  }
});

test('generated sitemap includes every indexable canonical page and excludes session pages', async () => {
  const sitemap = await readFile(new URL('sitemap.xml', output), 'utf8');
  assert.equal(sitemap, sitemapXml());
  assert.match(sitemap, /^<\?xml/);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  const lastmods = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(match => match[1]);
  assert.deepEqual(urls, indexablePaths.map(route => pageSeo(route).canonical));
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(lastmods.length, urls.length);
  assert.ok(lastmods.every(date => /^\d{4}-\d{2}-\d{2}$/.test(date)));
  for (const route of staticPaths.filter(route => !indexablePaths.includes(route))) {
    assert.ok(!urls.includes(pageSeo(route).canonical), route);
  }
  const robots = await readFile(new URL('robots.txt', output), 'utf8');
  assert.ok(robots.includes('Sitemap: https://soapspice.com/sitemap.xml'));
  assert.ok(robots.includes('Allow: /'));
  assert.ok(robots.includes('Content-Signal: search=yes'));
  assert.doesNotMatch(robots, /^\s*Disallow:\s*\/\s*$/m);
});

test('About and Contact pages are linked, crawlable, and represented in llms.txt', async () => {
  const about = await htmlFor('/about');
  const contact = await htmlFor('/contact');
  const aboutText = about.replace(/<[^>]+>/g, ' ');
  const contactText = contact.replace(/<[^>]+>/g, ' ');
  assert.match(aboutText, /A clearer way to plan cold-process soap/);
  assert.match(contactText, /contactus@soapspice\.com/);
  assert.ok(about.includes('href="/contact"'));
  assert.ok(about.includes('rel="about"'));
  assert.ok(about.includes('rel="contact"'));
  assert.ok(contact.includes('href="mailto:contactus@soapspice.com"'));
  const aboutSchema = JSON.parse(about.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const contactSchema = JSON.parse(contact.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(aboutSchema['@graph'].some(entity => entity['@type'] === 'AboutPage'));
  assert.ok(contactSchema['@graph'].some(entity => entity['@type'] === 'ContactPage'));
  const llms = await readFile(new URL('llms.txt', output), 'utf8');
  assert.ok(llms.includes('https://soapspice.com/about/'));
  assert.ok(llms.includes('https://soapspice.com/contact/'));
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
  assert.ok(htaccess.includes('RewriteCond %{HTTP_HOST} ^www\\.soapspice\\.com$ [NC]'));
  assert.ok(htaccess.includes('RewriteRule ^ https://soapspice.com%{REQUEST_URI} [R=301,L]'));
  assert.ok(!htaccess.includes('RewriteRule ^ index.html'));
});
