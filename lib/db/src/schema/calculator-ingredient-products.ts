import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ingredientsTable } from "./ingredients";

export type CalculatorIngredientProduct = {
  title: string;
  note: string;
  url: string;
};

export const calculatorIngredientProductListsTable = pgTable("soap_calculator_ingredient_products", {
  ingredientId: text("ingredient_id")
    .primaryKey()
    .references(() => ingredientsTable.id, { onDelete: "cascade" }),
  products: jsonb("products").$type<CalculatorIngredientProduct[]>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCalculatorIngredientProductListSchema = createInsertSchema(
  calculatorIngredientProductListsTable,
).omit({
  updatedAt: true,
});

export type InsertCalculatorIngredientProductList = z.infer<
  typeof insertCalculatorIngredientProductListSchema
>;
export type CalculatorIngredientProductList =
  typeof calculatorIngredientProductListsTable.$inferSelect;