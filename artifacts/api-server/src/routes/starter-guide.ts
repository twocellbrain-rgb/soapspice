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
  type StarterGuideProductsInput,
} from "@workspace/api-zod";
import { requireIngredientStaff } from "../middlewares/requireIngredientStaff";
import {
  AmazonCreatorsApiError,
  getAmazonCreatorsApiStatus,
  isAmazonProductUrl,
  searchAmazonProducts,
} from "../lib/amazon-creators";

const router: IRouter = Router();

router.get("/starter-guide-products", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(starterGuideProductListsTable)
    .orderBy(asc(starterGuideProductListsTable.toolSlug));

  res.json(ListStarterGuideProductsResponse.parse(rows));
});

router.use("/starter-guide-admin", requireIngredientStaff);

router.get("/starter-guide-admin/amazon/status", async (_req, res): Promise<void> => {
  res.json(getAmazonCreatorsApiStatus());
});

router.get("/starter-guide-admin/amazon/search", async (req, res): Promise<void> => {
  res.set("Cache-Control", "no-store");
  const keywords = typeof req.query.keywords === "string" ? req.query.keywords.trim() : "";
  if (keywords.length < 2 || keywords.length > 120) {
    res.status(400).json({ error: "Enter a search phrase between 2 and 120 characters." });
    return;
  }

  try {
    res.json(await searchAmazonProducts(keywords));
  } catch (error) {
    if (error instanceof AmazonCreatorsApiError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(502).json({ error: "Amazon Creators API could not complete the product search." });
  }
});

router.put("/starter-guide-admin/:toolSlug", async (req, res): Promise<void> => {
  const params = ReplaceStarterGuideProductsParams.safeParse(req.params);
  const body = ReplaceStarterGuideProductsBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Enter two or three complete product recommendations." });
    return;
  }
  if (body.data.products.some((product: StarterGuideProductsInput["products"][number]) => !isAmazonProductUrl(product.url))) {
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