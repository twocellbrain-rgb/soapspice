import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type StarterGuideProduct = {
  title: string;
  note: string;
  url: string;
};

export const starterGuideProductListsTable = pgTable("soap_starter_guide_products", {
  toolSlug: text("tool_slug").primaryKey(),
  products: jsonb("products").$type<StarterGuideProduct[]>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertStarterGuideProductListSchema = createInsertSchema(starterGuideProductListsTable).omit({
  updatedAt: true,
});

export type InsertStarterGuideProductList = z.infer<typeof insertStarterGuideProductListSchema>;
export type StarterGuideProductList = typeof starterGuideProductListsTable.$inferSelect;