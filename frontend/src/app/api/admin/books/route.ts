import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { COVER_COLORS } from "@/lib/storage"

interface VerseInput {
  number: number
  text: string
}

interface ChapterInput {
  number: number
  title: string
  verses: VerseInput[]
}

interface BookInput {
  slug: string
  title: string
  author?: string
  description?: string
  language?: string
  narrator?: string
  chapters: ChapterInput[]
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BookInput>

  if (
    typeof body.slug !== "string" ||
    !body.slug.trim() ||
    typeof body.title !== "string" ||
    !body.title.trim() ||
    !Array.isArray(body.chapters) ||
    body.chapters.length === 0
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const { count } = await supabase.from("books").select("*", { count: "exact", head: true })
  const coverColor = COVER_COLORS[(count ?? 0) % COVER_COLORS.length]

  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      slug: body.slug.trim(),
      title: body.title.trim(),
      author: body.author?.trim() || "Unknown",
      description: body.description?.trim() || "",
      language: body.language?.trim() || "English",
      narrator: body.narrator?.trim() || "Unassigned",
      cover_color: coverColor,
    })
    .select()
    .single()

  if (bookError) {
    if (bookError.code === "23505") {
      return NextResponse.json({ error: "A book with this slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: bookError.message }, { status: 500 })
  }

  for (const chapter of body.chapters) {
    const { data: chapterRow, error: chapterError } = await supabase
      .from("chapters")
      .insert({ book_id: book.id, number: chapter.number, title: chapter.title })
      .select()
      .single()

    if (chapterError) {
      return NextResponse.json({ error: chapterError.message }, { status: 500 })
    }

    if (chapter.verses.length > 0) {
      const verseRows = chapter.verses.map((v) => ({
        chapter_id: chapterRow.id,
        number: v.number,
        text: v.text,
      }))
      const { error: versesError } = await supabase.from("verses").insert(verseRows)
      if (versesError) {
        return NextResponse.json({ error: versesError.message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true, book })
}
