"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BookOpen, Headphones, Layers, Mic, Sparkles } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"
import { getStoredBooks } from "@/lib/book-storage"
import { Book } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  const [books] = useState<Book[]>(() => getStoredBooks())

  const totalVerses = books.reduce((sum, b) => sum + b.totalVerses, 0)
  const totalChapters = books.reduce((sum, b) => sum + b.totalChapters, 0)
  const avgCompletion = books.length > 0 ? Math.round(books.reduce((sum, b) => sum + b.completion, 0) / books.length) : 0

  const popularBooks = books.map((b) => ({
    title: b.title,
    listens: Math.round(b.totalVerses * (100 - b.completion) / 10 + 100),
  }))

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Telemetry</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Platform Analytics</h1>
        <p className="mt-2 text-muted text-lg">Detailed run analysis tracking engagement rates, listener indexes, and narration growth.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={BookOpen} label="Total Books" value={books.length} color="primary" delay={0} />
        <StatsCard icon={Layers} label="Total Chapters" value={totalChapters} color="accent" delay={0.05} />
        <StatsCard icon={Mic} label="Total Verses" value={totalVerses.toLocaleString()} color="green" delay={0.1} />
        <StatsCard icon={Headphones} label="Avg Completion" value={`${avgCompletion}%`} color="purple" trend="0%" delay={0.15} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Completion Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-3xl border border-border/40 bg-white shadow-premium overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold text-dark font-serif flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-accent" /> Book Completion Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {books.length === 0 && (
                  <p className="text-sm text-muted text-center py-8">No books in library yet.</p>
                )}
                {books.map((book, i) => {
                  const percent = book.completion
                  return (
                    <div key={book.id} className="group">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="font-bold text-dark group-hover:text-primary transition-colors">{book.title}</span>
                        <span className="text-xs font-mono font-bold text-slate-550">{percent}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                          className={`h-full rounded-full ${
                            percent > 70 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : percent > 40 ? "bg-gradient-to-r from-accent to-accent-light" : "bg-gradient-to-r from-primary to-primary-light"
                          }`}
                        />
                        <div className="absolute top-0 bottom-0 h-full w-[1.5px] bg-white" style={{ left: `calc(${percent}% - 1.5px)` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Popular Books Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="rounded-3xl border border-border/40 bg-white shadow-premium overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold text-dark font-serif flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-accent" /> Library Volumes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={popularBooks} layout="vertical">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1E3A8A" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3B5CB8" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    stroke="#94A3B8"
                    fontSize={11}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -10px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Bar
                    dataKey="listens"
                    fill="url(#barGrad)"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                    label={{
                      position: "right",
                      fill: "#64748B",
                      fontSize: 10,
                      fontWeight: "bold",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
