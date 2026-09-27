---
name: SoapSpice preview API routing
description: Explains why direct frontend-port testing can misdiagnose API-backed calculator behavior.
---

The SoapSpice artifact preview proxy routes `/api/*` requests to the API service; the frontend's direct Vite port serves its SPA fallback for those paths instead.

**Why:** A direct-port browser test returned HTML for an ingredient API request and raised `ingredients.map is not a function`, while the proxied preview returned the expected ingredient array and rendered the calculator.

**How to apply:** For browser checks of calculator flows that call `/api/*`, use the artifact preview or its proxy path. Do not treat direct frontend-port API responses as representative of the Replit preview.