import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  db,
  starterGuideProductListsTable,
} from "@workspace/db";
import {
  DeleteStarterGuideProductsParams,
  ListStarterGuideProductsResponse,
  ReplaceStarterGuideProductsBody,
  ReplaceStarterGuideProductsParams,
  ReplaceStarterGuideProductsResponse,
} from "@workspace/api-zod";
import { requireIngredientStaff } from "../middlewares/requireIngredientStaff";

const router: IRouter = Router();

function isAmazonLink(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.pathname === "/") return false;
    const host = url.hostname.toLowerCase();
    return /^(?:www\.)?amzn\.(?:to|eu|in|sg)$/.test(host) ||
      /^(?:www\.)?amazon\.(?:(?:com|co)\.[a-z]{2}|com(?:\.[a-z]{2})?|[a-z]{2,3})$/.test(host);
  } catch {
    return false;
  }
}

router.get("/starter-guide-products", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(starterGuideProductListsTable)
    .orderBy(asc(starterGuideProductListsTable.toolSlug));

  res.json(ListStarterGuideProductsResponse.parse(rows));
});

router.use("/starter-guide-admin", requireIngredientStaff);

router.put("/starter-guide-admin/:toolSlug", async (req, res): Promise<void> => {
  const params = ReplaceStarterGuideProductsParams.safeParse(req.params);
  const body = ReplaceStarterGuideProductsBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Enter two or three complete product recommendations." });
    return;
  }
  if (body.data.products.some((product) => !isAmazonLink(product.url))) {
    res.status(400).json({ error: "Use HTTPS product links from an Amazon marketplace or official Amazon short-link domain." });
    return;
  }

  const updatedAt = new Date();
  const [row] = await db
    .insert(starterGuideProductListsTable)
    .values({
      toolSlug: params.data.toolSlug,
      products: body.data.products,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: starterGuideProductListsTable.toolSlug,
      set: {
        products: body.data.products,
        updatedAt,
      },
    })
    .returning();

  res.json(ReplaceStarterGuideProductsResponse.parse(row));
});

router.delete("/starter-guide-admin/:toolSlug", async (req, res): Promise<void> => {
  const params = DeleteStarterGuideProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid tool category." });
    return;
  }

  await db
    .delete(starterGuideProductListsTable)
    .where(eq(starterGuideProductListsTable.toolSlug, params.data.toolSlug));
  res.status(204).end();
});

export default router;