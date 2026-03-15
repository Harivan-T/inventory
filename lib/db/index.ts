import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const neonPool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const isProduction = process.env.NODE_ENV === "production";

// In production, always use Neon. In dev, use local.
const defaultPool = isProduction
  ? neonPool
  : new Pool({
      connectionString: process.env.LOCAL_DATABASE_URL,
      ssl: false,
    });

export const neonDb  = drizzle(neonPool,    { schema });
export const localDb = drizzle(defaultPool, { schema });
export const db      = drizzle(defaultPool, { schema });
