import { index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const amigoRecordsTable = pgTable(
  "amigo_records",
  {
    id: text("id").primaryKey(),
    kind: text("kind").notNull(),
    ownerId: text("owner_id"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("amigo_records_kind_owner_idx").on(table.kind, table.ownerId),
  ],
);

export type AmigoRecord = typeof amigoRecordsTable.$inferSelect;
export type NewAmigoRecord = typeof amigoRecordsTable.$inferInsert;
