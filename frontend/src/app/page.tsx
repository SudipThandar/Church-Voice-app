"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { BookOpen, Mic, Headphones, Globe, ArrowRight, BarChart3, Sparkles } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Professional Recording",
    description: "High-fidelity studio narration console with real-time waveform visualization, click-to-record controls, and chapter progress checks.",
  },
  {
    icon: Headphones,
    title: "Immersive Listening",
    description: "Spotify-style reader interface featuring fluid verse highlighting, auto-scroll focus, and high-fidelity narration playback.",
  },
  {
    icon: Globe,
    title: "Multi-Language Library",
    description: "Publish your narration works in any community language. Perfect for multi-cultural and missionary congregations.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Monitor listening duration, track completion statistics, and view popular scripture readings with dynamic dashboard widgets.",
  },
]

const stats = [
  { value: "12+", label: "Scripture Volumes" },
  { value: "1,840", label: "Active Observers" },
  { value: "9,250", label: "Hours Narration" },
  { value: "99.98%", label: "Platform Precision" },
]

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-dark via-[#111827] to-[#1E3A8A] text-white py-28 md:py-36 border-b border-primary/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,92,184,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent backdrop-blur-md shadow-glow-accent">
              <Sparkles className="h-4 w-4 fill-accent" />
              Empowering Faith Through Modern Audio Technology
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl font-serif leading-none">
              Bring Sacred Scripture
              <span className="mt-3 block text-accent font-serif bg-gradient-to-r from-accent to-[#E8C84A] bg-clip-text text-transparent">To Life Through Sound</span>
            </h1>
            
            <p className="mt-8 text-lg text-white/80 md:text-xl max-w-3xl mx-auto font-sans leading-relaxed">
              Record, refine, and broadcast studio-grade audio narration of scripture. 
              Equip your local parish and international missions with clean, high-fidelity audio scripture anywhere, anytime.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/library">
                <Button size="lg" className="bg-accent text-dark hover:bg-accent/90 font-bold px-10 h-13 text-base rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                  Explore Library
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/management">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/15 px-10 h-13 text-base rounded-xl backdrop-blur-sm bg-white/[0.07] transition-all duration-200 cursor-pointer">
                  Start Narrating
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">Work Flow</span>
          <h2 className="text-3xl font-bold text-dark font-serif mt-3 sm:text-4xl">Platform Architecture</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { step: "01", title: "Upload Manuscript", desc: "Drag & drop PDF or EPUB scriptures. Our system parses chapters and verses." },
            { step: "02", title: "Record Narration", desc: "Use the Recording Studio with live waveforms to capture verse-by-verse audio." },
            { step: "03", title: "Refine & Approve", desc: "Listen to instant audio previews, check completeness, and save versions." },
            { step: "04", title: "Listen Anywhere", desc: "Share audio with listeners. Let them read with active verse playback." },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative p-6 rounded-2xl border border-border/60 bg-white shadow-premium group hover:border-primary/20 transition-all duration-300"
            >
              <div className="text-4xl font-extrabold text-accent/20 font-serif mb-4">{item.step}</div>
              <h4 className="text-lg font-bold text-dark mb-2">{item.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-24 border-y border-border/40">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">Core Features</span>
            <h2 className="text-3xl font-bold text-dark font-serif mt-3 sm:text-4xl">Built for Professional Narration</h2>
            <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
              Everything needed to manage text transcription, voiceovers, and community audio experiences.
            </p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl border border-border/50 bg-white p-7 shadow-premium hover:shadow-glow-primary hover:-translate-y-1 transition-all duration-300 hover:border-primary/20"
              >
                <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-dark">{feature.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="relative overflow-hidden bg-dark py-20 border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06),transparent_60%)] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm"
              >
                <p className="text-4xl font-extrabold text-accent font-serif tracking-tight">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold text-white/60 tracking-wider uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark to-[#1E3A8A] p-12 text-center md:p-20 shadow-2xl border border-primary/20"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1),transparent_60%)] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white font-serif sm:text-5xl leading-tight">Begin Sharing Audio Scripture</h2>
            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              Equip your community with professional narration tools today.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="bg-accent text-dark hover:bg-accent/90 font-bold px-10 h-13 text-base rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
                  <Mic className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
              </Link>
              <Link href="/library">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/15 px-10 h-13 text-base rounded-xl backdrop-blur-sm bg-white/[0.07] transition-all duration-200 cursor-pointer">
                  Browse Audio Books
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-serif font-bold text-dark text-lg">Church Voice</span>
            </div>
            <p className="text-sm text-muted">© 2026 Church Voice Scripture Platform. Designed for modern church audio narration.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
