import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { toObjectMap } from "~/utils/transform";

const orderStatus = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export const orderStatusMap = toObjectMap(orderStatus);

export type OrderStatus = keyof typeof orderStatusMap;

export type OrderId = Brand<string, "OrderId">;

export const order = pgTable("order", {
  id: uuid("id").$type<OrderId>().primaryKey().defaultRandom(),
  status: text("status", { enum: orderStatus }).default("pending"),
  createdAt: timestamp("created_at", { precision: 3, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { precision: 3, mode: "string" })
    .default(sql`null`)
    .$onUpdate(() => sql`now()`),
});

export type Order = typeof order.$inferSelect;
