# Public-page SEO on Hostinger

The regular build pre-renders the real React pages to static HTML. Hostinger still
serves static files; no API, Clerk, Node runtime server, or browser installation
is required. Calculator drafts and browser saves are never included in the build.
The browser mounts the interactive application over the public HTML as before.

`src/lib/seo.ts` is the shared source for public routes, metadata, canonical URLs,
and sitemap entries. Ingredient routes are derived from the bundled catalog.
Canonical URLs use HTTPS, the non-www domain, and directory trailing slashes so
they match static-host directory indexes rather than pointing at redirecting URLs.
The build uses Vite to bundle the server-rendering entry, then React's
`renderToString` to generate complete page HTML, not copies of an empty app shell.

The production output directory remains **dist/public** within this app.
Deploy only this directory, not `dist/prerender` (a build-time helper).

## Hostinger build settings

This is a pnpm monorepo, so use the repository root as the build root but build
only the SoapSpice website:

- Build command: `pnpm run build:hostinger`
- Output directory: `artifacts/soapspice/dist/public`
- Node.js: 22.12 or newer

Do not use the workspace-wide `pnpm run build` for this static site. It builds
other workspace applications too, and their Vite configuration requires service
environment variables that Hostinger does not provide by default.

The build generates `/sitemap.xml` automatically. It is not a manually maintained
public source file. Vite also serves that same generated XML during development.
`robots.txt` references `https://soapspice.com/sitemap.xml`.

Results, browser saves, print pages, and 404 pages carry `noindex, follow` and are
excluded from the sitemap. Do not disallow these paths in robots.txt: Google must
be allowed to read their noindex tags. No personal formulas appear in public HTML.

Known routes have their own index.html, preserving direct links and refreshes.
The Apache-compatible `.htaccess` serves a real 404 for unknown paths rather than
returning an indexable homepage for every nonexistent URL. If Hostinger serves
the files with a non-Apache server, its unknown-route status handling should be
configured equivalently.

## After Hostinger rebuilds

1. Open `/sitemap.xml` and confirm that it is XML listing all public URLs.
2. Inspect a public page's raw source (not only the browser Elements panel).
   It should contain its actual heading/body, unique title, and canonical URL.
3. In [Google Search Console](https://search.google.com/search-console), add or
   select the `soapspice.com` property. Verify ownership if requested.
4. Submit `https://soapspice.com/sitemap.xml` under Sitemaps.
5. Use URL Inspection's live test on the homepage, calculator, one ingredient,
   and a guide. Request indexing for important pages and monitor Pages reports.

Search Console verification needs the owner's account access. Submission does
not guarantee indexing or ranking. Only use genuinely updated last-modified dates;
the generated sitemap deliberately does not invent dates or ranking priorities.
