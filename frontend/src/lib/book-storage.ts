"use client"

import { Book, Chapter, Verse } from "./types"

const STORAGE_KEY = "church-voice-books"

const coverColors = [
  "from-blue-900 to-indigo-800",
  "from-amber-800 to-yellow-700",
  "from-emerald-800 to-teal-700",
  "from-red-800 to-rose-700",
  "from-purple-800 to-violet-700",
  "from-green-800 to-emerald-700",
  "from-indigo-800 to-blue-700",
  "from-amber-900 to-orange-800",
  "from-teal-800 to-cyan-700",
  "from-rose-800 to-pink-700",
]

function generateId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function getNextCoverIndex(books: Book[]): number {
  return books.length % coverColors.length
}

export function getStoredBooks(): Book[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error("Failed to parse stored books", e)
  }
  return []
}

export function saveBooks(books: Book[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
  } catch (e) {
    console.error("Failed to save books", e)
  }
}

export function addBook(book: Omit<Book, "id" | "coverColor" | "completion" | "chapters" | "totalVerses" | "totalDuration" | "totalChapters"> & { chapters: Chapter[] }): Book {
  const books = getStoredBooks()
  const id = generateId(book.title)
  const coverIndex = getNextCoverIndex(books)
  
  let totalVerses = 0
  const chaptersWithVerses = book.chapters.map((chapter) => {
    totalVerses += chapter.verses.length
    return {
      ...chapter,
      duration: chapter.verses.reduce((sum, v) => sum + v.duration, 0),
    }
  })
  
  const totalDuration = chaptersWithVerses.reduce((sum, ch) => sum + ch.duration, 0)
  
  const newBook: Book = {
    ...book,
    id,
    coverColor: coverColors[coverIndex],
    completion: 0,
    chapters: chaptersWithVerses,
    totalChapters: chaptersWithVerses.length,
    totalVerses,
    totalDuration,
  }
  
  saveBooks([...books, newBook])
  return newBook
}

export function removeBook(id: string): void {
  const books = getStoredBooks()
  saveBooks(books.filter((b) => b.id !== id))
}

export function updateBookCompletion(id: string, completion: number): void {
  const books = getStoredBooks()
  const index = books.findIndex((b) => b.id === id)
  if (index !== -1) {
    books[index] = { ...books[index], completion }
    saveBooks(books)
  }
}

export function getBookById(id: string): Book | undefined {
  const books = getStoredBooks()
  return books.find((b) => b.id === id)
}

export function updateBook(
  id: string,
  updates: { title?: string; author?: string; narrator?: string; description?: string; language?: string }
): Book | undefined {
  const books = getStoredBooks()
  const index = books.findIndex((b) => b.id === id)
  if (index === -1) return undefined

  const updated = { ...books[index], ...updates }
  books[index] = updated
  saveBooks(books)
  return updated
}

export function createEmptyBook(
  title: string,
  author: string,
  narrator: string,
  language: string,
  description: string,
  chapterCount: number,
  versesPerChapter: number
): Omit<Book, "id" | "coverColor" | "completion" | "chapters" | "totalVerses" | "totalDuration" | "totalChapters"> & { chapters: Chapter[] } {
  const chapters: Chapter[] = Array.from({ length: chapterCount }, (_, i) => {
    const chNum = i + 1
    const verses: Verse[] = Array.from({ length: versesPerChapter }, (_, j) => ({
      id: `${generateId(title)}-${chNum}-${j + 1}`,
      number: j + 1,
      text: `Verse ${j + 1} of chapter ${chNum}. This verse text will be populated from the uploaded manuscript.`,
      duration: 10,
    }))
    return {
      id: `${generateId(title)}-${chNum}`,
      number: chNum,
      title: `Chapter ${chNum}`,
      verses,
      duration: verses.length * 10,
    }
  })
  
  return {
    title,
    author,
    narrator,
    description,
    language,
    chapters,
  }
}

export function parseFileName(fileName: string): { title: string; author?: string } {
  const name = fileName.replace(/\.(pdf|epub)$/i, "")
  const parts = name.split(/[-_]/).map(p => p.trim()).filter(Boolean)
  
  if (parts.length >= 2) {
    return { title: parts[0], author: parts.slice(1).join(" ") }
  }
  return { title: name, author: undefined }
}