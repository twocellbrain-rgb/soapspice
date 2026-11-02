---
name: SoapSpice hosting and routing
description: Public static-hosting constraints and the distinction between static pages and backend preview routing.
---

The user chose a public site with browser-only saves and no Clerk, hosted on Hostinger. Core public calculator and catalog functionality must not require a separately deployed API.

**Why:** The Hostinger static deployment served the homepage but returned 404 for ingredient API calls, breaking the calculator. The user chose browser-only saves rather than external authentication.

**How to apply:** Keep public features usable on a static host. Cloud saves, admin tools, or live API-backed libraries require a separate hosting decision rather than silently restoring an API dependency.

Preserve direct-link and refresh support for public routes.

**Why:** Hostinger returned 404 for direct calculator, catalog, and guide URLs even while the homepage loaded. Vite's development SPA fallback hid this production problem.

**How to apply:** Verify generated route entry pages or working production rewrites when adding routes; a passing client-side navigation test alone is insufficient.

For any remaining backend-specific preview tests, use Replit's artifact proxy rather than the frontend's direct Vite port.

**Why:** The proxy routes API requests to the backend; the direct frontend port can return HTML instead of API JSON.

**How to apply:** Keep API-specific checks separate from the public static-site checks.