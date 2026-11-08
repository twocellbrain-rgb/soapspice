import { Router, type IRouter } from "express";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, ingredientsTable, type Ingredient } from "@workspace/db";
import {
  GetIngredientParams,
  GetIngredientResponse,
  GetIngredientsQueryParams,
  GetIngredientsResponse,
  GetIngredientStaffResponse, ListAdminIngredientsResponse,
  CreateAdminIngredientBody, CreateAdminIngredientResponse,
  type IngredientEdit,
  EditAdminIngredientParams, EditAdminIngredientBody, EditAdminIngredientResponse,
  ApproveAdminIngredientParams, ApproveAdminIngredientResponse,
  ApproveAdminIngredientBody,
} from "@workspace/api-zod";
import { approvalRevisionMatches } from "../lib/ingredient-review";
import { requireIngredientStaff } from "../middlewares/requireIngredientStaff";

const router: IRouter = Router();

function verified(row: Ingredient): boolean {
  return row.verificationStatus === "administrator-verified" &&
    !!row.reviewedBy && !!row.reviewedAt &&
    citation(row.sapSourceTitle, row.sapSourceUrl) && !!row.sapProvenance.trim();
}
function output(row: Ingredient) {
  return {
    ...row,
    verificationStatus: verified(row) ? "administrator-verified" as const :
      row.sapSourceTitle.trim() && row.sapSourceUrl.trim() ? "source-linked-needs-review" as const : "draft" as const,
    reviewedBy: verified(row) ? row.reviewedBy : null,
    reviewedAt: verified(row) ? row.reviewedAt!.toISOString() : null,
  };
}
function citation(title: string, url: string): boolean {
  try {
    const parsed = new URL(url);
    return !!title.trim() && ["https:", "http:"].includes(parsed.protocol) && !!parsed.hostname;
  } catch { return false; }
}
function editValid(data: IngredientEdit): boolean {
  const bothOrNeither = Boolean(data.sapSourceTitle.trim()) === Boolean(data.sapSourceUrl.trim());
  return !!data.name.trim() && !!data.description.trim() &&
    data.alternateNames.every(name => !!name.trim()) &&
    bothOrNeither && (!data.sapSourceTitle.trim() ||
      (citation(data.sapSourceTitle, data.sapSourceUrl) && !!data.sapProvenance.trim()));
}
router.use("/ingredient-admin", requireIngredientStaff);
router.get("/ingredient-admin/me", (req, res): void => {
  res.json(GetIngredientStaffResponse.parse({ role: res.locals.ingredientStaff.role }));
});
router.get("/ingredient-admin", async (req, res): Promise<void> => {
  const rows = await db.select().from(ingredientsTable).orderBy(asc(ingredientsTable.name));
  res.json(ListAdminIngredientsResponse.parse(rows.map(output)));
});
router.post("/ingredient-admin", async (req, res): Promise<void> => {
  const parsed = CreateAdminIngredientBody.safeParse(req.body);
  if (!parsed.success || !editValid(parsed.data)) { res.status(400).json({ error: "Invalid ingredient or citation" }); return; }
  const { active, ...fields } = parsed.data;
  const [row] = await db.insert(ingredientsTable).values({
    ...fields, active, lastEditedBy: res.locals.ingredientStaff.userId,
    verificationStatus: fields.sapSourceTitle.trim() ? "source-linked-needs-review" : "draft",
  }).onConflictDoNothing({ target: ingredientsTable.id }).returning();
  if (!row) { res.status(409).json({ error: "Ingredient ID already exists" }); return; }
  res.status(201).json(CreateAdminIngredientResponse.parse(output(row)));
});
router.put("/ingredient-admin/:ingredientId", async (req, res): Promise<void> => {
  const params = EditAdminIngredientParams.safeParse(req.params);
  const parsed = EditAdminIngredientBody.safeParse(req.body);
  if (!params.success || !parsed.success || !editValid(parsed.data) || parsed.data.id !== params.data.ingredientId) {
    res.status(400).json({ error: "Invalid ingredient or citation" }); return;
  }
  const [row] = await db.update(ingredientsTable).set({
    ...parsed.data, lastEditedBy: res.locals.ingredientStaff.userId,
    revision: sql`${ingredientsTable.revision} + 1`,
    verificationStatus: parsed.data.sapSourceTitle.trim() ? "source-linked-needs-review" : "draft",
    reviewedBy: null, reviewedAt: null,
  }).where(eq(ingredientsTable.id, params.data.ingredientId)).returning();
  if (!row) { res.status(404).json({ error: "Ingredient not found" }); return; }
  res.json(EditAdminIngredientResponse.parse(output(row)));
});
router.post("/ingredient-admin/:ingredientId/approve", async (req, res): Promise<void> => {
  if (res.locals.ingredientStaff.role !== "reviewer") {
    res.status(403).json({ error: "Reviewer access required" }); return;
  }
  const params = ApproveAdminIngredientParams.safeParse(req.params);
  const body = ApproveAdminIngredientBody.safeParse(req.body);
  if (!params.success || !body.success) { res.status(400).json({ error: "Invalid ingredient ID or revision" }); return; }
  const [row] = await db.select().from(ingredientsTable).where(eq(ingredientsTable.id, params.data.ingredientId)).limit(1);
  if (!row) { res.status(404).json({ error: "Ingredient not found" }); return; }
  if (!approvalRevisionMatches(body.data.expectedRevision, row.revision)) {
    res.status(409).json({ error: "Ingredient changed since you opened it. Review the latest values before approving." }); return;
  }
  if (!citation(row.sapSourceTitle, row.sapSourceUrl) || !row.sapProvenance.trim() ||
      row.naohSap <= 0 || row.naohSap > 0.5 || row.kohSap <= 0 || row.kohSap > 0.7) {
    res.status(400).json({ error: "A valid citation, provenance, and SAP values are required before approval" }); return;
  }
  if (row.lastEditedBy === res.locals.ingredientStaff.userId) {
    res.status(403).json({ error: "Another reviewer must approve your edit" }); return;
  }
  const [approved] = await db.update(ingredientsTable).set({
    verificationStatus: "administrator-verified", reviewedBy: res.locals.ingredientStaff.userId, reviewedAt: new Date(),
    revision: sql`${ingredientsTable.revision} + 1`,
  }).where(and(
    eq(ingredientsTable.id, row.id),
    eq(ingredientsTable.revision, body.data.expectedRevision),
    eq(ingredientsTable.verificationStatus, "source-linked-needs-review"),
    eq(ingredientsTable.sapSourceTitle, row.sapSourceTitle),
    eq(ingredientsTable.sapSourceUrl, row.sapSourceUrl),
    eq(ingredientsTable.sapProvenance, row.sapProvenance),
    eq(ingredientsTable.naohSap, row.naohSap),
    eq(ingredientsTable.kohSap, row.kohSap),
    row.lastEditedBy ? eq(ingredientsTable.lastEditedBy, row.lastEditedBy) : sql`${ingredientsTable.lastEditedBy} IS NULL`,
  )).returning();
  if (!approved) { res.status(409).json({ error: "Ingredient changed or is no longer awaiting review. Refresh before approving." }); return; }
  res.json(ApproveAdminIngredientResponse.parse(output(approved)));
});

router.get("/ingredients", async (req, res): Promise<void> => {
  const parsed = GetIngredientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ingredient search" });
    return;
  }

  const conditions = [eq(ingredientsTable.active, true), or(
    eq(ingredientsTable.verificationStatus, "source-linked-needs-review"),
    eq(ingredientsTable.verificationStatus, "administrator-verified"),
  )!];
  if (parsed.data.category) {
    conditions.push(eq(ingredientsTable.category, parsed.data.category));
  }
  const search = parsed.data.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(ingredientsTable.name, pattern),
        ilike(ingredientsTable.description, pattern),
        ilike(sql<string>`array_to_string(${ingredientsTable.alternateNames}, ' ')`, pattern),
      )!,
    );
  }

  const ingredients = await db
    .select()
    .from(ingredientsTable)
    .where(and(...conditions))
    .orderBy(asc(ingredientsTable.name));

  res.json(GetIngredientsResponse.parse(ingredients.map(output)));
});

router.get("/ingredients/:ingredientId", async (req, res): Promise<void> => {
  const parsed = GetIngredientParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ingredient ID" });
    return;
  }

  const [ingredient] = await db
    .select()
    .from(ingredientsTable)
    .where(
      and(
        eq(ingredientsTable.id, parsed.data.ingredientId),
        eq(ingredientsTable.active, true),
        or(eq(ingredientsTable.verificationStatus, "source-linked-needs-review"),
           eq(ingredientsTable.verificationStatus, "administrator-verified")),
      ),
    )
    .limit(1);

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(GetIngredientResponse.parse(output(ingredient)));
});

export default router;