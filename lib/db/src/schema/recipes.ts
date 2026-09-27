import { pgTable, text, jsonb, timestamp, uuid, uniqueIndex, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export type RecipeOil = { id: string; name: string; percentage: number; weight: number; savedSap: number | null };
export type RecipeExtras = {
  fragrances?: { id: string; name: string; amount: number; unit: "g" | "oz" | "percent" }[];
  liquidType?: "distilled-water" | "goat-milk" | "cow-milk" | "other";
  customLiquid?: string;
  oilInputUnit?: "percent" | "g" | "oz";
  liquidMethod?: "batch-22";
};

export const recipesTable = pgTable("soap_recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  legacyId: text("legacy_id"),
  name: text("name").notNull(),
  batchSize: doublePrecision("batch_size").notNull(),
  unit: text("unit", { enum: ["g", "oz", "lb"] }).notNull(),
  superfat: doublePrecision("superfat").notNull(),
  concentration: doublePrecision("concentration"),
  oils: jsonb("oils").$type<RecipeOil[]>().notNull(),
  extras: jsonb("extras").$type<RecipeExtras>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [uniqueIndex("soap_recipes_owner_legacy_unique").on(table.ownerId, table.legacyId)]);

export const insertRecipeSchema = createInsertSchema(recipesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipesTable.$inferSelect;