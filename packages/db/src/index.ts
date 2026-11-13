import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export * from "./schema";
export { schema };

export function createDb(url: string) {
  // prepare:false keeps us compatible with poolers like Neon's pgbouncer endpoint.
  const client = postgres(url, { prepare: false, max: 5 });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Db = ReturnType<typeof createDb>;

const globalForDb = globalThis as unknown as { __dctDb?: Db };

/** Shared instance for the app server (survives Next.js hot reloads). */
export function getDb(): Db {
  if (!globalForDb.__dctDb) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    globalForDb.__dctDb = createDb(url);
  }
  return globalForDb.__dctDb;
}
