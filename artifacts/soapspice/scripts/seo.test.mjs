import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { indexablePaths, staticPaths, pageSeo, sitemapXml, soapmakingLibraryResources, buildFirstBatchShoppingList, firstBatchSupplies, loadPrintableFormula, savePrintableFormula, createStarterFormula, renderFormulaResults } from '../dist/prerender/entry-server.mjs';

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
  assert.ok(llms.includes('https://soapspice.com/soapmaking-library/'));
});

test('the public soapmaking library is crawlable and displays cited resources with local images', async () => {
  const html = await htmlFor('/soapmaking-library');
  assert.equal((html.match(/<main(?:\s|>)/g) ?? []).length, 1, 'the page should not nest main landmarks');
  assert.ok(html.includes('Visit the publisher for its complete content'));
  assert.ok(html.includes('Private to this browser'));
  assert.ok(html.includes('External publisher'));
  for (const resource of soapmakingLibraryResources) {
    assert.ok(html.includes(escape(resource.title)), resource.id);
    assert.ok(html.includes(escape(resource.summary)), resource.id);
    assert.ok(html.includes(resource.href), resource.id);
    assert.ok(html.includes(resource.image.replace(/^images\//, '/images/')), resource.id);
    await readFile(new URL(resource.image, output));
  }
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const page = schema['@graph'].find(entity => entity.url === pageSeo('/soapmaking-library').canonical);
  assert.equal(page['@type'], 'CollectionPage');
  assert.equal(page.mainEntity['@type'], 'ItemList');
  assert.equal(page.mainEntity.itemListElement.length, soapmakingLibraryResources.length);
});

test('the first-batch shopping list uses calculator weights and links each item', () => {
  const formula = {
    name: 'Starter batch',
    oils: [
      { id: 'olive-oil', name: 'Olive Oil', percentage: 70, weight: 350, sap: 0.135 },
      { id: 'coconut-oil-76', name: 'Coconut Oil (76°)', percentage: 20, weight: 100, sap: 0.183 },
    ],
    oilInputUnit: 'g',
    fragrances: [{ id: 'lavender', name: 'Lavender fragrance oil', amount: 8, unit: 'g' }],
    result: {
      naoh: 65,
      naohBeforeSuperfat: 68.4,
      liquid: 205,
      total: 270,
      fragranceTotalGrams: 8,
      batchTotal: 663,
      ingredientLye: [],
    },
    liquidName: 'Distilled water',
    superfat: 5,
    generatedAt: '2026-11-08T00:00:00.000Z',
  };
  const list = buildFirstBatchShoppingList(formula);
  const amounts = new Map(list.materials.map((item) => [item.id, item.amount]));
  assert.equal(amounts.get('olive-oil'), '350.00 g');
  assert.equal(amounts.get('coconut-oil-76'), '100.00 g');
  assert.equal(amounts.get('sodium-hydroxide'), '65.00 g');
  assert.equal(amounts.get('mixing-liquid-distilled-water'), '205.00 g');
  assert.equal(amounts.get('fragrance-lavender'), '8.00 g');
  assert.equal(list.fragranceSelected, true);
  assert.equal(list.tools.length + list.safety.length, firstBatchSupplies.length);
  for (const item of [...list.materials, ...list.tools, ...list.safety]) {
    const url = new URL(item.href);
    assert.equal(url.protocol, 'https:');
    assert.ok(['www.amazon.com', 'amazon.com', 'amzn.to'].includes(url.hostname), item.id);
    assert.equal(item.isAffiliate, true, item.id);
    assert.equal(url.searchParams.get('tag'), 'soapspice1-20', item.id);
    assert.ok(url.searchParams.get('k'), `Product-specific search missing: ${item.id}`);
  }

  const zeroDose = buildFirstBatchShoppingList({
    ...formula,
    fragrances: [{ id: 'unknown-limit', name: 'Unscreened scent', amount: 0, unit: 'g' }],
  });
  assert.equal(zeroDose.materials.find((item) => item.id === 'fragrance-unknown-limit')?.level, 'verify');
});

test('Amazon shopping pages disclose paid links and do not mislabel them as untracked', async () => {
  for (const route of ['/first-batch-shopping-list', '/how-to-start-soapmaking']) {
    const html = (await htmlFor(route)).replaceAll('<!-- -->', '');
    assert.ok(html.includes('As an Amazon Associate I earn from qualifying purchases.'), route);
    assert.ok(html.includes('amazon-price-button'), route);
    assert.match(html, /amazon-price-button[\s\S]*?<\/a>\s*<span class="amazon-affiliate-note">Affiliate link<\/span>/, route);
    assert.ok(html.includes('We may earn a commission when you buy through links marked “Affiliate link.”'), route);
    assert.doesNotMatch(html, /#ad/);
    assert.doesNotMatch(html, /paid link/i, route);
    assert.ok(html.includes('sponsored nofollow noopener'), route);
    assert.doesNotMatch(html, /untracked search|do not earn SoapSpice a commission/);
    assert.ok(html.includes('tag=soapspice1-20'), route);
  }
});

test('the first-batch list route is private to the browser session and excluded from the sitemap', async () => {
  const route = '/first-batch-shopping-list';
  assert.ok(staticPaths.includes(route));
  assert.equal(pageSeo(route).robots, 'noindex, follow');
  assert.ok(!sitemapXml().includes(`${pageSeo(route).canonical}`));
  const html = await htmlFor(route);
  assert.ok(html.includes('noindex, follow'));
  assert.ok(html.includes('notice-starter-example'));
  assert.ok(html.includes('Your first-batch planning guide'));
  assert.ok(html.includes('Calculator-generated example'));
  assert.ok(html.includes('cold-process starting estimate'));
  assert.ok(html.includes('calculator assumes 100% NaOH'));
  assert.ok(!/\buntested\b|not a tested recipe/i.test(html));
});

test('first-batch display units convert every weight without changing the formula', () => {
  const starter = createStarterFormula();
  for (const oilInputUnit of ['g', 'oz', 'percent']) {
    const formula = {
      ...starter,
      oilInputUnit,
      fragrances: [
        { id: 'grams', name: 'Grams scent', amount: 5, unit: 'g' },
        { id: 'ounces', name: 'Ounces scent', amount: 0.1, unit: 'oz' },
        { id: 'percent', name: 'Percentage scent', amount: 1, unit: 'percent' },
        { id: 'zero', name: 'Zero scent', amount: 0, unit: 'g' },
      ],
    };
    const original = JSON.stringify(formula);
    assert.equal(buildFirstBatchShoppingList(formula).unit, oilInputUnit === 'oz' ? 'oz' : 'g');
    for (const unit of ['g', 'oz', 'g']) {
      const list = buildFirstBatchShoppingList(formula, unit);
      assert.equal(list.unit, unit);
      for (const item of list.materials) {
        const expected = unit === 'oz' ? item.weightGrams / 28.349523125 : item.weightGrams;
        assert.equal(item.amount, `${expected.toFixed(2)} ${unit}`, item.id);
      }
      const byId = new Map(list.materials.map((item) => [item.id, item]));
      assert.equal(byId.get('fragrance-grams').weightGrams, 5);
      assert.equal(byId.get('fragrance-percent').weightGrams, 5);
      assert.equal(byId.get('fragrance-ounces').weightGrams, 0.1 * 28.349523125);
      assert.equal(byId.get('fragrance-zero').level, 'verify');
      assert.equal(JSON.stringify(formula), original);
    }
  }
});

test('first-batch page has an accessible ingredient table, unit choice, and a complete starter method', async () => {
  const html = (await htmlFor('/first-batch-shopping-list')).replaceAll('<!-- -->', '');
  assert.match(html, /<table[^>]*data-testid="table-materials"/);
  assert.match(html, /<caption>/);
  assert.match(html, /<th scope="col">Weight \(g\)/);
  assert.match(html, /<th scope="row"/);
  assert.match(html, /type="radio"[^>]*data-testid="radio-unit-g"[^>]*checked/);
  assert.match(html, /type="radio"[^>]*data-testid="radio-unit-oz"/);
  for (let index = 1; index <= 10; index++) assert.ok(html.includes(`data-testid="first-batch-step-${index}"`));
  assert.ok(html.includes('Always add NaOH to water'));
  assert.ok(html.includes('Cure the bars for 4–6 weeks'));
  assert.ok(html.includes('does not correct a weighing mistake'));
});

test('home First Batch button opens a useful calculator-derived starter list', async () => {
  const home = await htmlFor('/');
  assert.match(home, /<a(?=[^>]*href="\/first-batch-shopping-list")(?=[^>]*data-testid="link-home-first-batch")[^>]*>/);
  const formula = createStarterFormula();
  assert.equal(formula.oils.reduce((sum, oil) => sum + oil.weight, 0), 500);
  assert.equal(formula.superfat, 5);
  assert.equal(formula.fragrances.length, 0);
  assert.ok(Math.abs(formula.result.naoh - (350 * .135 + 100 * .183 + 50 * .128) * .95) < 1e-9);
  assert.equal(buildFirstBatchShoppingList(formula).materials.length, 5);
});

test('validated results show only the selected unit and the essential batch amounts', () => {
  const starter = createStarterFormula();
  for (const oilInputUnit of ['g', 'oz', 'percent']) {
    const unit = oilInputUnit === 'oz' ? 'oz' : 'g';
    const formula = {
      ...starter,
      oilInputUnit,
      fragrances: [{ id: 'test-scent', name: 'Test fragrance', amount: 5, unit: 'g', ifraMaxPercent: 2 }],
      result: { ...starter.result, fragranceTotalGrams: 5 },
    };
    const html = renderFormulaResults(formula);
    const display = (grams) => `${(unit === 'oz' ? grams / 28.349523125 : grams).toFixed(2)} ${unit}`;
    for (const [id, grams] of [
      ['result-oils-total', 500],
      ['result-naoh', formula.result.naoh],
      ['result-liquid', formula.result.liquid],
      ['result-fragrance-total', 5],
    ]) {
      assert.ok(html.includes(`data-testid="${id}">${display(grams)}</td>`), `${id}: ${unit}`);
    }
    assert.ok(html.includes('5% superfat'));
    assert.ok(html.includes(display(350)));
    assert.ok(html.includes(display(5)));
    assert.ok(!html.includes(unit === 'g' ? ' oz' : ' g<'));
    assert.ok(!html.includes('before superfat'));
    assert.ok(!html.includes('0% SF'));
    assert.ok(!html.includes('Combined NaOH'));
    assert.ok(!html.includes('Pounds'));
    assert.ok(!html.includes('oz/lb'));
    assert.ok(!html.includes('min-w-['));
    assert.ok(html.includes('result-ifra-test-scent'));
  }
  const unscented = renderFormulaResults(starter);
  assert.ok(unscented.includes('Fragrance · unscented'));
  assert.ok(!unscented.includes('table-fragrance-inputs'));
});

test('validated formula snapshot survives navigation into the shopping list', () => {
  const previousWindow = globalThis.window;
  const previousSessionStorage = globalThis.sessionStorage;
  const previousLocalStorage = globalThis.localStorage;
  const storage = new Map();
  globalThis.window = { location: { search: '' } };
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  };
  globalThis.localStorage = { getItem: () => null };
  try {
    const draftId = savePrintableFormula({
      name: 'Test batch',
      oils: [{ id: 'olive-oil', name: 'Olive Oil', percentage: 100, weight: 500, sap: 0.135 }],
      oilInputUnit: 'g',
      fragrances: [],
      result: {
        naoh: 64.125,
        naohBeforeSuperfat: 67.5,
        liquid: 203,
        total: 267.125,
        fragranceTotalGrams: 0,
        batchTotal: 767.125,
        ingredientLye: [{ id: 'olive-oil', theoreticalNaoh: 67.5 }],
      },
      liquidName: 'Distilled water',
      superfat: 5,
    });
    assert.ok(draftId);
    globalThis.window.location.search = `?draft=${draftId}`;
    const loaded = loadPrintableFormula();
    assert.equal(loaded?.name, 'Test batch');
    assert.equal(loaded?.result.naoh, 64.125);
    assert.equal(loaded?.result.liquid, 203);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
    if (previousSessionStorage === undefined) delete globalThis.sessionStorage;
    else globalThis.sessionStorage = previousSessionStorage;
    if (previousLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousLocalStorage;
  }
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

test('Hostinger static hosting emits baseline browser security headers', async () => {
  const htaccess = await readFile(new URL('.htaccess', output), 'utf8');
  assert.match(htaccess, /Content-Security-Policy "default-src 'self'/);
  assert.match(htaccess, /Strict-Transport-Security "max-age=31536000" env=HTTPS/);
  assert.match(htaccess, /X-Content-Type-Options "nosniff"/);
  assert.match(htaccess, /X-Frame-Options "SAMEORIGIN"/);
  assert.match(htaccess, /Referrer-Policy "strict-origin-when-cross-origin"/);
  assert.match(htaccess, /Permissions-Policy "camera=\(\), microphone=\(\), geolocation=\(\)"/);
});
