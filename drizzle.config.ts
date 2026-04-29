import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./lib/db/tables/*", "./lib/db/schema/*"],
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL ?? "",
  },
  tablesFilter: ["hospital_*"],
});
