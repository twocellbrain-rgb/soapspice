import { Router, type IRouter } from "express";
import { and, asc, eq, ne } from "drizzle-orm";
import {
  calculatorIngredientProductListsTable,
  db,
  ingredientsTable,
} from "@workspace/db";
import {
  DeleteCalculatorIngredientProductsParams,
  ListCalculatorIngredientProductsResponse,
  ReplaceCalculatorIngredientProductsBody,
  ReplaceCalculatorIngredientProductsParams,
  ReplaceCalculatorIngredientProductsResponse,
  type CalculatorIngredientProductsInput,
} from "@workspace/api-zod";
import { requireIngredientStaff } from "../middlewares/requireIngredientStaff";
import { isAmazonProductUrl } from "../lib/amazon-creators";

const router: IRouter = Router();

router.get("/calculator-ingredient-products", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      ingredientId: calculatorIngredientProductListsTable.ingredientId,
      products: calculatorIngredientProductListsTable.products,
      updatedAt: calculatorIngredientProductListsTable.updatedAt,
    })
    .from(calculatorIngredientProductListsTable)
    .innerJoin(
      ingredientsTable,
      eq(calculatorIngredientProductListsTable.ingredientId, ingredientsTable.id),
    )
    .where(and(
      eq(ingredientsTable.active, true),
      ne(ingredientsTable.verificationStatus, "draft"),
    ))
    .orderBy(asc(ingredientsTable.name));

  res.json(ListCalculatorIngredientProductsResponse.parse(rows));
});

router.use("/calculator-ingredient-products-admin", requireIngredientStaff);

router.put(
  "/calculator-ingredient-products-admin/:ingredientId",
  async (req, res): Promise<void> => {
    const params = ReplaceCalculatorIngredientProductsParams.safeParse(req.params);
    const body = ReplaceCalculatorIngredientProductsBody.safeParse(req.body);
    if (!params.success || !body.success) {
      res.status(400).json({ error: "Enter one to three complete product cards." });
      return;
    }
    if (body.data.products.some((product: CalculatorIngredientProductsInput["products"][number]) => !isAmazonProductUrl(product.url))) {
      res.status(400).json({
        error: "Use HTTPS product links from an Amazon marketplace or official Amazon short-link domain.",
      });
      return;
    }

    const [ingredient] = await db
      .select({ id: ingredientsTable.id })
      .from(ingredientsTable)
      .where(and(
        eq(ingredientsTable.id, params.data.ingredientId),
        eq(ingredientsTable.active, true),
        ne(ingredientsTable.verificationStatus, "draft"),
      ))
      .limit(1);

    if (!ingredient) {
      res.status(404).json({ error: "Ingredient not found or not publicly available." });
      return;
    }

    const updatedAt = new Date();
    const [row] = await db
      .insert(calculatorIngredientProductListsTable)
      .values({
        ingredientId: params.data.ingredientId,
        products: body.data.products,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: calculatorIngredientProductListsTable.ingredientId,
        set: {
          products: body.data.products,
          updatedAt,
        },
      })
      .returning();

    res.json(ReplaceCalculatorIngredientProductsResponse.parse(row));
  },
);

router.delete(
  "/calculator-ingredient-products-admin/:ingredientId",
  async (req, res): Promise<void> => {
    const params = DeleteCalculatorIngredientProductsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid ingredient ID." });
      return;
    }

    await db
      .delete(calculatorIngredientProductListsTable)
      .where(eq(calculatorIngredientProductListsTable.ingredientId, params.data.ingredientId));
    res.status(204).end();
  },
);

export default router;