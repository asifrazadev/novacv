import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

// Vercel Preview deployments run against the second (staging) database instead
// of the production DATABASE_URL — see scripts/migrate.js / scripts/seed.js.
const connectionString =
  process.env.VERCEL_ENV === "preview" && process.env.STAGING_DATABASE_URL
    ? process.env.STAGING_DATABASE_URL
    : process.env.DATABASE_URL!

const pool = new Pool({ connectionString })

export const db = drizzle(pool, { schema })
