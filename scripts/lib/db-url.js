const fs = require("fs")
const path = require("path")

/**
 * Resolves a Postgres connection string for `varName`, checking the real
 * environment first and falling back to a matching line in .env.local at
 * the repo root (kept for parity with how migrate.js already loaded config).
 */
function resolveDatabaseUrl(varName) {
  if (process.env[varName]) return process.env[varName]

  try {
    const envFile = fs.readFileSync(
      path.join(__dirname, "..", "..", ".env.local"),
      "utf8"
    )
    const re = new RegExp(`^${varName}=["']?(.+?)["']?\\s*$`, "m")
    const m = envFile.match(re)
    if (m) return m[1]
  } catch {}

  return undefined
}

module.exports = { resolveDatabaseUrl }
