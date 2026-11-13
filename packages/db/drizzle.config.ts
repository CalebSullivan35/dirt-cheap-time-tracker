import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// Reuse the web app's env file so DATABASE_URL lives in one place.
const webEnv = new URL("../../apps/web/.env.local", import.meta.url);
if (!process.env.DATABASE_URL && existsSync(webEnv)) process.loadEnvFile(webEnv);

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_URL! },
  casing: "snake_case",
});
