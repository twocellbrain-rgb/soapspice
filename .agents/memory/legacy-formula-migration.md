---
name: Legacy formula migration
description: Why browser-only formulas remain intact when copied to a maker account
---

Treat earlier same-browser formulas as unvalidated drafts when importing them to an account, and leave the original browser copies intact after a successful import.

**Why:** The previous browser format did not record historical SAP values. A newly imported formula cannot honestly claim that its historical calculations match today's catalog, and deleting the only original copy after import would be an unnecessary data-loss risk.

**How to apply:** When changing migration or export behavior, distinguish a preserved draft from a formula freshly validated against the current source-linked catalog. Never silently substitute a current SAP value as a historical snapshot.