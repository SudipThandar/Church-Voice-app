"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Mic, Layers, Music, TrendingUp, Sparkles, BookCheck, Clock } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"
import { Progress } from "@/components/ui/progress"
import { getStoredBooks } from "@/lib/book-storage"
import { Book } from "@/lib/types"
import Link from "next/link"

export default function AdminDashboard() {
  const [books] = useState<Book[]>(() => getStoredBooks())

  const totalVerses = books.reduce((sum, b) => sum + b.totalVerses, 0)
  const totalChapters = books.reduce((sum, b) => sum + b.totalChapters, 0)
  const avgCompletion = books.length > 0 ? Math.round(books.reduce((sum, b) => sum + b.completion, 0) / books.length) : 0

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Executive Suite</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Admin Dashboard</h1>
        <p className="mt-2 text-muted text-lg">System-wide monitoring of transcription parsing and voice narration volumes.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={BookOpen} label="Total Books" value={books.length} color="primary" delay={0} />
        <StatsCard icon={Layers} label="Total Chapters" value={totalChapters} color="purple" delay={0.05} />
        <StatsCard icon={Music} label="Total Verses" value={totalVerses.toLocaleString()} color="accent" delay={0.1} />
        <StatsCard
          icon={Mic}
          label="Total Recordings"
          value={0}
          color="green"
          trend="+12%"
          delay={0.15}
        />
      </div>

      {/* Completion Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-10 rounded-3xl border border-border/40 bg-white p-6 md:p-8 shadow-premium"
      >
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-5">
          <div>
            <h2 className="text-xl font-bold text-dark font-serif flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" /> Recording Completion Blueprint
            </h2>
            <p className="text-sm text-muted mt-1">Completion ratios across library manuscripts.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-4 py-1.5 text-xs font-bold border border-accent/20">
            Average Progress: {avgCompletion}%
          </span>
        </div>

        <div className="space-y-6">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-lg bg-gradient-to-br ${book.coverColor} shadow-inner shrink-0`} />
                  <span className="text-base font-bold text-dark group-hover:text-primary transition-colors">{book.title}</span>
                  <span className="text-xs text-muted font-medium bg-muted/30 px-2 py-0.5 rounded-md">{book.language}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {Math.round(book.totalVerses * book.completion / 100).toLocaleString()} / {book.totalVerses.toLocaleString()} verses
                  </span>
                  <span className="font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-lg text-xs">{book.completion}%</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={book.completion} className="h-3 rounded-full" />
                {/* gold accent indicator at front of completion */}
                <div className="absolute top-0 bottom-0 h-full w-[2px] bg-accent" style={{ left: `calc(${book.completion}% - 2px)` }} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 grid gap-6 sm:grid-cols-3"
      >
        <Link href="/analytics" className="block">
          <div className="rounded-2xl border border-border/40 bg-white p-6 hover:border-primary/20 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 h-full">
            <TrendingUp className="h-9 w-9 text-primary mb-4" />
            <h3 className="font-bold text-dark text-lg font-serif">Active Observers</h3>
            <p className="text-3xl font-extrabold text-primary mt-2 font-sans">{totalChapters}</p>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2.5 py-0.5 rounded-full">+15% this session</p>
          </div>
        </Link>
        <Link href="/analytics" className="block">
          <div className="rounded-2xl border border-border/40 bg-white p-6 hover:border-accent/30 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 h-full">
            <Clock className="h-9 w-9 text-accent mb-4" />
            <h3 className="font-bold text-dark text-lg font-serif">Audio Run hours</h3>
            <p className="text-3xl font-extrabold text-accent mt-2 font-sans">{totalVerses.toLocaleString()}</p>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2.5 py-0.5 rounded-full">+22% this cycle</p>
          </div>
        </Link>
        <Link href="/management" className="block">
          <div className="rounded-2xl border border-border/40 bg-white p-6 hover:border-emerald-500/20 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 h-full">
            <BookCheck className="h-9 w-9 text-emerald-500 mb-4" />
            <h3 className="font-bold text-dark text-lg font-serif">Overall Completeness</h3>
            <p className="text-3xl font-extrabold text-emerald-500 mt-2 font-sans">{avgCompletion}%</p>
            <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2.5 py-0.5 rounded-full">+5% progress rate</p>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
