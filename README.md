# SoapSpice

SoapSpice is a staged soapmaking education and formulation website. The first working slice includes a responsive home page, a database-backed ingredient field guide, and a cold-process **NaOH bar soap** calculator.

## What works now

- Browse and search a source-linked catalog of eight oils and butters.
- Add oils to a formula, set percentages or gram weights, change total oil batch size between grams, ounces, and pounds, and set superfat and lye concentration.
- Validate a formula, see calculated NaOH and distilled water with the underlying math, scale by changing batch size, and print a valid formula.
- Save and reopen formulas in the same browser. These are local browser saves, **not** account-backed or synchronized.

All starter SAP data is stored in PostgreSQL and served from the API. The starter values are linked to [SoapCalc's oil list](https://soapcalc.net/oil-list) and explicitly marked **source-linked, needs administrator review**. They are reference values, not supplier certificates or a guarantee that a finished batch is safe. Confirm ingredient identity, SAP values, lye purity, and safe handling independently before making soap. The calculator accepts only NaOH and assumes 100% NaOH purity; it is not a KOH, mixed-lye, or liquid-soap calculator.

## Structure

- `artifacts/soapspice` — React/TypeScript frontend.
- `artifacts/soapspice/src/lib/formulation.ts` — deterministic NaOH validation and calculation.
- `artifacts/api-server` — Express API under `/api`, including public ingredient routes and idempotent starter data insertion on startup.
- `lib/api-spec/openapi.yaml` — API contract; generated clients live in `lib/api-client-react` and `lib/api-zod`.
- `lib/db/src/schema/ingredients.ts` — PostgreSQL ingredient table.
- `CALCULATOR.md` — formula, assumptions, and calculation check examples.

## Develop and verify

Use the configured SoapSpice and API Server workflows. The database is the project's PostgreSQL database. After changing the API spec, run `pnpm --filter @workspace/api-spec run codegen`. After changing the schema in development, run `pnpm --filter @workspace/db run push`.

Useful checks:

```sh
pnpm run typecheck
pnpm --filter @workspace/soapspice run test:calculator
```

The database connection is supplied through `DATABASE_URL` in the server environment; do not expose it in browser code. The web artifact needs its managed `PORT` and `BASE_PATH` environment variables to run or build. The backend inserts only missing starter ingredient records and never overwrites edited records.

## Not built yet

This is the first functional slice, not the completed platform described in the full brief. It does **not** yet have user accounts, cloud-saved recipes, an administrator dashboard or approval flow, authored recipes and articles, glossary, troubleshooting, product management or affiliate links, newsletter delivery, additional calculators, or full production SEO. No Amazon product claims or links are displayed. These features should be implemented as real, secure workflows in later stages rather than as placeholder controls.

Before a public production release, have a qualified reviewer verify the SAP data and safety copy, implement administrator-controlled publication, and review the hosting/database/authentication and privacy setup. Moving to another host would require a Node.js runtime, a PostgreSQL database, corresponding environment configuration, the built frontend, API server, and a reviewed schema/data migration plan.