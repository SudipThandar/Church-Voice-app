"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen, Mic, Play, Sparkles, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getStoredBooks } from "@/lib/book-storage"
import { Book } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function ManagementPage() {
  const [books] = useState<Book[]>(() => getStoredBooks())
  const [selectedBook, setSelectedBook] = useState<Book | null>(() => {
    const stored = getStoredBooks()
    return stored.length > 0 ? stored[0] : null
  })

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Orchestration</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Scripture Management</h1>
        <p className="mt-2 text-muted text-lg">Track, assign, and record scripture chapters for narration.</p>
      </motion.div>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted bg-white border border-border/40 rounded-3xl p-10 max-w-md mx-auto mt-10 shadow-premium">
          <LayoutGrid className="h-16 w-16 mb-4 text-muted/30" />
          <p className="text-xl font-bold text-dark font-serif">No Scripture Books</p>
          <p className="text-sm mt-1 text-center">Your library is empty. Upload a manuscript to start managing chapters.</p>
          <Link href="/upload">
            <Button className="mt-6 bg-accent text-dark hover:bg-accent/90 font-bold px-6 rounded-xl cursor-pointer">
              Upload Scripture
            </Button>
          </Link>
        </div>
      ) : selectedBook && (
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Book List Selection Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl border border-border/40 bg-white p-5 shadow-premium">
              <h2 className="mb-4 text-xs font-bold text-muted uppercase tracking-widest border-b border-border/20 pb-2 flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-primary" /> Scripture Books
              </h2>
              <ScrollArea className="h-[580px] pr-2">
                <div className="space-y-1.5">
                  {books.map((book) => {
                    const active = selectedBook.id === book.id
                    return (
                      <button
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border",
                          active
                            ? "bg-primary border-primary text-white shadow-glow-primary scale-[1.01]"
                            : "hover:bg-muted/40 border-transparent text-dark hover:border-border/30"
                        )}
                      >
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform duration-200",
                          active ? "bg-white/20 text-white" : `bg-gradient-to-br ${book.coverColor} text-white`
                        )}>
                          <BookOpen className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate leading-tight">{book.title}</p>
                          <p className={cn("text-xs font-medium mt-1 font-mono", active ? "text-white/70" : "text-muted")}>
                            {book.completion}% complete
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </motion.div>

          {/* Chapter & Verse List Detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl border border-border/40 bg-white p-6 md:p-8 shadow-premium">
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-dark font-serif flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" /> {selectedBook.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs bg-slate-50 border-border/40 font-semibold px-2.5 py-0.75 rounded-lg">
                      {selectedBook.totalChapters} chapters
                    </Badge>
                    <Badge variant="outline" className="text-xs bg-slate-50 border-border/40 font-semibold px-2.5 py-0.75 rounded-lg">
                      {selectedBook.totalVerses} verses
                    </Badge>
                    <Badge variant="outline" className={cn(
                      "text-xs font-bold px-2.5 py-0.75 rounded-lg border",
                      selectedBook.completion >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      selectedBook.completion >= 40 ? "bg-accent/10 text-accent border-accent/20" : "bg-slate-50 border-border/40 text-muted"
                    )}>
                      Progress: {selectedBook.completion}%
                    </Badge>
                  </div>
                </div>
                <Link href={`/book/${selectedBook.id}`}>
                  <Button size="sm" className="gap-2 bg-primary hover:bg-primary/95 text-white font-bold h-10 px-5 rounded-xl cursor-pointer">
                    <Play className="h-4 w-4 fill-current" /> Playback Overview
                  </Button>
                </Link>
              </div>

              <ScrollArea className="h-[550px] pr-2">
                <div className="space-y-4">
                  {selectedBook.chapters.map((chapter, ci) => {
                    const chapterCompletion = 0

                    return (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ci * 0.02 }}
                        className="rounded-xl border border-border/40 p-5 hover:border-primary/20 transition-all duration-200 bg-white"
                      >
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                              {chapter.number}
                            </div>
                            <div>
                              <p className="font-bold text-dark text-base">
                                {chapter.title}
                                <span className="ml-2.5 text-xs text-muted font-semibold bg-muted/40 px-2 py-0.5 rounded-lg">
                                  {chapter.verses.length} verses
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-border/30">{chapterCompletion}% Done</span>
                            <Link href={`/recording/${selectedBook.id}/${chapter.number}`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary hover:text-primary hover:bg-primary/10 cursor-pointer">
                                <Mic className="h-4.5 w-4.5" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                        <Progress value={chapterCompletion} className="h-2 rounded-full mb-3" />

                        <div className="flex flex-wrap gap-1 border-t border-border/20 pt-3">
                          {chapter.verses.slice(0, 24).map((verse) => (
                            <div
                              key={verse.id}
                              className="h-2 w-2 rounded-full bg-muted/30"
                              title={`Verse ${verse.number}: Pending`}
                            />
                          ))}
                          {chapter.verses.length > 24 && (
                            <span className="text-[10px] font-bold text-muted ml-2">+{chapter.verses.length - 24} verses</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
