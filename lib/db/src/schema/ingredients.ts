import { boolean, doublePrecision, pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ingredientsTable = pgTable("soap_ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  alternateNames: text("alternate_names").array().notNull(),
  category: text("category", { enum: ["oil", "butter"] }).notNull(),
  description: text("description").notNull(),
  naohSap: doublePrecision("naoh_sap").notNull(),
  kohSap: doublePrecision("koh_sap").notNull(),
  sapSourceTitle: text("sap_source_title").notNull(),
  sapSourceUrl: text("sap_source_url").notNull(),
  verificationStatus: text("verification_status", {
    enum: ["source-linked-needs-review", "administrator-verified"],
  })
    .notNull()
    .default("source-linked-needs-review"),
  active: boolean("active").notNull().default(true),
});

export const insertIngredientSchema = createInsertSchema(ingredientsTable).omit({
  active: true,
});

export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredientsTable.$inferSelect;