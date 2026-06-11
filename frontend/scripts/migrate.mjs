// One-off DB setup script. Run with: node scripts/migrate.mjs
// Applies scripts/schema.sql to the database at DATABASE_URL.
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { config } from "dotenv"
import pg from "pg"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "..", ".env.local") })

const sql = readFileSync(path.join(__dirname, "schema.sql"), "utf-8")

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  await client.connect()
  console.log("Connected. Applying schema...")
  await client.query(sql)
  console.log("Schema applied successfully.")
  await client.end()
}

main().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
