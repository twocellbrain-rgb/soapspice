import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { indexablePaths, staticPaths, pageSeo, sitemapXml, soapmakingLibraryResources, publishedSoapmakingPosts, render, buildFirstBatchShoppingList, firstBatchSupplies, loadPrintableFormula, savePrintableFormula, createStarterFormula, renderFormulaResults } from '../dist/prerender/entry-server.mjs';

const output = new URL('../dist/public/', import.meta.url);
const escape = value => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const htmlFor = route => readFile(new URL(`${route === '/' ? '' : route.slice(1) + '/'}index.html`, output), 'utf8');
const visibleMarkup = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

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
    assert.ok(html.includes('name="p:domain_verify" content="898863bfb0800c87b2c353e7d46ed960"'), route);
    assert.ok(html.includes(`rel="canonical" href="${escape(seo.canonical)}"`), route);
    assert.ok(html.includes(`property="og:url" content="${escape(seo.canonical)}"`), route);
    assert.ok(html.includes('property="og:site_name" content="SoapSpice"'), route);
    assert.ok(html.includes('property="og:locale" content="en_US"'), route);
    assert.ok(html.includes(`property="og:image" content="${seo.image}"`), route);
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), route);
    assert.ok(html.includes(`name="twitter:image" content="${seo.image}"`), route);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, route);
    assert.equal((html.match(/<title>/g) ?? []).length, 1, route);
    assert.ok(!html.includes('janeway.replit.dev'), route);
    for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
      assert.match(image[0], /\balt=/, `Image alt text missing: ${route}`);
      assert.match(image[0], /\bwidth=["']\d+["']/, `Image width missing: ${route}`);
      assert.match(image[0], /\bheight=["']\d+["']/, `Image height missing: ${route}`);
    }
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

test('calculator offers a four-step guide with working jump links', async () => {
  const html = await htmlFor('/calculators/cold-process-soap');
  assert.ok(html.includes('aria-label="Calculator steps"'));
  assert.ok(html.includes('Build your formula in four steps'));
  for (const step of ['oils', 'liquid', 'fragrance', 'validate']) {
    assert.ok(html.includes(`href="#calculator-step-${step}"`), step);
    assert.ok(html.includes(`id="calculator-step-${step}"`), step);
  }
  assert.ok(html.includes('Add each oil and enter its weight.'));
  assert.ok(html.includes('Choose superfat and mixing liquid.'));
  assert.ok(html.includes('Check the exact supplier’s soap limit.'));
  assert.ok(html.includes('Check the amounts and safety notes.'));
});

test('calculator omits the removed review and fragrance callouts', async () => {
  const formHtml = await htmlFor('/calculators/cold-process-soap');
  assert.doesNotMatch(formHtml, /notice-sap-review|Source-linked, not yet administrator reviewed|Reference SAP values still need administrator review/);
  assert.doesNotMatch(formHtml, /Check before making\./);

  const resultHtml = await htmlFor('/calculators/cold-process-soap/results');
  assert.doesNotMatch(resultHtml, /still need administrator review/);
  assert.match(resultHtml, /Supplier specifications can vary/);
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
    assert.ok(html.includes(escape(ingredient.sapSourceTitle)), ingredient.id);
    assert.ok(html.includes(`href="${escape(ingredient.sapSourceUrl)}"`), `SAP source link missing: ${ingredient.id}`);
    assert.ok(html.includes('Use in calculator'), ingredient.id);
    assert.ok(renderedText.includes(note.coldProcessEffect), `Soap effect missing: ${ingredient.id}`);
    assert.ok(renderedText.includes(note.workabilityNote), `Workability note missing: ${ingredient.id}`);
    assert.ok(renderedText.includes(`How ${ingredient.name} affects cold-process soap`), ingredient.id);
    assert.ok(renderedText.includes(note.workabilityLevel), ingredient.id);
    assert.ok(!/review pending|values need administrator review/i.test(renderedText), `Review status should not appear on catalog details: ${ingredient.id}`);
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
  assert.deepEqual([...new Set(lastmods)], ['2026-11-22'], 'keep sitemap dates aligned with the latest meaningful public content update');
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
  assert.ok(html.includes('Search DuckDuckGo'));
  assert.ok(html.includes('Private to this browser'));
  assert.ok(html.includes('External publisher'));
  for (const resource of soapmakingLibraryResources) {
    assert.ok(html.includes(escape(resource.title)), resource.id);
    assert.ok(html.includes(escape(resource.summary)), resource.id);
    if (resource.contentMode === 'source-link') {
      assert.ok(html.includes(`href="${resource.href}"`), `External publisher link missing: ${resource.id}`);
    } else {
      assert.ok(html.includes(`href="${resource.href}"`), resource.id);
    }
    assert.ok(html.includes(resource.image.replace(/^images\//, '/images/')), resource.id);
    await readFile(new URL(resource.image, output));
  }
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const page = schema['@graph'].find(entity => entity.url === pageSeo('/soapmaking-library').canonical);
  assert.equal(page['@type'], 'CollectionPage');
  assert.equal(page.mainEntity['@type'], 'ItemList');
  assert.equal(page.mainEntity.itemListElement.length, soapmakingLibraryResources.length);
});

test('only the two newest articles hide Further reading; other citations remain linked', async () => {
  const latestArticleSlugs = new Set(
    [...publishedSoapmakingPosts]
      .filter(post => post.kind === 'article')
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 2)
      .map(post => post.slug),
  );
  assert.equal(latestArticleSlugs.size, 2);
  for (const slug of latestArticleSlugs) {
    const article = await htmlFor(`/recipes/${slug}`);
    assert.ok(!article.includes('data-testid="post-citations"'), `${slug} should hide the entire Further reading section`);
    assert.ok(!article.includes('Further reading'), `${slug} should not show a Further reading heading`);
  }
  const otherCitedPosts = publishedSoapmakingPosts.filter(
    post => post.citations?.length && !latestArticleSlugs.has(post.slug),
  );
  for (const post of otherCitedPosts) {
    const article = await htmlFor(`/recipes/${post.slug}`);
    for (const citation of post.citations) {
      assert.ok(article.includes(`href="${escape(citation.url)}"`), `Citation link missing: ${citation.title}`);
      assert.ok(article.includes(escape(citation.title)), `Citation title missing: ${citation.title}`);
    }
  }
});

test('recipes index is crawlable and article shopping links follow the article body', async () => {
  const index = await htmlFor('/recipes');
  const post = publishedSoapmakingPosts[0];
  const articleRoute = `/recipes/${post.slug}`;
  assert.ok(indexablePaths.includes('/recipes'));
  assert.ok(staticPaths.includes('/recipes'));
  assert.ok(indexablePaths.includes(articleRoute));
  assert.ok(staticPaths.includes(articleRoute));
  assert.match(index, /Recipes &amp; articles/);
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(index.includes(`href="${articleRoute}"`));
  assert.ok(index.includes(post.title));
  assert.ok(!index.includes('data-testid="empty-published-posts"'));
  assert.equal((index.match(/<main(?:\s|>)/g) ?? []).length, 1);

  const article = await htmlFor(articleRoute);
  const articleSeo = pageSeo(articleRoute);
  assert.equal(articleSeo.title, 'Beginner Cold Process Soap Recipe | SoapSpice');
  assert.ok(articleSeo.title.length <= 60);
  assert.equal(articleSeo.description, post.seoDescription);
  assert.ok(articleSeo.description.length >= 130 && articleSeo.description.length <= 160);
  assert.equal(articleSeo.canonical, `https://soapspice.com${articleRoute}/`);
  assert.equal(articleSeo.image, 'https://soapspice.com/images/beginner-cold-process-soap-swirl.webp');
  assert.ok(article.includes(`<title>${escape(articleSeo.title)}</title>`));
  assert.ok(article.includes(`name="description" content="${escape(articleSeo.description)}"`));
  assert.ok(article.includes(`property="og:image" content="${articleSeo.image}"`));
  assert.ok(article.includes(`name="twitter:image" content="${articleSeo.image}"`));
  assert.ok(article.includes(post.title));
  assert.ok(article.includes('Cold-process soap formula'));
  assert.ok(article.includes('200 g'));
  assert.ok(article.includes('70.66 g'));
  assert.ok(article.includes('160.95 g'));
  assert.ok(article.includes('not physically batch-tested'));
  assert.ok(article.includes('Always add sodium hydroxide slowly to the water'));
  assert.ok(article.includes('4–6 weeks'));
  assert.ok(article.includes('data-testid="recipe-formula"'));
  assert.ok(article.includes('data-testid="recipe-validation-note"'));
  assert.ok(article.includes('data-testid="link-recipe-calculator"'));
  assert.ok(article.includes('id="post-shopping"'));
  assert.ok(article.indexOf('id="post-shopping"') > article.indexOf('</article>'));
  for (const item of [...post.ingredients, ...post.equipment]) {
    assert.ok(article.includes(`data-testid="shopping-item-${post.ingredients.includes(item) ? 'ingredient' : 'equipment'}-${item.id}"`), item.id);
  }
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.includes('tag=soapspice1-20'));
  assert.ok(article.includes('sponsored nofollow noopener'));
  const articleSchema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(articleSchema['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === post.title && entity.image === articleSeo.image));
  const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url)));
  const oilRows = [
    { id: 'olive-oil', name: 'Olive oil' },
    { id: 'palm-oil', name: 'Palm oil (regular palm)' },
    { id: 'coconut-oil-76', name: 'Coconut oil (76°)' },
    { id: 'castor-oil', name: 'Castor oil' },
  ];
  const oils = oilRows.map(({ id, name }) => {
    const formulaLine = post.recipeDetails.formula.find(item => item.name === name);
    return { sap: catalog.find(item => item.id === id).naohSap, grams: Number.parseFloat(formulaLine.amount) };
  });
  const calculatedNaohExact = oils.reduce((sum, oil) => sum + oil.grams * oil.sap, 0) * 0.95;
  const calculatedNaoh = Number(calculatedNaohExact.toFixed(2));
  const calculatedWater = Number(((500 + calculatedNaohExact) * 0.22 / 0.78).toFixed(2));
  assert.equal(calculatedNaoh, 70.66, 'the recipe NaOH amount should match SoapSpice SAP data at 5% superfat');
  assert.equal(calculatedWater, 160.95, 'the recipe liquid amount should match SoapSpice’s disclosed 22% baseline');
  const heroImage = await readFile(new URL('images/beginner-cold-process-soap-swirl.webp', output));
  assert.deepEqual([...heroImage.subarray(0, 4)], [0x52, 0x49, 0x46, 0x46]);
  assert.equal((article.match(/<main(?:\s|>)/g) ?? []).length, 1);

  const testPost = {
    slug: 'test-olive-oil-soap-recipe',
    title: 'A practical olive oil soap recipe',
    kind: 'recipe',
    excerpt: 'Plan a small cold-process soap recipe with helpful ingredient notes, clear equipment guidance, careful preparation steps, and practical safety context for home soap makers.',
    publishedAt: '2026-11-15',
    author: 'SoapSpice',
    body: [{
      heading: 'Plan the batch',
      paragraphs: ['Use a tested formula and check the materials with your suppliers.'],
      steps: ['Review the formula.', 'Prepare protective equipment.'],
    }],
    ingredients: [{ id: 'olive-oil', name: 'Olive oil', searchTerm: 'olive oil cold process soapmaking' }],
    equipment: [{ id: 'scale', name: 'Digital scale', searchTerm: 'digital scale soap making' }],
    citations: [{ title: 'A source for soapmaking safety', url: 'https://example.org/soap-safety' }],
  };
  publishedSoapmakingPosts.push(testPost);
  try {
    const seo = pageSeo(`/recipes/${testPost.slug}`);
    assert.ok(seo.indexable);
    assert.ok(seo.title.includes('SoapSpice'));
    assert.ok(seo.description.length >= 130 && seo.description.length <= 160);
    assert.ok(seo.structuredData['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === testPost.title));

    const detail = render(`/recipes/${testPost.slug}`);
    assert.ok(detail.includes(testPost.title));
    assert.ok(detail.includes('Plan the batch'));
    assert.ok(detail.includes('Find what you need at Amazon'));
    assert.equal((detail.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
    assert.ok(!detail.includes('Check Amazon for price'));
    assert.ok(!detail.includes('data-testid="link-amazon-ingredient-'));
    assert.ok(!detail.includes('data-testid="link-amazon-equipment-'));
    assert.ok(detail.includes('Affiliate link'));
    assert.ok(detail.includes('As an Amazon Associate I earn from qualifying purchases.'));
    assert.ok(detail.includes('tag=soapspice1-20'));
    assert.ok(detail.includes('sponsored nofollow noopener'));
    assert.ok(detail.indexOf('id="post-shopping"') > detail.indexOf('</article>'));
    assert.equal((detail.match(/<main(?:\s|>)/g) ?? []).length, 1);
  } finally {
    publishedSoapmakingPosts.pop();
  }
});

test('lavender drop-swirl recipe is indexable and uses one Amazon article link', async () => {
  const post = publishedSoapmakingPosts.find(entry => entry.slug === 'lavender-drop-swirl-cold-process-soap');
  assert.ok(post);
  const route = `/recipes/${post.slug}`;
  const index = await htmlFor('/recipes');
  const article = await htmlFor(route);
  const seo = pageSeo(route);

  assert.ok(indexablePaths.includes(route));
  assert.ok(staticPaths.includes(route));
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(sitemapXml().includes(`https://soapspice.com${route}/`));
  assert.equal(seo.title, 'Lavender Drop Swirl Soap Recipe | SoapSpice');
  assert.ok(seo.title.length <= 60);
  assert.equal(seo.description, post.seoDescription);
  assert.ok(seo.description.length >= 130 && seo.description.length <= 160);
  assert.ok(article.includes(`<title>${escape(seo.title)}</title>`));
  assert.ok(article.includes('Cream-colored soap bars with deep plum and soft lilac drop swirls'));
  assert.ok(article.includes('200 g'));
  assert.ok(article.includes('70.66 g'));
  assert.ok(article.includes('160.95 g'));
  assert.ok(article.includes('Use the final calculator amount'));
  assert.ok(article.includes('light, medium, or strong'));
  assert.ok(article.includes('IFRA maximums'));
  assert.ok(article.includes('Slowly sprinkle the weighed NaOH into the distilled water'));
  assert.ok(article.includes('Pour the lilac stream closer to the surface'));
  assert.equal((article.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
  assert.ok(!article.includes('data-testid="link-amazon-ingredient-'));
  assert.ok(!article.includes('data-testid="link-amazon-equipment-'));
  assert.ok(article.includes('Find what you need at Amazon'));
  assert.ok(article.includes('Affiliate link'));
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.indexOf('id="post-shopping"') > article.indexOf('</article>'));

  const heroImage = await readFile(new URL('images/lavender-drop-swirl.jpeg', output));
  assert.deepEqual([...heroImage.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('Caribbean sunset layered recipe is indexable and uses one Amazon article link', async () => {
  const post = publishedSoapmakingPosts.find(entry => entry.slug === 'caribbean-sunset-layered-cold-process-soap');
  assert.ok(post);
  const route = `/recipes/${post.slug}`;
  const index = await htmlFor('/recipes');
  const article = await htmlFor(route);
  const seo = pageSeo(route);

  assert.ok(indexablePaths.includes(route));
  assert.ok(staticPaths.includes(route));
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(sitemapXml().includes(`https://soapspice.com${route}/`));
  assert.equal(seo.title, 'Caribbean Sunset Layered Soap Recipe | SoapSpice');
  assert.ok(seo.title.length <= 60);
  assert.equal(seo.description, post.seoDescription);
  assert.ok(seo.description.length >= 130 && seo.description.length <= 160);
  assert.ok(article.includes(`<title>${escape(seo.title)}</title>`));
  assert.ok(article.includes('Illustration of three soap bars with coral-pink, golden-yellow, and creamy layered colors'));
  assert.ok(article.includes('200 g'));
  assert.ok(article.includes('70.66 g'));
  assert.ok(article.includes('160.95 g'));
  assert.ok(article.includes('About ¼ tsp'));
  assert.ok(article.includes('Unscented'));
  assert.ok(article.includes('never pour water onto dry NaOH'));
  assert.ok(article.includes('Hold a spoon close to the surface and pour the gold batter over its back'));
  assert.ok(article.includes('4–6 weeks'));
  assert.equal((article.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
  assert.ok(!article.includes('data-testid="link-amazon-ingredient-'));
  assert.ok(!article.includes('data-testid="link-amazon-equipment-'));
  assert.ok(article.includes('Find what you need at Amazon'));
  assert.ok(article.includes('Affiliate link'));
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.indexOf('id="post-shopping"') > article.indexOf('</article>'));
  const schema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === post.title && entity.image === seo.image));
  assert.ok(sitemapXml().includes('<lastmod>2026-11-22</lastmod>'));

  const heroImage = await readFile(new URL('images/caribbean-sunset-layered-soap.jpg', output));
  assert.deepEqual([...heroImage.subarray(0, 3)], [0xff, 0xd8, 0xff]);
});

test('unscented oatmeal recipe is indexable and uses one Amazon article link', async () => {
  const post = publishedSoapmakingPosts.find(entry => entry.slug === 'unscented-oatmeal-cold-process-soap');
  assert.ok(post);
  const route = `/recipes/${post.slug}`;
  const index = await htmlFor('/recipes');
  const article = await htmlFor(route);
  const seo = pageSeo(route);

  assert.ok(indexablePaths.includes(route));
  assert.ok(staticPaths.includes(route));
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(sitemapXml().includes(`https://soapspice.com${route}/`));
  assert.equal(seo.title, 'Unscented Oatmeal Soap Recipe | SoapSpice');
  assert.ok(seo.title.length <= 60);
  assert.equal(seo.description, post.seoDescription);
  assert.ok(seo.description.length >= 130 && seo.description.length <= 160);
  assert.ok(article.includes(`<title>${escape(seo.title)}</title>`));
  assert.ok(article.includes('Illustration of unscented oatmeal soap bars with colloidal oatmeal alongside'));
  assert.ok(article.includes('70.66 g'));
  assert.ok(article.includes('160.95 g'));
  assert.ok(article.includes('Colloidal oatmeal'));
  assert.ok(article.includes('5 g'));
  assert.ok(article.includes('This recipe is unscented and uncolored'));
  assert.ok(article.includes('never pour water onto dry NaOH'));
  assert.ok(article.includes('Stir in the oatmeal slurry until evenly distributed'));
  assert.ok(article.includes('Weigh colloidal oatmeal separately at 1% of total oil weight'));
  assert.ok(article.includes('4–6 weeks'));
  assert.equal((article.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
  assert.ok(!article.includes('data-testid="link-amazon-ingredient-'));
  assert.ok(!article.includes('data-testid="link-amazon-equipment-'));
  assert.ok(article.includes('Find what you need at Amazon'));
  assert.ok(article.includes('Affiliate link'));
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.indexOf('id="post-shopping"') > article.indexOf('</article>'));
  assert.equal((article.match(/data-testid="article-step-image"/g) ?? []).length, 8, 'all eight step illustrations from the uploaded PDF should appear in the article');
  const schema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === post.title && entity.image === seo.image));

  const imagePaths = [
    'images/unscented-oatmeal-soap.jpg',
    'images/oatmeal-soap-prepare-colloidal-oatmeal.jpg',
    'images/oatmeal-soap-mix-lye-solution.jpg',
    'images/oatmeal-soap-combine-oils.jpg',
    'images/oatmeal-soap-blend-to-trace.jpg',
    'images/oatmeal-soap-stir-oatmeal-slurry.jpg',
    'images/oatmeal-soap-pour-mold.jpg',
    'images/oatmeal-soap-cut-loaf.jpg',
    'images/oatmeal-soap-cure-bars.jpg',
  ];
  for (const imagePath of imagePaths) {
    const image = await readFile(new URL(imagePath, output));
    assert.deepEqual([...image.subarray(0, 3)], [0xff, 0xd8, 0xff], `${imagePath} should be a valid JPEG`);
  }
});

test('soapmaking oils article hides Further reading and preserves its images and Amazon affiliate link', async () => {
  const post = publishedSoapmakingPosts.find(entry => entry.slug === 'soapmaking-oils-explained');
  assert.ok(post);
  const route = `/recipes/${post.slug}`;
  const article = await htmlFor(route);
  const index = await htmlFor('/recipes');
  const seo = pageSeo(route);

  assert.ok(indexablePaths.includes(route));
  assert.ok(staticPaths.includes(route));
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(index.includes(`href="${route}"`));
  assert.ok(sitemapXml().includes(`https://soapspice.com${route}/`));
  assert.equal(seo.title, 'Soapmaking Oils for Cold-Process Soap | SoapSpice');
  assert.ok(seo.title.length <= 60);
  assert.equal(seo.description, post.seoDescription);
  assert.ok(seo.description.length >= 130 && seo.description.length <= 160);
  assert.ok(article.includes(`<title>${escape(seo.title)}</title>`));
  assert.ok(article.includes(`name="description" content="${escape(seo.description)}"`));
  assert.equal(seo.canonical, `https://soapspice.com${route}/`);
  assert.ok(article.includes(`property="og:image" content="${seo.image}"`));
  assert.ok(article.includes(post.title));
  assert.ok(article.includes('Five ingredients, different jobs'));
  assert.ok(article.includes('Build an example in SoapSpice'));
  assert.ok(article.includes('Olive oil'));
  assert.ok(article.includes('Coconut oil (76°)'));
  assert.ok(article.includes('69.52 g'));
  assert.ok(article.includes('160.63 g'));
  assert.ok(article.includes('Soap Queen’s beginner guide'));
  assert.ok(!article.includes('data-testid="post-citations"'));
  assert.ok(!article.includes('Further reading'));
  assert.equal((article.match(/data-testid="article-section-image"/g) ?? []).length, 5);
  assert.equal((article.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
  assert.ok(!article.includes('data-testid="link-amazon-ingredient-'));
  assert.ok(!article.includes('data-testid="link-amazon-equipment-'));
  assert.ok(article.includes('Find what you need at Amazon'));
  assert.ok(article.includes('Affiliate link'));
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.includes('tag=soapspice1-20'));
  assert.ok(article.includes('sponsored nofollow noopener'));

  const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url)));
  const oilWeights = [
    ['olive-oil', 225],
    ['palm-oil', 150],
    ['coconut-oil-76', 100],
    ['castor-oil', 25],
  ];
  const rawNaoh = oilWeights.reduce((sum, [id, grams]) => (
    sum + grams * catalog.find(entry => entry.id === id).naohSap
  ), 0);
  const calculatedNaoh = Number((rawNaoh * 0.95).toFixed(2));
  const calculatedWater = Number(((500 + rawNaoh * 0.95) * 0.22 / 0.78).toFixed(2));
  assert.equal(calculatedNaoh, 69.52);
  assert.equal(calculatedWater, 160.63);

  const schema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === post.title && entity.image === seo.image));
});

test('soft soap troubleshooting article includes its full guidance, PDF images, and one Amazon link', async () => {
  const post = publishedSoapmakingPosts.find(entry => entry.slug === 'why-is-my-soap-still-soft');
  assert.ok(post);
  const route = `/recipes/${post.slug}`;
  const article = await htmlFor(route);
  const index = await htmlFor('/recipes');
  const seo = pageSeo(route);

  assert.ok(indexablePaths.includes(route));
  assert.ok(staticPaths.includes(route));
  assert.ok(index.includes(`data-testid="card-published-post-${post.slug}"`));
  assert.ok(index.includes(`href="${route}"`));
  assert.ok(sitemapXml().includes(`https://soapspice.com${route}/`));
  assert.equal(seo.title, 'Why Is My Soap Still Soft? 7 Causes | SoapSpice');
  assert.ok(seo.title.length <= 60);
  assert.equal(seo.description, post.seoDescription);
  assert.ok(seo.description.length >= 130 && seo.description.length <= 157);
  assert.ok(article.includes(`<title>${escape(seo.title)}</title>`));
  assert.ok(article.includes(`name="description" content="${escape(seo.description)}"`));
  assert.equal(seo.canonical, `https://soapspice.com${route}/`);
  assert.ok(article.includes(`property="og:image" content="${seo.image}"`));
  assert.ok(article.includes(post.title));
  for (const heading of [
    'Start with three checks',
    '1. You may be checking too soon',
    '2. The batch may contain more water',
    '3. The oil blend may set slowly',
    '4. More oil may have stayed in the recipe',
    '5. The batter may have reached false trace',
    'What should light trace look like?',
    '6. The weighed batch may differ from the formula',
    '7. Moisture may not escape easily',
    'Already cured, then turned mushy?',
    'Check the recipe in SoapSpice',
    'Keep a useful next-batch record',
  ]) assert.ok(article.includes(heading), heading);
  assert.ok(article.includes('Softness or firmness alone cannot establish that a batch is suitable for use.'));
  assert.ok(article.includes('Keep a seeping or separated batch away from skin, children, and pets.'));
  assert.ok(article.includes('extra sodium hydroxide is not a water-removal shortcut'));
  assert.ok(article.includes('a calculator result does not diagnose an existing loaf.'));
  assert.ok(article.includes('69.52 g'));
  assert.ok(article.includes('160.63 g'));
  assert.equal((article.match(/data-testid="article-section-image"/g) ?? []).length, 7);
  assert.equal((article.match(/data-testid="link-amazon-article-shopping"/g) ?? []).length, 1);
  assert.ok(!article.includes('data-testid="link-amazon-ingredient-'));
  assert.ok(!article.includes('data-testid="link-amazon-equipment-'));
  assert.ok(article.includes('Find what you need at Amazon'));
  assert.ok(article.includes('Affiliate link'));
  assert.ok(article.includes('As an Amazon Associate I earn from qualifying purchases.'));
  assert.ok(article.includes('tag=soapspice1-20'));
  assert.ok(article.includes('sponsored nofollow noopener'));
  assert.ok(article.indexOf('id="post-shopping"') > article.indexOf('</article>'));
  const catalog = JSON.parse(await readFile(new URL('../src/data/ingredient-catalog.json', import.meta.url)));
  const oilWeights = [
    ['olive-oil', 225],
    ['palm-oil', 150],
    ['coconut-oil-76', 100],
    ['castor-oil', 25],
  ];
  const rawNaoh = oilWeights.reduce((sum, [id, grams]) => (
    sum + grams * catalog.find(entry => entry.id === id).naohSap
  ), 0);
  const calculatedNaoh = Number((rawNaoh * 0.95).toFixed(2));
  const calculatedWater = Number(((500 + rawNaoh * 0.95) * 0.22 / 0.78).toFixed(2));
  assert.equal(calculatedNaoh, 69.52);
  assert.equal(calculatedWater, 160.63);

  const schema = JSON.parse(article.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.ok(schema['@graph'].some(entity => entity['@type'] === 'Article' && entity.headline === post.title && entity.image === seo.image));
});

test('all illustrations from uploaded recipe PDFs appear with accessible captions', async () => {
  const sourceImagesBySlug = {
    'beginner-cold-process-soap-recipe': [
      '/images/beginner-cold-process-soap-swirl.webp',
    ],
    'one-oil-olive-oil-castile-soap': [
      '/images/olive-castile-step-weigh-ingredients.jpg',
      '/images/olive-castile-step-mix-lye-solution.jpg',
      '/images/olive-castile-step-blend-trace.jpg',
      '/images/olive-castile-step-pour-mold.jpg',
      '/images/olive-castile-step-unmold-slice.jpg',
      '/images/olive-castile-step-cure-rack.jpg',
    ],
    'lavender-drop-swirl-cold-process-soap': [
      '/images/lavender-drop-swirl.jpeg',
      '/images/lavender-drop-step-prepare-colorants.jpg',
      '/images/lavender-drop-step-mix-lye-solution.jpg',
      '/images/lavender-drop-step-combine-oils.jpg',
      '/images/lavender-drop-step-blend-fragrance.jpg',
      '/images/lavender-drop-step-divide-color.jpg',
      '/images/lavender-drop-step-pour-swirl.jpg',
      '/images/lavender-drop-step-cut-bars.jpg',
      '/images/lavender-drop-step-cure-rack.jpg',
    ],
    'caribbean-sunset-layered-cold-process-soap': [
      '/images/caribbean-sunset-layered-soap.jpg',
      '/images/caribbean-sunset-step-prepare-colors.jpg',
      '/images/caribbean-sunset-step-mix-lye.jpg',
      '/images/caribbean-sunset-step-combine-oils.jpg',
      '/images/caribbean-sunset-step-blend-batter.jpg',
      '/images/caribbean-sunset-step-divide-colors.jpg',
      '/images/caribbean-sunset-step-pour-coral.jpg',
      '/images/caribbean-sunset-step-pour-gold.jpg',
      '/images/caribbean-sunset-step-pour-cream.jpg',
      '/images/caribbean-sunset-step-cut-loaf.jpg',
      '/images/caribbean-sunset-step-cure-bars.jpg',
    ],
    'unscented-oatmeal-cold-process-soap': [
      '/images/unscented-oatmeal-soap.jpg',
      '/images/oatmeal-soap-prepare-colloidal-oatmeal.jpg',
      '/images/oatmeal-soap-mix-lye-solution.jpg',
      '/images/oatmeal-soap-combine-oils.jpg',
      '/images/oatmeal-soap-blend-to-trace.jpg',
      '/images/oatmeal-soap-stir-oatmeal-slurry.jpg',
      '/images/oatmeal-soap-pour-mold.jpg',
      '/images/oatmeal-soap-cut-loaf.jpg',
      '/images/oatmeal-soap-cure-bars.jpg',
    ],
    'soapmaking-oils-explained': [
      '/images/soapmaking-oils-explained-cover.jpg',
      '/images/soapmaking-oils-olive-oil.jpg',
      '/images/soapmaking-oils-coconut-oil.jpg',
      '/images/soapmaking-oils-palm-oil.jpg',
      '/images/soapmaking-oils-castor-oil.jpg',
      '/images/soapmaking-oils-shea-butter.jpg',
    ],
    'why-is-my-soap-still-soft': [
      '/images/why-is-my-soap-still-soft-cover.jpg',
      '/images/soft-soap-extra-water.jpg',
      '/images/soft-soap-oil-blend.jpg',
      '/images/soft-soap-extra-oil.jpg',
      '/images/soft-soap-false-trace.jpg',
      '/images/soft-soap-weighing-record.jpg',
      '/images/soft-soap-curing-rack.jpg',
    ],
  };
  const expectedStepImageCounts = {
    'beginner-cold-process-soap-recipe': 0,
    'one-oil-olive-oil-castile-soap': 6,
    'lavender-drop-swirl-cold-process-soap': 8,
    'caribbean-sunset-layered-cold-process-soap': 10,
    'unscented-oatmeal-cold-process-soap': 8,
    'soapmaking-oils-explained': 0,
    'why-is-my-soap-still-soft': 0,
  };
  const expectedSectionImageCounts = {
    'soapmaking-oils-explained': 5,
    'why-is-my-soap-still-soft': 7,
  };
  const expectedImagePlacementCounts = {
    'why-is-my-soap-still-soft': 8,
  };

  for (const [slug, expectedPaths] of Object.entries(sourceImagesBySlug)) {
    const post = publishedSoapmakingPosts.find(entry => entry.slug === slug);
    assert.ok(post, `Missing published article: ${slug}`);
    const route = `/recipes/${slug}`;
    const article = await htmlFor(route);
    const stepImages = post.body.flatMap(section => section.steps?.flatMap(step =>
      typeof step === 'string' ? [] : step.images ?? []
    ) ?? []);
    const sectionImages = post.body.flatMap(section => section.images ?? []);
    const allImages = [...(post.image ? [post.image] : []), ...sectionImages, ...stepImages];
    const sourceImages = allImages.filter(image => expectedPaths.includes(image.src));

    assert.equal(stepImages.length, expectedStepImageCounts[slug], `${slug} step illustrations`);
    assert.equal(sectionImages.length, expectedSectionImageCounts[slug] ?? 0, `${slug} section illustrations`);
    assert.equal(sourceImages.length, expectedImagePlacementCounts[slug] ?? expectedPaths.length, `${slug} should preserve the PDF's image placements`);
    assert.equal(new Set(sourceImages.map(image => image.src)).size, expectedPaths.length, `${slug} should include each unique source image`);

    for (const image of sourceImages) {
      assert.ok(article.includes(`src="${image.src}"`), `${slug} HTML is missing ${image.src}`);
      assert.ok(article.includes(`alt="${escape(image.alt)}"`), `${slug} image needs descriptive alt text`);
      assert.ok(article.includes(escape(image.caption)), `${slug} image needs a visible caption`);
    }

    for (const expectedPath of expectedPaths) {
      const bytes = await readFile(new URL(expectedPath.slice(1), output));
      if (expectedPath.endsWith('.webp')) {
        assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${expectedPath} should be WebP`);
        assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${expectedPath} should be WebP`);
      } else {
        assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff], `${expectedPath} should be JPEG`);
      }
    }
  }
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
