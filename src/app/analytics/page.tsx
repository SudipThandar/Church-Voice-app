"use client"

import { motion } from "framer-motion"
import { BookOpen, Headphones, Clock, Mic, TrendingUp, TrendingDown, Sparkles } from "lucide-react"
import { StatsCard } from "@/components/shared/stats-card"
import { analyticsData } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
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
        <StatsCard icon={Headphones} label="Active Listeners" value={analyticsData.activeListeners.toLocaleString()} color="primary" trend="+15%" delay={0} />
        <StatsCard icon={Clock} label="Listening Hours" value={analyticsData.listeningHours.toLocaleString()} color="accent" trend="+22%" delay={0.05} />
        <StatsCard icon={Mic} label="Total Recordings" value={analyticsData.totalRecordings.toLocaleString()} color="green" trend="+8%" delay={0.1} />
        <StatsCard icon={BookOpen} label="Recording Completion" value={`${analyticsData.recordingCompletion}%`} color="purple" trend="+5%" delay={0.15} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Monthly Growth Chart (Enhanced AreaChart with beautiful linear gradient) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="rounded-3xl border border-border/40 bg-white shadow-premium overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold text-dark font-serif flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-accent" /> Monthly Platform Growth
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={analyticsData.monthlyGrowth}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorList" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(226, 232, 240, 0.8)",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -10px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="recordings"
                    stroke="#1E3A8A"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRec)"
                    name="Recordings"
                  />
                  <Area
                    type="monotone"
                    dataKey="listeners"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorList)"
                    name="Listeners"
                  />
                </AreaChart>
              </ResponsiveContainer>
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
                <Sparkles className="h-4.5 w-4.5 text-accent" /> Audition Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={analyticsData.popularBooks} layout="vertical">
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

        {/* Completion Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="rounded-3xl border border-border/40 bg-white shadow-premium overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold text-dark font-serif">Scripture Completeness Index</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                {analyticsData.popularBooks.map((book, i) => {
                  const percent = 100 - i * 15
                  return (
                    <div key={book.title} className="group">
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

        {/* Engagement Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="rounded-3xl border border-border/40 bg-white shadow-premium overflow-hidden">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="text-lg font-bold text-dark font-serif">Interaction Matrix</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5 hover:bg-primary/8 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Avg. Session</span>
                  </div>
                  <p className="text-3xl font-extrabold text-dark font-sans leading-none mt-2">24m</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-full">+12% vs last month</p>
                </div>
                <div className="rounded-2xl bg-accent/5 border border-accent/10 p-5 hover:bg-accent/8 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Bounce Rate</span>
                  </div>
                  <p className="text-3xl font-extrabold text-dark font-sans leading-none mt-2">18%</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-full">-3% vs last month</p>
                </div>
                <div className="rounded-2xl bg-purple-500/5 border border-purple-500/10 p-5 hover:bg-purple-500/8 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Headphones className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Session Rate</span>
                  </div>
                  <p className="text-3xl font-extrabold text-dark font-sans leading-none mt-2">1.8K</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-full">+8% vs last month</p>
                </div>
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 hover:bg-emerald-500/8 transition-colors duration-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="h-4 w-4 text-emerald-600" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Narration / Wk</span>
                  </div>
                  <p className="text-3xl font-extrabold text-dark font-sans leading-none mt-2">97</p>
                  <p className="text-xs font-bold text-emerald-600 mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-full">+15% vs last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
