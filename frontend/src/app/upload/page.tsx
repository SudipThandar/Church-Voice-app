"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Hash, List, Loader2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface ParsedVerse {
  number: number
  text: string
}

interface ParsedChapter {
  number: number
  title: string
  verses: ParsedVerse[]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parseScriptureText(raw: string): ParsedChapter[] {
  const chapters = new Map<number, ParsedVerse[]>()

  for (const line of raw.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^(\d+):(\d+)\s+(.+)$/)
    if (!match) continue
    const chapterNum = Number(match[1])
    const verseNum = Number(match[2])
    const text = match[3].trim()
    if (!chapters.has(chapterNum)) chapters.set(chapterNum, [])
    chapters.get(chapterNum)!.push({ number: verseNum, text })
  }

  return [...chapters.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, verses]) => ({
      number,
      title: `Chapter ${number}`,
      verses: [...verses].sort((a, b) => a.number - b.number),
    }))
}

export default function UploadPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [slugEdited, setSlugEdited] = useState(false)
  const [author, setAuthor] = useState("")
  const [narrator, setNarrator] = useState("")
  const [language, setLanguage] = useState("English (KJV)")
  const [description, setDescription] = useState("")
  const [scriptureText, setScriptureText] = useState("")
  const [createdBook, setCreatedBook] = useState<{ title: string; slug: string; chapters: number; verses: number } | null>(null)

  const parsedChapters = useMemo(() => parseScriptureText(scriptureText), [scriptureText])
  const totalVerses = useMemo(() => parsedChapters.reduce((sum, c) => sum + c.verses.length, 0), [parsedChapters])

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugEdited) setSlug(generateSlug(value))
  }

  const handleNext = () => {
    setError("")
    if (!title.trim()) {
      setError("Book title is required")
      return
    }
    if (!slug.trim()) {
      setError("URL slug is required")
      return
    }
    if (!narrator.trim()) {
      setError("Narrator name is required")
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    setError("")
    if (parsedChapters.length === 0) {
      setError("No chapters detected. Paste scripture text using the chapter:verse format below.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim(),
          title: title.trim(),
          author: author.trim(),
          narrator: narrator.trim(),
          language: language.trim(),
          description: description.trim(),
          chapters: parsedChapters,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to create book")
        setSubmitting(false)
        return
      }

      setCreatedBook({ title: title.trim(), slug: slug.trim(), chapters: parsedChapters.length, verses: totalVerses })
      setStep(3)
    } catch {
      setError("Failed to create book. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(1)
    setTitle("")
    setSlug("")
    setSlugEdited(false)
    setAuthor("")
    setNarrator("")
    setLanguage("English (KJV)")
    setDescription("")
    setScriptureText("")
    setCreatedBook(null)
    setError("")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Ingestion Hub</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Add Scripture</h1>
        <p className="mt-2 text-muted">Manually enter a new scripture book, then paste its chapters and verses.</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-10 text-xs font-bold text-muted uppercase tracking-wider">
        <span className={step === 1 ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>1. Book Details</span>
        <span className="text-muted">➔</span>
        <span className={step === 2 ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>2. Scripture Text</span>
        <span className="text-muted">➔</span>
        <span className={step === 3 ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>3. Ready</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-border/40 bg-white p-8 shadow-premium"
          >
            <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5 mb-5">
              <Sparkles className="h-4 w-4 text-accent fill-accent" /> Book Details
            </h4>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Book Title *</label>
                <Input
                  id="title"
                  placeholder="e.g. Gospel of John"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="h-11 rounded-xl border-border/80"
                />
              </div>

              <div>
                <label htmlFor="slug" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">URL Slug *</label>
                <Input
                  id="slug"
                  placeholder="e.g. john"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true)
                    setSlug(generateSlug(e.target.value))
                  }}
                  className="h-11 rounded-xl border-border/80 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Author</label>
                  <Input
                    id="author"
                    placeholder="e.g. John the Apostle"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="h-11 rounded-xl border-border/80"
                  />
                </div>
                <div>
                  <label htmlFor="narrator" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Narrator *</label>
                  <Input
                    id="narrator"
                    placeholder="e.g. John Doe"
                    value={narrator}
                    onChange={(e) => setNarrator(e.target.value)}
                    className="h-11 rounded-xl border-border/80"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="language" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Language / Translation</label>
                <Input
                  id="language"
                  placeholder="e.g. English (KJV)"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="h-11 rounded-xl border-border/80"
                />
              </div>

              <div>
                <label htmlFor="description" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea
                  id="description"
                  placeholder="Brief description of this scripture volume..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-xl border border-border/80 bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {error && (
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              size="lg"
              className="w-full mt-6 bg-accent text-dark hover:bg-accent/90 font-bold h-13 text-base rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
              onClick={handleNext}
            >
              <span className="flex items-center gap-2 justify-center">
                Next: Add Scripture Text
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-border/40 bg-white p-8 shadow-premium"
          >
            <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5 mb-3">
              <Sparkles className="h-4 w-4 text-accent fill-accent" /> Scripture Text
            </h4>
            <div className="mb-4 rounded-2xl bg-muted/30 border border-border/30 p-4 text-xs text-muted leading-relaxed">
              Paste the full text below, one verse per line, formatted as <code className="font-mono font-semibold text-dark">chapter:verse text</code>. For example:
              <pre className="mt-2 rounded-lg bg-white border border-border/40 p-3 font-mono text-[11px] text-dark overflow-x-auto">
{`1:1 In the beginning was the Word, and the Word was with God...
1:2 The same was in the beginning with God.
2:1 The third day, there was a wedding in Cana of Galilee...`}
              </pre>
            </div>

            <textarea
              value={scriptureText}
              onChange={(e) => setScriptureText(e.target.value)}
              placeholder="1:1 In the beginning..."
              className="flex min-h-[280px] w-full rounded-xl border border-border/80 bg-transparent px-3 py-2.5 text-sm font-mono outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />

            {parsedChapters.length > 0 && (
              <div className="mt-4 rounded-2xl bg-accent/5 border border-accent/20 p-5">
                <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5 mb-3">
                  <Sparkles className="h-4 w-4 text-accent fill-accent" /> Detected Structure
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="bg-white border-border/40 text-xs font-semibold px-3 py-1.5 gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    {parsedChapters.length} chapter{parsedChapters.length !== 1 ? "s" : ""} detected
                  </Badge>
                  <Badge variant="outline" className="bg-white border-border/40 text-xs font-semibold px-3 py-1.5 gap-1.5">
                    <List className="h-3.5 w-3.5 text-primary" />
                    {totalVerses} verse{totalVerses !== 1 ? "s" : ""} found
                  </Badge>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="h-13 px-6 font-bold rounded-xl border-border/80 hover:bg-muted/40 cursor-pointer"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="flex-1 bg-accent text-dark hover:bg-accent/90 font-bold h-13 text-base rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2.5 justify-center">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating book...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <ArrowRight className="h-5 w-5" />
                    Create Book
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && createdBook && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border/40 bg-white p-10 text-center shadow-premium"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-dark font-serif">Book Added!</h2>
            <p className="mt-3 text-muted leading-relaxed max-w-md mx-auto">
              <span className="font-serif font-bold text-dark">{createdBook.title}</span> has been added to your library with <strong>{createdBook.chapters}</strong> chapter{createdBook.chapters !== 1 ? "s" : ""} and <strong>{createdBook.verses}</strong> verses.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/management">
                <Button variant="default" className="bg-primary hover:bg-primary/95 text-white px-6 h-11 font-bold rounded-xl shadow-md cursor-pointer">
                  Manage Script
                </Button>
              </Link>
              <Link href={`/book/${createdBook.slug}`}>
                <Button variant="outline" className="border-border/80 hover:bg-muted/40 px-6 h-11 font-semibold rounded-xl cursor-pointer">
                  <BookOpen className="h-4 w-4" /> View Book
                </Button>
              </Link>
              <Button variant="ghost" className="px-6 h-11 font-semibold rounded-xl cursor-pointer" onClick={reset}>
                Add Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
