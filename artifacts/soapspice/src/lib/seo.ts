import catalog from '../data/ingredient-catalog.json';
import soapmakingNotes from '../data/ingredient-soapmaking-notes.json';

// The public Hostinger domain supplied by the site owner, not the Replit preview.
export const SITE_ORIGIN = 'https://soapspice.com';

const pages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'SoapSpice | Cold Process Soap Calculator & Ingredients',
    description: 'Plan your next cold-process soap batch with SoapSpice. Calculate NaOH, compare source-linked oil SAP values, and explore ingredient and formulation guides.',
  },
  '/calculators/cold-process-soap': {
    title: 'Cold-Process Soap Calculator | SoapSpice',
    description: 'Calculate NaOH (sodium hydroxide), liquid, and fragrance for cold-process soap in grams or ounces. Check source-linked oil SAP values before planning a batch.',
  },
  '/ingredients': {
    title: 'Soapmaking Oils, Butters & SAP Values | SoapSpice',
    description: 'Compare 42 cold-process soap oils and butters by lather, hardness, trace, and workability. Explore source-linked NaOH and KOH SAP values to plan a formula.',
  },
  '/how-to-start-soapmaking': {
    title: 'How to Start Making Soap: Tools & Safety | SoapSpice',
    description: 'New to cold-process soapmaking? Learn which tools, protective gear, scales, and lye-safe materials to gather before planning your first batch.',
  },
  '/soapmaking-glossary': {
    title: 'Soapmaking Glossary: Terms & Definitions | SoapSpice',
    description: 'Explore plain-language definitions for cold-process soapmaking terms, including SAP, superfat, trace, curing, fragrance, and sodium hydroxide (NaOH).',
  },
  '/privacy': {
    title: 'Privacy & Shopping Links | SoapSpice',
    description: 'See how SoapSpice stores formulas privately in your browser and explains third-party shopping links, affiliate disclosures, and data handling.',
  },
};

const privatePages: Record<string, { title: string; description: string }> = {
  '/my-formulas': {
    title: 'Your Browser-Saved Formulas | SoapSpice',
    description: 'Manage soap formulas saved privately in this browser.',
  },
  '/calculators/cold-process-soap/results': {
    title: 'Your Cold-Process Soap Results | SoapSpice',
    description: 'Review your validated batch formula, safety notes, and material shopping links.',
  },
  '/batch-sheet': {
    title: 'Your Printable Batch Sheet | SoapSpice',
    description: 'Print a validated cold-process soap formula from your browser session.',
  },
  '/formula-print': {
    title: 'Print Your Soap Formula | SoapSpice',
    description: 'Review and print your browser-session soap formula.',
  },
};

export const indexablePaths = [
  ...Object.keys(pages),
  ...catalog.map(({ id }) => `/ingredients/${id}`),
];
export const staticPaths = [...indexablePaths, ...Object.keys(privatePages)];

export function pageSeo(rawPath: string) {
  const path = rawPath.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  const ingredient = path.startsWith('/ingredients/')
    ? catalog.find(({ id }) => path === `/ingredients/${id}`)
    : undefined;
  const note = ingredient ? soapmakingNotes[ingredient.id as keyof typeof soapmakingNotes] : undefined;
  const metadata = pages[path] ?? (ingredient && note ? {
    title: `${ingredient.name} for Soapmaking | SoapSpice`,
    description: `Learn how ${ingredient.name} affects cold-process soap: ${note.seoSummary}. See its SAP reference and workability notes.`,
  } : privatePages[path]);
  const indexable = Boolean(pages[path] || ingredient);
  // Static directory indexes are served with a trailing slash by Apache.
  // The canonical target must not itself redirect to another URL.
  const canonical = `${SITE_ORIGIN}${path === '/' ? '/' : `${path}/`}`;
  return {
    title: metadata?.title ?? 'Page Not Found | SoapSpice',
    description: metadata?.description ?? 'Find SoapSpice soapmaking guides, ingredients, and the cold-process soap calculator.',
    canonical,
    robots: indexable ? 'index, follow' : 'noindex, follow',
    indexable,
    structuredData: indexable ? {
      '@context': 'https://schema.org',
      '@type': path === '/' ? 'WebSite' : path === '/calculators/cold-process-soap' ? 'WebApplication' : 'WebPage',
      name: metadata!.title,
      description: metadata!.description,
      url: canonical,
      ...(path === '/calculators/cold-process-soap' ? {
        applicationCategory: 'EducationalApplication', operatingSystem: 'Web',
      } : {}),
    } : null,
  };
}

export function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePaths.map(path => `  <url><loc>${pageSeo(path).canonical}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function updatePageSeo(path: string) {
  const seo = pageSeo(path);
  document.title = seo.title;
  const meta = (attribute: 'name' | 'property', key: string, content: string) => {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, key);
      document.head.append(element);
    }
    element.content = content;
  };
  meta('name', 'description', seo.description);
  meta('name', 'robots', seo.robots);
  for (const attribute of ['og', 'twitter']) {
    const type = attribute === 'og' ? 'property' : 'name';
    meta(type, `${attribute}:title`, seo.title);
    meta(type, `${attribute}:description`, seo.description);
  }
  meta('property', 'og:url', seo.canonical);
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = seo.canonical;
  document.querySelector('script[type="application/ld+json"]')?.remove();
  if (seo.structuredData) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(seo.structuredData);
    document.head.append(script);
  }
}
