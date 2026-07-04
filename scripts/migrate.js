#!/usr/bin/env node
/**
 * NovaCV migration runner — no psql required.
 *
 * Applies every *.sql file in drizzle/ in lexicographic order.
 * Tracks applied migrations in a "schema_migrations" table so
 * re-running is safe (already-applied files are skipped).
 *
 * Usage:
 *   node scripts/migrate.js
 *   node scripts/migrate.js --staging     (uses STAGING_DATABASE_URL)
 *   DATABASE_URL=postgres://... node scripts/migrate.js
 */

const fs   = require("fs")
const path = require("path")
const { Pool } = require("pg")
const { resolveDatabaseUrl } = require("./lib/db-url")

async function main() {
  const staging = process.argv.includes("--staging")
  const varName = staging ? "STAGING_DATABASE_URL" : "DATABASE_URL"

  const connectionString = resolveDatabaseUrl(varName)
  if (!connectionString) {
    console.error(`❌  ${varName} is not set. Pass it as an env var or set it in .env.local`)
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes("supabase.com") || connectionString.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  })

  const client = await pool.connect()

  try {
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename  TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const drizzleDir = path.join(__dirname, "..", "drizzle")
    const files = fs
      .readdirSync(drizzleDir)
      .filter(f => f.endsWith(".sql"))
      .sort()

    if (files.length === 0) {
      console.log("No .sql files found in drizzle/")
      return
    }

    for (const file of files) {
      const { rows } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [file]
      )
      if (rows.length > 0) {
        console.log(`  ⏭  ${file} (already applied)`)
        continue
      }

      const sql = fs.readFileSync(path.join(drizzleDir, file), "utf8")
      console.log(`  ▶  Applying ${file}…`)
      await client.query("BEGIN")
      try {
        await client.query(sql)
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file]
        )
        await client.query("COMMIT")
        console.log(`  ✅  ${file} applied`)
      } catch (err) {
        await client.query("ROLLBACK")
        console.error(`  ❌  ${file} FAILED: ${err.message}`)
        process.exit(1)
      }
    }

    console.log("\nAll migrations up to date.")
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(err => {
  console.error("Migration runner crashed:", err.message)
  process.exit(1)
})
