---
name: SoapSpice Hostinger security headers
description: Verify static-host security headers at the CDN after rebuild and keep HTTPS policy scoped safely.
---

Hostinger's deployed response can differ from the source configuration. After a security-header change is published, inspect the live HTTP response as well as the generated `.htaccess`; Hostinger's edge may add only a minimal Content Security Policy.

**Why:** A live SoapSpice response showed only `upgrade-insecure-requests` and lacked other baseline browser security headers before the source changes.

**How to apply:** After pushing and rebuilding on Hostinger, verify the headers on both the homepage and a direct nested page. Keep HSTS HTTPS-only and do not add `includeSubDomains` until every subdomain is confirmed HTTPS-capable.
