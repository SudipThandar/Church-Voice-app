"use client"

import { useBottomPlayer } from "./bottom-player-provider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipForward, SkipBack, Volume2, X, Music } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDuration } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { useEffect, useRef, useState } from "react"

const SPEEDS = [1, 1.5, 2, 2.5, 3, 4]

export function BottomPlayer() {
  const { playerState, pause, resume, stop, seek, next, previous, progress, speed, volume, setSpeed, setVolume } = useBottomPlayer()
  const { track, isPlaying, currentTime, duration, currentIndex } = playerState
  const [showVolume, setShowVolume] = useState(false)
  const [showSpeed, setShowSpeed] = useState(false)
  const volumeRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolume(false)
      }
      if (speedRef.current && !speedRef.current.contains(e.target as Node)) {
        setShowSpeed(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!track) return null

  const currentItem = track.items[currentIndex]
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < track.items.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-4xl z-50 rounded-2xl border border-border/50 bg-white/95 backdrop-blur-md shadow-premium border-t-2 border-t-accent/30"
      >
        {/* Top Slim Progress Bar — only on mobile; desktop uses the Slider below */}
        <div className="h-[3px] w-full bg-muted/20 relative cursor-pointer md:hidden" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const width = rect.width
          seek((clickX / width) * duration)
        }}>
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-4">
          {/* Left Track Info */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-md shadow-glow-primary text-white">
              <Music className="h-5 w-5 text-white/95" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent tracking-wide uppercase">
                {track.type}
              </span>
              <p className="truncate text-base font-semibold text-dark leading-tight mt-1">{track.chapterTitle}</p>
              <p className="truncate text-xs font-medium text-muted">
                {track.bookTitle}{currentItem?.verseNumber ? ` · Verse ${currentItem.verseNumber}` : ""}
              </p>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted hover:text-dark hover:bg-muted/50 transition-colors disabled:opacity-30"
              onClick={previous}
              disabled={!hasPrevious}
            >
              <SkipBack className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-11 w-11 rounded-full bg-accent hover:bg-accent/90 text-dark shadow-md hover:scale-105 transition-all duration-200"
              onClick={() => (isPlaying ? pause() : resume())}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted hover:text-dark hover:bg-muted/50 transition-colors disabled:opacity-30"
              onClick={next}
              disabled={!hasNext}
            >
              <SkipForward className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Right Progress Slider & Speed & Volume & Actions */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-sm justify-end">
            <div className="flex items-center gap-2 w-full">
              <span className="text-xs text-muted font-mono w-9 text-right tabular-nums">
                {formatDuration(Math.floor(currentTime))}
              </span>
              <Slider
                value={[progress * 100]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v
                  seek((val / 100) * duration)
                }}
                className="flex-1 cursor-pointer"
                max={100}
                step={0.1}
              />
              <span className="text-xs text-muted font-mono w-9 tabular-nums">{formatDuration(Math.floor(duration))}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0 border-l border-border/60 pl-3">
              {/* Speed Control */}
              <div className="relative" ref={speedRef}>
                <button
                  onClick={() => setShowSpeed(!showSpeed)}
                  className="h-7 px-2 rounded text-[11px] font-semibold text-muted hover:text-accent hover:bg-accent/10 tracking-wide cursor-pointer"
                  title="Playback speed"
                >
                  {speed}x
                </button>
                {showSpeed && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 py-1.5 rounded-xl bg-white border border-border/50 shadow-premium min-w-[100px]">
                    <div className="px-3 pb-1 text-[10px] font-semibold text-muted tracking-wide uppercase">Speed</div>
                    {SPEEDS.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSpeed(s); setShowSpeed(false) }}
                        className={`w-full px-3 py-1 text-left text-xs font-medium hover:bg-accent/10 transition-colors cursor-pointer ${s === speed ? "text-accent font-bold" : "text-dark"}`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Volume Control */}
              <div className="relative" ref={volumeRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-muted hover:text-dark hover:bg-muted/50 cursor-pointer"
                  onClick={() => setShowVolume(!showVolume)}
                >
                  <Volume2 className="h-4.5 w-4.5" />
                </Button>
                {showVolume && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-xl bg-white border border-border/50 shadow-premium flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted shrink-0" />
                    <Slider
                      value={[volume]}
                      onValueChange={(v) => setVolume(Array.isArray(v) ? v[0] : v)}
                      className="w-24 cursor-pointer"
                      max={100}
                      step={1}
                    />
                  </div>
                )}
              </div>

              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted hover:text-red-500 hover:bg-red-50 cursor-pointer" onClick={stop}>
                <X className="h-4.5 w-4.5" />
              </Button>
            </div>
          </div>

          {/* Mobile Right Controls Close Button */}
          <div className="flex md:hidden items-center shrink-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted hover:text-red-500 hover:bg-red-50" onClick={stop}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
