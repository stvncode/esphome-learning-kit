import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

// `sslmode=require|prefer|verify-ca` is already treated as `verify-full` by pg;
// state it explicitly to silence the upcoming-semantics deprecation warning.
const connectionString = databaseUrl.replace(
  /sslmode=(require|prefer|verify-ca)\b/,
  "sslmode=verify-full",
);

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
