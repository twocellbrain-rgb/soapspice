import { Router, type IRouter } from "express";
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { db, ingredientsTable } from "@workspace/db";
import {
  GetIngredientParams,
  GetIngredientResponse,
  GetIngredientsQueryParams,
  GetIngredientsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/ingredients", async (req, res): Promise<void> => {
  const parsed = GetIngredientsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ingredient search" });
    return;
  }

  const conditions = [eq(ingredientsTable.active, true)];
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

  res.json(GetIngredientsResponse.parse(ingredients));
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
      ),
    )
    .limit(1);

  if (!ingredient) {
    res.status(404).json({ error: "Ingredient not found" });
    return;
  }

  res.json(GetIngredientResponse.parse(ingredient));
});

export default router;