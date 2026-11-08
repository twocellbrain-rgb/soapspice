import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db, ingredientsTable, recipesTable, type RecipeOil, type Recipe } from "@workspace/db";
import {
  CreateRecipeBody, ImportRecipeBody, UpdateRecipeBody,
  CreateRecipeResponse, ImportRecipeResponse, ListRecipesResponse,
  GetRecipeParams, GetRecipeResponse, UpdateRecipeParams, UpdateRecipeResponse,
  DeleteRecipeParams, type RecipeInput,
} from "@workspace/api-zod";

const router: IRouter = Router();
function owner(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId ?? null;
}
function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (process.env.SOAPSPICE_PUBLIC_ONLY === "true") { res.status(404).json({ error: "Account formulas are disabled on this public site." }); return; }
  if (!owner(req)) { res.status(401).json({ error: "Sign in required" }); return; }
  next();
}
router.use("/recipes", requireUser);

function output(row: Recipe) {
  return {
    id: row.id, name: row.name, batchSize: row.batchSize, unit: row.unit,
    superfat: row.superfat, concentration: row.concentration ?? undefined, oils: row.oils,
    ...row.extras,
    imported: row.legacyId !== null, createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
type Input = RecipeInput;
const grams = (data: Input) => data.batchSize * (data.unit === "oz" ? 28.3495 : data.unit === "lb" ? 453.592 : 1);

async function prepare(data: Input, legacy = false): Promise<{ oils: RecipeOil[]; error?: string }> {
  if (!Number.isFinite(grams(data)) || grams(data) <= 0 || data.oils.some(o => !Number.isFinite(o.weight) || !Number.isFinite(o.percentage))) {
    return { oils: [], error: "Invalid oil weights" };
  }
  const ids = data.oils.map(o => o.id);
  if (new Set(ids).size !== ids.length) return { oils: [], error: "Each ingredient can appear only once" };
  const records = await db.select().from(ingredientsTable).where(and(
    inArray(ingredientsTable.id, ids), eq(ingredientsTable.active, true),
    or(eq(ingredientsTable.verificationStatus, "source-linked-needs-review"), eq(ingredientsTable.verificationStatus, "administrator-verified")),
  ));
  const catalog = new Map(records.map(record => [record.id, record]));
  if (!legacy) {
    if (ids.some(id => !catalog.has(id) || !Number.isFinite(catalog.get(id)!.naohSap) || catalog.get(id)!.naohSap <= 0 || catalog.get(id)!.naohSap >= 1))
      return { oils: [], error: "An ingredient is missing or has an invalid current NaOH SAP value" };
    if (data.oils.some(o => o.weight <= 0 || o.percentage <= 0) ||
        Math.abs(data.oils.reduce((n, o) => n + o.percentage, 0) - 100) > .01 ||
        Math.abs(data.oils.reduce((n, o) => n + o.weight, 0) - grams(data)) > Math.max(.02, grams(data) * .00001))
      return { oils: [], error: "Percentages must total 100% and weights must match the total oil weight" };
    if (data.liquidType === "other" && !data.customLiquid?.trim())
      return { oils: [], error: "Name the chosen liquid" };
    const fragranceWeight = (data.fragrances ?? []).reduce((sum, f) => sum + (
      f.unit === "percent" ? grams(data) * f.amount / 100 : f.unit === "oz" ? f.amount * 28.349523125 : f.amount
    ), 0);
    if (!Number.isFinite(fragranceWeight) || fragranceWeight > grams(data))
      return { oils: [], error: "Fragrance cannot weigh more than the oils" };
  }
  return { oils: data.oils.map(o => ({
    id: o.id, percentage: o.percentage, weight: o.weight,
    name: catalog.get(o.id)?.name ?? (legacy ? o.name?.trim() : undefined) ?? o.id,
    // No historical SAP was stored by the original browser-only format.
    savedSap: legacy ? null : catalog.get(o.id)!.naohSap,
  })) };
}

router.get("/recipes", async (req, res): Promise<void> => {
  const rows = await db.select().from(recipesTable).where(eq(recipesTable.ownerId, owner(req)!)).orderBy(desc(recipesTable.updatedAt));
  res.json(ListRecipesResponse.parse(rows.map(output)));
});
router.post("/recipes", async (req, res): Promise<void> => {
  const parsed = CreateRecipeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid formula input" }); return; }
  const prepared = await prepare(parsed.data);
  if (prepared.error) { res.status(400).json({ error: prepared.error }); return; }
  const { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod, ...fields } = parsed.data;
  const [row] = await db.insert(recipesTable).values({
    ...fields, concentration: fields.concentration ?? null,
    extras: { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod },
    oils: prepared.oils, ownerId: owner(req)!,
  }).returning();
  res.status(201).json(CreateRecipeResponse.parse(output(row)));
});
router.post("/recipes/import", async (req, res): Promise<void> => {
  const parsed = ImportRecipeBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid legacy formula" }); return; }
  const { legacyId, ...data } = parsed.data;
  const prepared = await prepare(data, true);
  if (prepared.error) { res.status(400).json({ error: prepared.error }); return; }
  const { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod, ...fields } = data;
  const [row] = await db.insert(recipesTable).values({
    ...fields, concentration: fields.concentration ?? null, ownerId: owner(req)!, legacyId, oils: prepared.oils,
    extras: { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod },
  })
    .onConflictDoNothing({ target: [recipesTable.ownerId, recipesTable.legacyId] }).returning();
  const existing = row ?? (await db.select().from(recipesTable).where(and(eq(recipesTable.ownerId, owner(req)!), eq(recipesTable.legacyId, legacyId))).limit(1))[0];
  res.status(201).json(ImportRecipeResponse.parse(output(existing)));
});
router.get("/recipes/:recipeId", async (req, res): Promise<void> => {
  const params = GetRecipeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid recipe ID" }); return; }
  const [row] = await db.select().from(recipesTable).where(and(eq(recipesTable.id, params.data.recipeId), eq(recipesTable.ownerId, owner(req)!))).limit(1);
  if (!row) { res.status(404).json({ error: "Formula not found" }); return; }
  res.json(GetRecipeResponse.parse(output(row)));
});
router.put("/recipes/:recipeId", async (req, res): Promise<void> => {
  const params = UpdateRecipeParams.safeParse(req.params);
  const parsed = UpdateRecipeBody.safeParse(req.body);
  if (!params.success || !parsed.success) { res.status(400).json({ error: "Invalid formula input" }); return; }
  const prepared = await prepare(parsed.data);
  if (prepared.error) { res.status(400).json({ error: prepared.error }); return; }
  const { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod, ...fields } = parsed.data;
  const [row] = await db.update(recipesTable).set({
    ...fields, concentration: fields.concentration ?? null,
    extras: { fragrances, liquidType, customLiquid, oilInputUnit, liquidMethod },
    oils: prepared.oils, legacyId: null, updatedAt: new Date(),
  })
    .where(and(eq(recipesTable.id, params.data.recipeId), eq(recipesTable.ownerId, owner(req)!))).returning();
  if (!row) { res.status(404).json({ error: "Formula not found" }); return; }
  res.json(UpdateRecipeResponse.parse(output(row)));
});
router.delete("/recipes/:recipeId", async (req, res): Promise<void> => {
  const params = DeleteRecipeParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid recipe ID" }); return; }
  const [row] = await db.delete(recipesTable).where(and(eq(recipesTable.id, params.data.recipeId), eq(recipesTable.ownerId, owner(req)!))).returning();
  if (!row) { res.status(404).json({ error: "Formula not found" }); return; }
  res.sendStatus(204);
});
export default router;