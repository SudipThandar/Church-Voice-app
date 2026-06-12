"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, User, Globe, Layers, Clock, Play, ArrowLeft, Headphones, Sparkles, BookOpenCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchBookDetail, fetchBookPlaylist, fetchChapterDetail } from "@/lib/queries"
import type { BookDetail, ChapterSummary } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { useBottomPlayer } from "@/components/shared/bottom-player-provider"

export default function BookDetailsPage() {
  const params = useParams()
  const slug = params.id as string
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { play } = useBottomPlayer()

  useEffect(() => {
    let cancelled = false
    fetchBookDetail(slug)
      .then((data) => {
        if (!cancelled) setBook(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <Loader2 className="h-10 w-10 mb-4 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading volume...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <BookOpen className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-xl font-medium">Volume not found</p>
        <Link href="/library" className="mt-4 text-primary hover:underline">Back to Library</Link>
      </div>
    )
  }

  const handlePlayBook = async () => {
    const playlist = await fetchBookPlaylist(book.slug)
    if (!playlist) return
    play({
      bookTitle: book.title,
      chapterTitle: "Entire Book",
      type: "book",
      items: playlist.items,
    })
  }

  const handlePlayChapter = async (chapter: ChapterSummary) => {
    const detail = await fetchChapterDetail(book.slug, chapter.number)
    if (!detail) return
    play({
      bookTitle: book.title,
      chapterTitle: chapter.title,
      type: "chapter",
      items: detail.chapter.verses
        .filter((v) => !!v.recording)
        .map((v) => ({ verseNumber: v.number, verseText: v.text, audioUrl: v.recording!.audioUrl, durationSeconds: v.recording!.durationSeconds })),
    })
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Library
      </Link>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Cover & Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          {/* 3D Book Cover large */}
          <div className={`relative rounded-2xl bg-gradient-to-br ${book.coverColor} p-10 aspect-[4/5] flex flex-col justify-between shadow-2xl overflow-hidden`}>
            {/* Spine Crease Shadow */}
            <div className="absolute left-0 top-0 bottom-0 w-4.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
            <div className="absolute left-4.5 top-0 bottom-0 w-[1px] bg-white/10 z-10 pointer-events-none" />

            <div className="flex items-center justify-center flex-1 py-10">
              <BookOpen className="h-28 w-28 text-white/15" />
            </div>

            <div className="relative z-10 pl-2">
              <h1 className="text-3xl font-extrabold text-white font-serif tracking-wide leading-tight">{book.title}</h1>
              <p className="text-sm text-white/70 font-semibold tracking-wider uppercase mt-2">{book.author}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              size="lg"
              className="w-full bg-accent text-dark hover:bg-accent/90 hover:scale-[1.01] font-bold h-14 text-base rounded-xl shadow-lg transition-all duration-200 cursor-pointer"
              onClick={handlePlayBook}
              disabled={book.recordedVerses === 0}
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              Play Entire Volume
              <span className="ml-auto text-xs opacity-80 font-semibold font-mono bg-black/10 px-2.5 py-1 rounded-full">{formatDuration(book.totalDurationSeconds)}</span>
            </Button>

            <div className="space-y-4 rounded-2xl border border-border/40 bg-white p-6 shadow-premium">
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest border-b border-border/20 pb-2">Volume Metadata</h3>
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4.5 w-4.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Narrator</p>
                  <p className="font-semibold text-dark">{book.narrator}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Globe className="h-4.5 w-4.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Language / Translation</p>
                  <p className="font-semibold text-dark">{book.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Layers className="h-4.5 w-4.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Scope</p>
                  <p className="font-semibold text-dark">{book.totalChapters} chapters · {book.totalVerses} verses</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4.5 w-4.5 text-primary" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Total Run Duration</p>
                  <p className="font-semibold text-dark font-mono">{formatDuration(book.totalDurationSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm pt-2 border-t border-border/20">
                <Headphones className="h-4.5 w-4.5 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-muted">Recording Progress</p>
                    <span className="text-xs font-bold text-accent">{book.completion}%</span>
                  </div>
                  <Progress value={book.completion} className="h-2 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description & Chapters */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="rounded-2xl border border-border/40 bg-white p-6 shadow-premium">
            <h2 className="text-xl font-bold text-dark font-serif flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> About This Scripture
            </h2>
            <p className="mt-4 text-muted leading-relaxed font-sans text-base">{book.description}</p>
            <p className="mt-4 text-xs font-bold text-accent tracking-widest uppercase">Text source: {book.author}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-dark font-serif mb-4">Chapters Index</h2>
            <ScrollArea className="h-[550px] pr-4 rounded-xl">
              <div className="space-y-3">
                {book.chapters.map((chapter, i) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="group flex items-center justify-between rounded-xl border border-border/40 bg-white p-4 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        {chapter.number}
                      </div>
                      <div>
                        <p className="font-bold text-dark text-base">{chapter.title}</p>
                        <p className="text-xs text-muted font-medium mt-0.5">
                          {chapter.totalVerses} verses · {chapter.recordedVerses}/{chapter.totalVerses} recorded · {formatDuration(chapter.recordedDurationSeconds)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/reader/${book.slug}/${chapter.number}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 gap-1.5 px-3 rounded-lg text-xs font-bold text-muted hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <BookOpenCheck className="h-4 w-4" />
                          Read
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full text-primary hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-0"
                        onClick={() => handlePlayChapter(chapter)}
                        disabled={chapter.recordedVerses === 0}
                      >
                        <Play className="h-4.5 w-4.5 fill-current" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
