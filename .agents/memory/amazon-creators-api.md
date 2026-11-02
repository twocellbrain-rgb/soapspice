---
name: Amazon Creators API
description: Current Amazon affiliate catalog API choice and project data-retention constraints.
---

Use Amazon Creators API rather than Product Advertising API 5.0; Amazon's current documentation says PA-API 5.0 is deprecated. Keep the Credential ID, Secret, credential Version, partner tag, and marketplace configuration server-side in Replit Secrets.

Creators API catalog responses are temporary: ItemInfo and DetailPageURL content may be cached for up to one day, while Offers content has a one-hour TTL. The SoapSpice product search should remain discovery-only unless persistent API data is paired with TTL-aware refresh. Manual product entries remain the durable source for public recommendations.

Calculator product cards are matched by stable catalog ingredient ID, not display names or aliases. Do not infer a match from free-text fragrance names without a curated identity.

Until product-specific Associates URLs are available, show every selected calculator oil or butter with an Amazon.com search link labeled “Check Amazon for price.” These are discovery links, not affiliate links or live prices; later curated product URLs should map to the matching ingredient ID.

**Why:** Persisting API-sourced titles or URLs indefinitely can violate Amazon's catalog-content cache limits; manual recommendations do not require Amazon API credentials.

**How to apply:** Keep the API search staff-only, do not expose credentials to the browser, disable HTTP/browser caching for catalog search, and never copy search results into persistent product lists without an approved refresh strategy. Until tracked product URLs are supplied, use ingredient-specific Amazon search links and clearly state they are not affiliate links or price quotes. Key curated formula recommendations by the calculator's ingredient ID so aliases and display-name changes cannot attach a card to the wrong oil.