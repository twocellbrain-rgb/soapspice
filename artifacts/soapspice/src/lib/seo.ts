import catalog from '../data/ingredient-catalog.json';
import soapmakingNotes from '../data/ingredient-soapmaking-notes.json';
import { soapmakingLibraryResources } from '../data/soapmaking-library-resources';

// The public Hostinger domain supplied by the site owner, not the Replit preview.
export const SITE_ORIGIN = 'https://soapspice.com';
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const WEBSITE_ID = `${SITE_ORIGIN}/#website`;
export const PUBLIC_CONTACT_EMAIL = 'contactus@soapspice.com';
// This reflects the latest meaningful public-page metadata/content update.
// Update it when indexable page content changes; don't stamp build time here.
const SITEMAP_LAST_MODIFIED = '2026-11-07';

const pages: Record<string, { title: string; description: string }> = {
  '/': {
    title: 'Soap Making Calculator for Cold-Process Soap | SoapSpice',
    description: 'Use the SoapSpice soap making calculator to plan cold-process batches. Calculate NaOH, liquid, and fragrance, and compare 42 oils and butters by SAP value.',
  },
  '/calculators/cold-process-soap': {
    title: 'Cold-Process Soap Making Calculator & NaOH | SoapSpice',
    description: 'Calculate sodium hydroxide (NaOH), liquid, and fragrance for cold-process soap in grams or ounces. Plan batches with source-linked oil and butter SAP values.',
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
  '/about': {
    title: 'About SoapSpice | Soapmaking Calculator & Guides',
    description: 'Learn about SoapSpice, an educational cold-process soapmaking calculator with browser-based formula planning, source-linked SAP values, and ingredient guides.',
  },
  '/contact': {
    title: 'Contact SoapSpice | Soapmaking Calculator Help',
    description: 'Contact SoapSpice about the cold-process soap calculator, ingredient references, or site corrections. Email contactus@soapspice.com for assistance.',
  },
  '/soapmaking-library': {
    title: 'Soapmaking Articles & Recipes | SoapSpice Library',
    description: 'Browse soapmaking articles, cold-process and melt-and-pour recipes, and SoapSpice guides. Search sources and save citations with images and notes.',
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
  '/first-batch-shopping-list': {
    title: 'Your First-Batch Shopping List | SoapSpice',
    description: 'Review calculator-derived soap ingredients and tools saved in this browser session.',
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
    robots: indexable ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow',
    indexable,
    structuredData: indexable ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: 'SoapSpice',
          url: `${SITE_ORIGIN}/`,
          email: PUBLIC_CONTACT_EMAIL,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: PUBLIC_CONTACT_EMAIL,
            url: `${SITE_ORIGIN}/contact/`,
            availableLanguage: 'English',
          },
        },
        {
          '@type': 'WebSite',
          '@id': WEBSITE_ID,
          url: `${SITE_ORIGIN}/`,
          name: 'SoapSpice',
          alternateName: 'SoapSpice Soap Making Calculator',
          publisher: { '@id': ORGANIZATION_ID },
          about: { '@id': `${SITE_ORIGIN}/about/` },
        },
        {
          '@type': path === '/about' ? 'AboutPage'
            : path === '/contact' ? 'ContactPage'
              : path === '/soapmaking-library' ? 'CollectionPage'
              : path === '/calculators/cold-process-soap' ? 'WebApplication' : 'WebPage',
          '@id': canonical,
          name: metadata!.title,
          description: metadata!.description,
          url: canonical,
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORGANIZATION_ID },
          ...(path === '/' ? { mainEntity: { '@id': WEBSITE_ID } } : {}),
          ...(path === '/about' ? { about: { '@id': ORGANIZATION_ID } } : {}),
          ...(path === '/contact' ? { mainEntity: { '@id': ORGANIZATION_ID } } : {}),
          ...(path === '/soapmaking-library' ? {
            mainEntity: {
              '@type': 'ItemList',
              name: 'Soapmaking Articles and Recipes',
              numberOfItems: soapmakingLibraryResources.length,
              itemListElement: soapmakingLibraryResources.map((resource, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'CreativeWork',
                  name: resource.title,
                  url: resource.href.startsWith('http') ? resource.href : `${SITE_ORIGIN}${resource.href}`,
                  description: resource.summary,
                  image: `${SITE_ORIGIN}/${resource.image}`,
                },
              })),
            },
          } : {}),
          ...(path === '/calculators/cold-process-soap' ? {
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'Web',
          } : {}),
        },
      ],
    } : null,
  };
}

export function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexablePaths.map(path => `  <url><loc>${pageSeo(path).canonical}</loc><lastmod>${SITEMAP_LAST_MODIFIED}</lastmod></url>`).join('\n')}\n</urlset>\n`;
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
