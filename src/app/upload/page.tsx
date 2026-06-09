"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, CheckCircle, BookOpen, Layers, Globe, ArrowRight, X, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadResult } from "@/lib/mock-data"

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState(false)
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && (dropped.name.endsWith(".pdf") || dropped.name.endsWith(".epub"))) {
      setFile(dropped)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleImport = () => {
    setImporting(true)
    setTimeout(() => {
      setImporting(false)
      setImported(true)
    }, 2000)
  }

  const reset = () => {
    setFile(null)
    setImported(false)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Ingestion Hub</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Upload Scripture</h1>
        <p className="mt-2 text-muted">Import a manuscript PDF or EPUB file to begin audio narration recording.</p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between max-w-sm mx-auto mb-10 text-xs font-bold text-muted uppercase tracking-wider">
        <span className={!file && !imported ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>1. Upload File</span>
        <span className="text-muted">➔</span>
        <span className={file && !imported ? "text-primary border-b-2 border-accent pb-1" : "text-muted"}>2. Parse Metadata</span>
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

      {/* File Selected - Show Details */}
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

            <div className="mb-6 space-y-4 rounded-2xl bg-muted/40 p-6 border border-border/20">
              <h4 className="font-bold text-sm uppercase tracking-wider text-dark flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-accent fill-accent" /> Analyzer Diagnostics
              </h4>
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm border-b border-border/20 pb-2.5">
                  <span className="text-muted">Parsed Book:</span>
                  <span className="font-bold text-dark font-serif">{uploadResult.title}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-border/20 pb-2.5">
                  <span className="text-muted">Detected Chapters:</span>
                  <span className="font-semibold text-dark font-mono bg-white px-2 py-0.5 rounded border border-border/40 text-xs">{uploadResult.detectedChapters}</span>
                </div>
                <div className="flex items-center justify-between text-sm border-b border-border/20 pb-2.5">
                  <span className="text-muted">Detected Verses:</span>
                  <span className="font-semibold text-dark font-mono bg-white px-2 py-0.5 rounded border border-border/40 text-xs">{uploadResult.detectedVerses.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Identified Language:</span>
                  <span className="font-semibold text-dark flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-primary" /> {uploadResult.language}
                  </span>
                </div>
              </div>
            </div>

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
                  Parsing structure...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  <ArrowRight className="h-5 w-5" />
                  Import Scripture
                </span>
              )}
            </Button>
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
            <h2 className="text-2xl font-bold text-dark font-serif">Structure Imported!</h2>
            <p className="mt-3 text-muted leading-relaxed max-w-md mx-auto">
              <span className="font-serif font-bold text-dark">{uploadResult.title}</span> has been compiled into the script manager with {uploadResult.detectedChapters} chapters and {uploadResult.detectedVerses.toLocaleString()} verses.
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
