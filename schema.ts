import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  dayKey: varchar("day_key", { length: 12 }).notNull(),
  batchNo: integer("batch_no").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  generationId: integer("generation_id")
    .references(() => generations.id, { onDelete: "cascade" })
    .notNull(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull().unique(),
  topicId: varchar("topic_id", { length: 80 }).notNull(),
  category: varchar("category", { length: 90 }).notNull(),
  title: text("title").notNull(),
  intro: text("intro").notNull(),
  body: text("body").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  imagePrompts: jsonb("image_prompts").$type<{
    article: string;
    sections: string[];
  }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type Article = typeof articles.$inferSelect;
