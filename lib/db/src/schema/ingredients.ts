import { boolean, doublePrecision, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
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
  sapProvenance: text("sap_provenance").notNull().default(""),
  verificationStatus: text("verification_status", {
    enum: ["draft", "source-linked-needs-review", "administrator-verified"],
  })
    .notNull()
    .default("source-linked-needs-review"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  lastEditedBy: text("last_edited_by"),
  revision: integer("revision").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

// Staff grants are provisioned out of band in the database; no public endpoint
// can grant itself an editor or reviewer role.
export const ingredientStaffTable = pgTable("soap_ingredient_staff", {
  userId: text("user_id").primaryKey(),
  role: text("role", { enum: ["editor", "reviewer"] }).notNull(),
});

export const insertIngredientSchema = createInsertSchema(ingredientsTable).omit({
  active: true, reviewedBy: true, reviewedAt: true, lastEditedBy: true, revision: true,
});

export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredientsTable.$inferSelect;