/**
 * This is the configuration for the server-side database.
 */

import { defineConfig } from "drizzle-kit";

const base = "./app/database";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_MIGRATION!,
  },
  schema: `${base}/schema.ts`,
  out: `${base}/migrations`,
  migrations: {
    prefix: "timestamp",
  },
  verbose: true,
});
