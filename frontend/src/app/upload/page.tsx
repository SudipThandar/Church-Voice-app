"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle, ArrowRight, X, Sparkles, AlertCircle, Hash, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { addBook, parseFileName } from "@/lib/book-storage"
import { parseFile, ParsedChapter } from "@/lib/file-parser"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
  const [bookTitle, setBookTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [narrator, setNarrator] = useState("")
  const [language, setLanguage] = useState("English (KJV)")
  const [description, setDescription] = useState("")
  const [parsedChapters, setParsedChapters] = useState<ParsedChapter[]>([])
  const [totalDetectedVerses, setTotalDetectedVerses] = useState(0)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else {
      setIsDragging(false)
    }
  }, [])

  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile)
    setParsing(true)
    setError("")

    const parsed = parseFileName(selectedFile.name)
    setBookTitle(parsed.title)
    if (parsed.author) setAuthor(parsed.author)

    try {
      const result = await parseFile(selectedFile)
      setBookTitle(result.title || parsed.title)
      setParsedChapters(result.chapters)
      setTotalDetectedVerses(result.totalVerses)
    } catch (e) {
      console.error("Parse failed:", e)
      setError("Could not parse file content. You can enter details manually.")
    } finally {
      setParsing(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.name.endsWith(".pdf") || dropped.name.endsWith(".epub"))) {
      processFile(dropped)
    }
  }, [processFile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) processFile(selected)
  }

  const chaptersToVerses = (parsedChapters: ParsedChapter[]) => {
    if (parsedChapters.length > 0) {
      return parsedChapters.map((pc) => ({
        id: `${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${pc.number}`,
        number: pc.number,
        title: `Chapter ${pc.number}`,
        verses: pc.verses.map((pv) => ({
          id: `${bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${pc.number}-${pv.number}`,
          number: pv.number,
          text: pv.text,
          duration: Math.max(8, Math.round(pv.text.length / 5)),
        })),
        duration: pc.verses.reduce((sum, v) => sum + Math.max(8, Math.round(v.text.length / 5)), 0),
      }))
    }
    return []
  }

  const handleImport = () => {
    if (!bookTitle.trim()) {
      setError("Book title is required")
      return
    }
    if (!narrator.trim()) {
      setError("Narrator name is required")
      return
    }
    setError("")
    setImporting(true)

    const chapters = chaptersToVerses(parsedChapters)

    addBook({
      title: bookTitle.trim(),
      author: author.trim() || "Unknown",
      description: description.trim() || `${bookTitle.trim()} - A scripture recording project.`,
      language,
      narrator: narrator.trim(),
      chapters,
    })

    setTimeout(() => {
      setImporting(false)
      setImported(true)
    }, 500)
  }

  const reset = () => {
    setFile(null)
    setParsing(false)
    setImported(false)
    setBookTitle("")
    setAuthor("")
    setNarrator("")
    setDescription("")
    setParsedChapters([])
    setTotalDetectedVerses(0)
    setError("")
  }

  const chapterCount = parsedChapters.length || 1
  const verseCount = totalDetectedVerses || 0

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Ingestion Hub</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Upload Scripture</h1>
        <p className="mt-2 text-muted">Import a manuscript PDF or EPUB file. Chapters and verses are detected automatically.</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-10 text-xs font-bold text-muted uppercase tracking-wider">
        <span className={!file && !imported ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>1. Upload File</span>
        <span className="text-muted">➔</span>
        <span className={file && !imported && !parsing ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>2. Verify Details</span>
        <span className="text-muted">➔</span>
        <span className={imported ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>3. Ready</span>
      </div>

      {!file && !imported && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-16 text-center transition-all duration-300 shadow-premium ${
            isDragging
              ? "border-accent bg-accent/5 shadow-glow-accent"
              : "border-border/85 bg-white hover:border-primary/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.epub"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-5">
            <div className={`rounded-2xl p-4 shadow-sm transition-colors duration-300 ${isDragging ? "bg-accent/20 text-accent" : "bg-primary/10 text-primary"}`}>
              <Upload className="h-10 w-10" />
            </div>
            <div>
              <p className="text-xl font-bold text-dark">
                {isDragging ? "Drop your file here" : "Drag & drop your manuscript"}
              </p>
              <p className="mt-1.5 text-sm text-muted">Supports standardized .PDF and .EPUB formats</p>
            </div>
            <Button
              variant="outline"
              className="mt-3 px-6 h-11 font-bold rounded-xl border-border/80 hover:bg-muted/40 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </Button>
          </div>
        </motion.div>
      )}

      {/* File Selected - Show Parsing or Metadata Form */}
      <AnimatePresence>
        {file && !imported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="rounded-3xl border border-border/40 bg-white p-8 shadow-premium"
          >
            <div className="mb-6 flex items-start justify-between border-b border-border/20 pb-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3.5 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-dark text-lg leading-tight">{file.name}</h3>
                  <p className="text-xs font-semibold text-muted mt-1 uppercase tracking-wider font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors" onClick={reset}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Parsing indicator */}
            {parsing && (
              <div className="flex flex-col items-center justify-center py-12">
                <svg className="animate-spin h-10 w-10 text-primary mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-lg font-bold text-dark">Parsing file structure...</p>
                <p className="text-sm text-muted mt-1">Extracting chapters and verses from the manuscript.</p>
              </div>
            )}

            {/* Detected structure info */}
            {!parsing && parsedChapters.length > 0 && (
              <div className="mb-6 rounded-2xl bg-accent/5 border border-accent/20 p-5">
                <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5 mb-3">
                  <Sparkles className="h-4 w-4 text-accent fill-accent" /> File Analysis Complete
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="bg-white border-border/40 text-xs font-semibold px-3 py-1.5 gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                    {parsedChapters.length} chapters detected
                  </Badge>
                  <Badge variant="outline" className="bg-white border-border/40 text-xs font-semibold px-3 py-1.5 gap-1.5">
                    <List className="h-3.5 w-3.5 text-primary" />
                    {totalDetectedVerses} verses found
                  </Badge>
                </div>
              </div>
            )}

            {!parsing && (
              <div className="mb-6 space-y-5">
                <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-accent fill-accent" /> Book Details
                </h4>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Book Title *</label>
                    <Input
                      id="title"
                      placeholder="e.g. Gospel of John"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="h-11 rounded-xl border-border/80"
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
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!parsing && (
              <Button
                size="lg"
                className="w-full bg-accent text-dark hover:bg-accent/90 font-bold h-13 text-base rounded-xl shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
                onClick={handleImport}
                disabled={importing}
              >
                {importing ? (
                  <span className="flex items-center gap-2.5 justify-center">
                    <svg className="animate-spin h-5 w-5 text-dark" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving to library...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <ArrowRight className="h-5 w-5" />
                    Add to Library
                  </span>
                )}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Success */}
      <AnimatePresence>
        {imported && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-border/40 bg-white p-10 text-center shadow-premium"
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-bold text-dark font-serif">Book Added!</h2>
            <p className="mt-3 text-muted leading-relaxed max-w-md mx-auto">
              <span className="font-serif font-bold text-dark">{bookTitle}</span> has been added to your library with <strong>{chapterCount}</strong> chapter{chapterCount !== 1 ? "s" : ""}{verseCount > 0 ? <> and <strong>{verseCount}</strong> verses</> : ""}.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/management">
                <Button variant="default" className="bg-primary hover:bg-primary/95 text-white px-6 h-11 font-bold rounded-xl shadow-md cursor-pointer">
                  Manage Script
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="outline" className="border-border/80 hover:bg-muted/40 px-6 h-11 font-semibold rounded-xl cursor-pointer">View Library</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}