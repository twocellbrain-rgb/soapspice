import { pgTable, text, timestamp, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const soapmakingLibraryTable = pgTable("soapmaking_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").notNull(),
  title: text("title").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceName: text("source_name").notNull(),
  kind: text("kind", { enum: ["article", "recipe", "tutorial", "safety", "other"] }).notNull(),
  author: text("author"),
  summary: text("summary"),
  notes: text("notes"),
  tags: text("tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("soapmaking_library_owner_url_unique").on(table.ownerId, table.sourceUrl)]);

export const insertSoapmakingLibrarySchema = createInsertSchema(soapmakingLibraryTable).omit({ id: true, createdAt: true });
export type InsertSoapmakingLibraryItem = z.infer<typeof insertSoapmakingLibrarySchema>;
export type SoapmakingLibraryItem = typeof soapmakingLibraryTable.$inferSelect;
