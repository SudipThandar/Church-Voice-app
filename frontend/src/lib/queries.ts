"use client"

import { getSupabaseBrowserClient } from "./supabase/client"
import { RECORDINGS_BUCKET } from "./storage"
import type {
  BookRow,
  BookProgressRow,
  BookDetail,
  ChapterSummary,
  LibraryBook,
  ChapterDetail,
  VerseWithRecording,
  PlaylistItem,
  ManagementBookDetail,
  ManagementChapter,
} from "./types"

// PostgREST returns a to-one embed (verse -> recording, via the unique
// verse_id FK) as a single object or null, not an array — but defensively
// also handle an array shape in case the relationship is ever inferred as
// one-to-many.
function extractRecording<T>(rec: T | T[] | null | undefined): T | null {
  if (!rec) return null
  return Array.isArray(rec) ? (rec[0] ?? null) : rec
}

function toLibraryBook(book: BookRow, progress?: BookProgressRow): LibraryBook {
  const totalVerses = progress?.total_verses ?? 0
  const recordedVerses = progress?.recorded_verses ?? 0
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    description: book.description,
    coverColor: book.cover_color,
    language: book.language,
    narrator: book.narrator,
    totalChapters: progress?.total_chapters ?? 0,
    totalVerses,
    recordedVerses,
    completion: totalVerses > 0 ? Math.round((recordedVerses / totalVerses) * 100) : 0,
  }
}

export function getRecordingPublicUrl(path: string): string {
  const supabase = getSupabaseBrowserClient()
  return supabase.storage.from(RECORDINGS_BUCKET).getPublicUrl(path).data.publicUrl
}

export async function fetchLibraryBooks(): Promise<LibraryBook[]> {
  const supabase = getSupabaseBrowserClient()
  const [{ data: books, error: booksError }, { data: progress, error: progressError }] = await Promise.all([
    supabase.from("books").select("*").order("created_at"),
    supabase.from("book_progress").select("*"),
  ])
  if (booksError) throw booksError
  if (progressError) throw progressError

  const progressByBook = new Map((progress as unknown as BookProgressRow[] ?? []).map((p) => [p.book_id, p]))
  return ((books as unknown as BookRow[]) ?? []).map((b) => toLibraryBook(b, progressByBook.get(b.id)))
}

export async function fetchBookDetail(slug: string): Promise<BookDetail | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: book, error: bookError } = await supabase.from("books").select("*").eq("slug", slug).maybeSingle()
  if (bookError) throw bookError
  if (!book) return null
  const bookRow = book as unknown as BookRow

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, number, title, verses(id, recordings(id, duration_seconds))")
    .eq("book_id", bookRow.id)
    .order("number", { ascending: true })
  if (chaptersError) throw chaptersError

  let totalVerses = 0
  let recordedVerses = 0
  let totalDurationSeconds = 0
  const chapterSummaries: ChapterSummary[] = ((chapters ?? []) as unknown as Array<{
    id: string
    number: number
    title: string
    verses: Array<{ id: string; recordings: { id: string; duration_seconds: number } | { id: string; duration_seconds: number }[] | null }>
  }>).map((c) => {
    const verses = c.verses ?? []
    let recorded = 0
    let chapterDuration = 0
    for (const v of verses) {
      const recording = extractRecording(v.recordings)
      if (recording) {
        recorded += 1
        chapterDuration += recording.duration_seconds ?? 0
      }
    }
    totalVerses += verses.length
    recordedVerses += recorded
    totalDurationSeconds += chapterDuration
    return {
      id: c.id,
      number: c.number,
      title: c.title,
      totalVerses: verses.length,
      recordedVerses: recorded,
      recordedDurationSeconds: chapterDuration,
    }
  })

  return {
    ...toLibraryBook(bookRow, {
      book_id: bookRow.id,
      total_chapters: chapterSummaries.length,
      total_verses: totalVerses,
      recorded_verses: recordedVerses,
    }),
    chapters: chapterSummaries,
    totalDurationSeconds,
  }
}

export async function fetchBookPlaylist(slug: string): Promise<{ book: LibraryBook; items: PlaylistItem[] } | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: book, error: bookError } = await supabase.from("books").select("*").eq("slug", slug).maybeSingle()
  if (bookError) throw bookError
  if (!book) return null
  const bookRow = book as unknown as BookRow

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("number, verses(number, text, recordings(storage_path, duration_seconds))")
    .eq("book_id", bookRow.id)
    .order("number", { ascending: true })
  if (chaptersError) throw chaptersError

  const items: PlaylistItem[] = []
  for (const c of (chapters ?? []) as unknown as Array<{
    number: number
    verses: Array<{ number: number; text: string; recordings: { storage_path: string; duration_seconds: number } | { storage_path: string; duration_seconds: number }[] | null }>
  }>) {
    const verses = [...(c.verses ?? [])].sort((a, b) => a.number - b.number)
    for (const v of verses) {
      const recording = extractRecording(v.recordings)
      if (recording) {
        items.push({ verseNumber: v.number, verseText: v.text, audioUrl: getRecordingPublicUrl(recording.storage_path), durationSeconds: recording.duration_seconds })
      }
    }
  }

  const { data: progress } = await supabase.from("book_progress").select("*").eq("book_id", bookRow.id).maybeSingle()

  return {
    book: toLibraryBook(bookRow, (progress as unknown as BookProgressRow) ?? undefined),
    items,
  }
}

export async function fetchChapterDetail(
  bookSlug: string,
  chapterNumber: number
): Promise<{ book: LibraryBook; chapter: ChapterDetail } | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: book, error: bookError } = await supabase.from("books").select("*").eq("slug", bookSlug).maybeSingle()
  if (bookError) throw bookError
  if (!book) return null
  const bookRow = book as unknown as BookRow

  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id, number, title, verses(id, number, text, recordings(storage_path, duration_seconds))")
    .eq("book_id", bookRow.id)
    .eq("number", chapterNumber)
    .maybeSingle()
  if (chapterError) throw chapterError
  if (!chapter) return null

  const chapterRow = chapter as unknown as {
    id: string
    number: number
    title: string
    verses: Array<{
      id: string
      number: number
      text: string
      recordings: { storage_path: string; duration_seconds: number } | { storage_path: string; duration_seconds: number }[] | null
    }>
  }

  const verses = [...(chapterRow.verses ?? [])].sort((a, b) => a.number - b.number)

  const verseDetails: VerseWithRecording[] = verses.map((v) => {
    const recording = extractRecording(v.recordings)
    return {
      id: v.id,
      number: v.number,
      text: v.text,
      recording: recording
        ? {
            audioUrl: getRecordingPublicUrl(recording.storage_path),
            durationSeconds: recording.duration_seconds,
          }
        : null,
    }
  })

  const { data: progress } = await supabase.from("book_progress").select("*").eq("book_id", bookRow.id).maybeSingle()

  return {
    book: toLibraryBook(bookRow, (progress as unknown as BookProgressRow) ?? undefined),
    chapter: {
      id: chapterRow.id,
      number: chapterRow.number,
      title: chapterRow.title,
      verses: verseDetails,
    },
  }
}

export async function fetchBookManagementDetail(slug: string): Promise<ManagementBookDetail | null> {
  const supabase = getSupabaseBrowserClient()
  const { data: book, error: bookError } = await supabase.from("books").select("*").eq("slug", slug).maybeSingle()
  if (bookError) throw bookError
  if (!book) return null
  const bookRow = book as unknown as BookRow

  const { data: chapters, error: chaptersError } = await supabase
    .from("chapters")
    .select("id, number, title, verses(id, number, recordings(id))")
    .eq("book_id", bookRow.id)
    .order("number", { ascending: true })
  if (chaptersError) throw chaptersError

  let totalVerses = 0
  let recordedVerses = 0
  const chapterList: ManagementChapter[] = ((chapters ?? []) as unknown as Array<{
    id: string
    number: number
    title: string
    verses: Array<{ id: string; number: number; recordings: { id: string } | { id: string }[] | null }>
  }>).map((c) => {
    const verses = [...(c.verses ?? [])]
      .sort((a, b) => a.number - b.number)
      .map((v) => ({ id: v.id, number: v.number, recorded: extractRecording(v.recordings) !== null }))
    const recordedCount = verses.filter((v) => v.recorded).length
    totalVerses += verses.length
    recordedVerses += recordedCount
    return {
      id: c.id,
      number: c.number,
      title: c.title,
      recordedCount,
      verses,
    }
  })

  return {
    ...toLibraryBook(bookRow, {
      book_id: bookRow.id,
      total_chapters: chapterList.length,
      total_verses: totalVerses,
      recorded_verses: recordedVerses,
    }),
    chapters: chapterList,
  }
}
