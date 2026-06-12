"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Play, BookOpen, Clock, Type, Sparkles, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { fetchChapterDetail } from "@/lib/queries"
import type { LibraryBook, ChapterDetail, VerseWithRecording } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { useBottomPlayer } from "@/components/shared/bottom-player-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"

type ReaderTheme = "light" | "warm" | "dark"
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl"

export default function ReaderPage() {
  const params = useParams()
  const bookSlug = params.bookId as string
  const chapterNumber = Number(params.chapterId)

  const [book, setBook] = useState<LibraryBook | null>(null)
  const [chapter, setChapter] = useState<ChapterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const { play, playerState } = useBottomPlayer()
  const [activeVerse, setActiveVerse] = useState<number | null>(null)

  // Reading Settings state
  const [theme, setTheme] = useState<ReaderTheme>("light")
  const [fontSize, setFontSize] = useState<FontSize>("lg")

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetchChapterDetail(bookSlug, chapterNumber)
      .then((data) => {
        if (cancelled) return
        setBook(data?.book ?? null)
        setChapter(data?.chapter ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bookSlug, chapterNumber])

  // Sync active verse and trigger smooth scrolling while this chapter is playing
  useEffect(() => {
    const track = playerState.track
    if (
      playerState.isPlaying &&
      track &&
      track.bookTitle === book?.title &&
      track.chapterTitle === chapter?.title
    ) {
      const currentItem = track.items[playerState.currentIndex]
      if (currentItem?.verseNumber) {
        const playingVerseNum = currentItem.verseNumber
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveVerse(playingVerseNum)

        const element = document.getElementById(`verse-${playingVerseNum}`)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }, [playerState.isPlaying, playerState.currentIndex, playerState.track, book?.title, chapter?.title])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <Loader2 className="h-10 w-10 mb-4 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading chapter...</p>
      </div>
    )
  }

  if (!book || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <BookOpen className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-xl font-medium">Content not found</p>
        <Link href="/library" className="mt-4 text-primary hover:underline">Back to Library</Link>
      </div>
    )
  }

  const chapterDuration = chapter.verses.reduce((sum, v) => sum + (v.recording?.durationSeconds ?? 0), 0)

  const handlePlayVerse = (verse: VerseWithRecording) => {
    if (!verse.recording) return
    setActiveVerse(verse.number)
    play({
      bookTitle: book.title,
      chapterTitle: chapter.title,
      type: "verse",
      items: [{ verseNumber: verse.number, verseText: verse.text, audioUrl: verse.recording.audioUrl, durationSeconds: verse.recording.durationSeconds }],
    })
  }

  const handlePlayChapter = () => {
    setActiveVerse(null)
    play({
      bookTitle: book.title,
      chapterTitle: chapter.title,
      type: "chapter",
      items: chapter.verses
        .filter((v) => !!v.recording)
        .map((v) => ({ verseNumber: v.number, verseText: v.text, audioUrl: v.recording!.audioUrl, durationSeconds: v.recording!.durationSeconds })),
    })
  }

  const currentPlayingItem = playerState.track?.items[playerState.currentIndex]
  const isVersePlaying = (v: VerseWithRecording) =>
    playerState.isPlaying &&
    playerState.track?.bookTitle === book.title &&
    playerState.track?.chapterTitle === chapter.title &&
    currentPlayingItem?.verseNumber === v.number

  // Map theme variables
  const themeClasses: Record<ReaderTheme, string> = {
    light: "bg-[#F8FAFC] text-dark border-border/40",
    warm: "bg-[#FDF6E3] text-[#586E75] border-[#E9E2CE] shadow-orange-50/10",
    dark: "bg-[#0F172A] text-[#F8FAFC] border-slate-800 shadow-slate-950/20",
  }

  const fontClasses: Record<FontSize, string> = {
    sm: "text-sm md:text-base leading-relaxed",
    base: "text-base md:text-lg leading-relaxed",
    lg: "text-lg md:text-xl leading-loose",
    xl: "text-xl md:text-2xl leading-loose",
    "2xl": "text-2xl md:text-3xl leading-loose",
  }

  return (
    <div className={`min-h-[calc(100vh-64px)] transition-colors duration-300 ${theme === "light" ? "bg-background" : theme === "warm" ? "bg-[#FAF2DB]" : "bg-[#0B0F19]"}`}>
      <div className="container mx-auto max-w-4xl px-4 py-10 pb-28">

        {/* Navigation & Toolbar Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href={`/book/${book.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> {book.title}
          </Link>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs gap-1.5 px-3 py-1 bg-white/40 backdrop-blur-sm border-border/40">
              <Clock className="h-3.5 w-3.5 text-primary" /> {formatDuration(chapterDuration)}
            </Badge>

            {/* Reading preferences menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-3 h-9 text-xs md:text-sm font-semibold border border-border/40 bg-white/40 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-[#F1F5F9]/50 transition-all select-none">
                <Type className="h-4 w-4" />
                Appearance
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-3 rounded-xl border-border/50 bg-white/95 backdrop-blur-md shadow-premium">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted">Theme</DropdownMenuLabel>
                  <div className="grid grid-cols-3 gap-1.5 mt-2 mb-4">
                    {(["light", "warm", "dark"] as ReaderTheme[]).map((t) => (
                      <DropdownMenuItem
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`h-8 justify-center rounded-lg text-xs font-semibold border cursor-pointer ${
                          theme === t
                            ? "border-accent ring-2 ring-accent/25 bg-accent/5 font-bold"
                            : "border-border hover:bg-muted"
                        } ${t === "light" ? "bg-slate-50 text-dark" : t === "warm" ? "bg-[#FDF6E3] text-[#586E75]" : "bg-dark text-white"}`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted">Font Size</DropdownMenuLabel>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(["sm", "base", "lg", "xl", "2xl"] as FontSize[]).map((size) => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`flex-1 min-w-[32px] h-8 justify-center rounded-lg text-xs font-semibold border cursor-pointer ${
                          fontSize === size
                            ? "border-accent bg-accent/10 text-accent font-bold"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {size.toUpperCase()}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Chapter Title Panel */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-6 md:p-8 mb-8 transition-colors duration-300 shadow-premium ${themeClasses[theme]}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold text-accent uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-accent text-accent" /> Chapter {chapter.number}
              </span>
              <h1 className="text-3xl font-extrabold text-dark font-serif tracking-tight mt-1">{book.title}</h1>
              <p className="text-sm text-muted mt-1">Recorded by {book.narrator}</p>
            </div>
            <Button
              className="gap-2 bg-accent text-dark hover:bg-accent/90 font-bold px-6 h-11 rounded-xl shadow-md cursor-pointer shrink-0 disabled:opacity-50"
              onClick={handlePlayChapter}
              disabled={chapterDuration === 0}
            >
              <Play className="h-4 w-4 fill-current" />
              Play Chapter
            </Button>
          </div>
        </motion.div>

        {/* Verses Reading Pane */}
        <div className={`rounded-3xl border p-6 md:p-12 transition-colors duration-300 shadow-premium min-h-[500px] ${themeClasses[theme]}`}>
          <div ref={scrollContainerRef} className="space-y-4 max-w-2xl mx-auto">
            {chapter.verses.map((verse, i) => {
              const playing = isVersePlaying(verse)
              const active = activeVerse === verse.number
              const hasRecording = !!verse.recording

              return (
                <motion.div
                  key={verse.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.015 }}
                  id={`verse-${verse.number}`}
                  className="relative group scroll-m-24"
                >
                  <button
                    onClick={() => handlePlayVerse(verse)}
                    disabled={!hasRecording}
                    className={`w-full text-left transition-all duration-300 rounded-2xl p-4 md:p-5 border border-transparent ${
                      playing
                        ? "bg-accent/10 border-accent/30 shadow-glow-accent opacity-100 scale-[1.01]"
                        : active
                          ? "bg-primary/5 border-primary/20 opacity-100"
                          : hasRecording
                            ? "opacity-45 hover:opacity-85 hover:bg-black/5 cursor-pointer"
                            : "opacity-35 cursor-default"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Verse badge indicator */}
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 ${
                        playing
                          ? "bg-accent text-dark scale-110 shadow-md"
                          : active
                            ? "bg-primary text-white"
                            : "bg-muted/15 text-muted group-hover:bg-primary/10 group-hover:text-primary"
                      }`}>
                        {playing ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <Volume2 className="h-4.5 w-4.5" />
                          </motion.div>
                        ) : (
                          verse.number
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Scripture body text */}
                        <p className={`font-serif leading-relaxed text-dark ${fontClasses[fontSize]} ${
                          playing ? "font-semibold" : "font-normal"
                        }`}>
                          {verse.text}
                          {hasRecording && (
                            <span className="inline-flex items-center ml-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-3.5 w-3.5 text-muted/70 hover:text-primary" />
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
