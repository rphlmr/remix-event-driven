import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "~/utils/env";

import * as schema from "./schema";

export const db = drizzle(
  postgres(env.DATABASE_URL, { prepare: false, max: 20 }),
  {
    schema,
  }
);
