// One-off storage setup script. Run with: node scripts/setup-storage.mjs
// Creates the public "recordings" bucket used to store verse audio files.
import { fileURLToPath } from "node:url"
import path from "node:path"
import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "..", ".env.local") })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

const BUCKET = "recordings"

async function main() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) throw listError

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" already exists.`)
    return
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "20MB",
    allowedMimeTypes: ["audio/webm", "audio/mp4", "audio/mpeg", "audio/wav", "audio/ogg"],
  })
  if (error) throw error

  console.log(`Bucket "${BUCKET}" created (public).`)
}

main().catch((err) => {
  console.error("Storage setup failed:", err)
  process.exit(1)
})
