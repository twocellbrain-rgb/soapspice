# SoapSpice

SoapSpice is a staged soapmaking website; its first working slice has an ingredient catalog and NaOH cold-process calculator.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/soapspice run dev` — run the SoapSpice website through its managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/soapspice run test:calculator` — deterministic calculator checks
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/soapspice/src/App.tsx` — first user-facing routes and recipe UI
- `artifacts/soapspice/src/lib/formulation.ts` — deterministic NaOH formula and validation
- `lib/db/src/schema/ingredients.ts` — editable PostgreSQL ingredient records
- `lib/api-spec/openapi.yaml` — public ingredient contract
- `artifacts/api-server/src/routes/ingredients.ts` — public ingredient API
- `README.md` and `CALCULATOR.md` — current scope and formula assumptions

## Architecture decisions

- Build in functional slices rather than showing links to modules that do not exist yet.
- Ingredients and SAP values are database-backed and source-linked, while browser-saved formulas remain local until account-backed persistence is implemented.
- Starter SAP entries remain labeled as needing administrator review. Do not present their results as certified safe recipes.

## Product

The homepage leads to a calculator and a searchable ingredient catalog. Users can validate, scale, print, and save a NaOH formula in the current browser.

## User preferences

- The brand name is SoapSpice; use the supplied vivid, bright-color logo.
- Build the full brief piece by piece; every visible control should actually work.

## Gotchas

- Regenerate API clients after changing `lib/api-spec/openapi.yaml`.
- Formula outputs must remain hidden for incomplete or invalid inputs. Do not save or print an invalid formulation.
- The current calculator assumes pure NaOH; do not silently treat KOH or diluted lye as equivalent.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
