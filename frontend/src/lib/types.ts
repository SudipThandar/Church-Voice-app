// Raw database row shapes (mirrors scripts/schema.sql)

export interface BookRow {
  id: string
  slug: string
  title: string
  author: string
  description: string
  language: string
  narrator: string
  cover_color: string
  created_at: string
}

export interface ChapterRow {
  id: string
  book_id: string
  number: number
  title: string
}

export interface VerseRow {
  id: string
  chapter_id: string
  number: number
  text: string
}

export interface RecordingRow {
  id: string
  verse_id: string
  storage_path: string
  duration_seconds: number
  file_size: number
  mime_type: string
  recorded_at: string
}

export interface BookProgressRow {
  book_id: string
  total_chapters: number
  total_verses: number
  recorded_verses: number
}

// Composed shapes used by the UI

export interface LibraryBook {
  id: string
  slug: string
  title: string
  author: string
  description: string
  coverColor: string
  language: string
  narrator: string
  totalChapters: number
  totalVerses: number
  recordedVerses: number
  completion: number
}

export interface ChapterSummary {
  id: string
  number: number
  title: string
  totalVerses: number
  recordedVerses: number
  recordedDurationSeconds: number
}

export interface BookDetail extends LibraryBook {
  chapters: ChapterSummary[]
  totalDurationSeconds: number
}

export interface VerseWithRecording {
  id: string
  number: number
  text: string
  recording: {
    audioUrl: string
    durationSeconds: number
  } | null
}

export interface ChapterDetail {
  id: string
  number: number
  title: string
  verses: VerseWithRecording[]
}

// Management/admin shapes

export interface ManagementVerse {
  id: string
  number: number
  recorded: boolean
}

export interface ManagementChapter {
  id: string
  number: number
  title: string
  recordedCount: number
  verses: ManagementVerse[]
}

export interface ManagementBookDetail extends LibraryBook {
  chapters: ManagementChapter[]
}

// Audio playback types

export interface PlaylistItem {
  verseNumber?: number
  verseText?: string
  audioUrl: string
  durationSeconds?: number
}

export interface TrackInfo {
  bookTitle: string
  chapterTitle: string
  type: "verse" | "chapter" | "book"
  items: PlaylistItem[]
}
