import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Neon DB — read only (viewing drugs)
const neonPool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Local DB — read/write (adding, editing, warehouses, sections)
const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL,
  ssl: false,
});

export const neonDb  = drizzle(neonPool,  { schema });
export const localDb = drizzle(localPool, { schema });
export const db = localDb;