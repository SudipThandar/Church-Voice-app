// One-off seed script. Run with: node scripts/seed-john.mjs
// Seeds the Gospel of John (World English Bible, public domain) from bible-api.com.
import { fileURLToPath } from "node:url"
import path from "node:path"
import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.join(__dirname, "..", ".env.local") })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const BOOK = {
  slug: "john",
  title: "Gospel of John",
  author: "John the Apostle",
  description:
    "An account of the life, teachings, death, and resurrection of Jesus Christ, written to inspire belief that Jesus is the Christ, the Son of God.",
  language: "English (WEB)",
  narrator: "Unassigned",
  cover_color: "from-blue-900 to-indigo-800",
}

const CHAPTER_COUNT = 21

function cleanText(text) {
  return text.replace(/\s+/g, " ").trim()
}

async function fetchChapter(num) {
  const res = await fetch(`https://bible-api.com/john+${num}?translation=web`)
  if (!res.ok) throw new Error(`Failed to fetch John ${num}: ${res.status}`)
  const data = await res.json()
  return data.verses.map((v) => ({ number: v.verse, text: cleanText(v.text) }))
}

async function main() {
  console.log(`Upserting book "${BOOK.title}"...`)
  const { data: book, error: bookError } = await supabase
    .from("books")
    .upsert(BOOK, { onConflict: "slug" })
    .select()
    .single()
  if (bookError) throw bookError

  for (let chapterNum = 1; chapterNum <= CHAPTER_COUNT; chapterNum++) {
    const { data: existing } = await supabase
      .from("chapters")
      .select("id")
      .eq("book_id", book.id)
      .eq("number", chapterNum)
      .maybeSingle()

    if (existing) {
      console.log(`Chapter ${chapterNum} already exists, skipping.`)
      continue
    }

    console.log(`Fetching John ${chapterNum}...`)
    const verses = await fetchChapter(chapterNum)

    const { data: chapter, error: chapterError } = await supabase
      .from("chapters")
      .insert({ book_id: book.id, number: chapterNum, title: `Chapter ${chapterNum}` })
      .select()
      .single()
    if (chapterError) throw chapterError

    const verseRows = verses.map((v) => ({ chapter_id: chapter.id, number: v.number, text: v.text }))
    const { error: versesError } = await supabase.from("verses").insert(verseRows)
    if (versesError) throw versesError

    console.log(`  Inserted chapter ${chapterNum} with ${verseRows.length} verses.`)

    // Be polite to the free API
    await new Promise((r) => setTimeout(r, 2000))
  }

  console.log("Done seeding Gospel of John.")
}

main().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
