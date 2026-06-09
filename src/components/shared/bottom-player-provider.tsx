"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface TrackInfo {
  bookTitle: string
  chapterTitle: string
  verseNumber?: number
  verseText?: string
  duration: number
  type: "verse" | "chapter" | "book"
}

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  track: TrackInfo | null
}

interface BottomPlayerContextType {
  playerState: PlayerState
  play: (track: TrackInfo) => void
  pause: () => void
  resume: () => void
  stop: () => void
  seek: (time: number) => void
  progress: number
}

const BottomPlayerContext = createContext<BottomPlayerContextType | null>(null)

export function useBottomPlayer() {
  const ctx = useContext(BottomPlayerContext)
  if (!ctx) throw new Error("useBottomPlayer must be used within BottomPlayerProvider")
  return ctx
}

export function BottomPlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    track: null,
  })

  const play = useCallback((track: TrackInfo) => {
    setPlayerState({
      isPlaying: true,
      currentTime: 0,
      duration: track.duration,
      track,
    })
  }, [])

  const pause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }))
  }, [])

  const resume = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true }))
  }, [])

  const stop = useCallback(() => {
    setPlayerState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      track: null,
    })
  }, [])

  const seek = useCallback((time: number) => {
    setPlayerState((prev) => ({ ...prev, currentTime: time }))
  }, [])

  const progress = playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0

  return (
    <BottomPlayerContext.Provider value={{ playerState, play, pause, resume, stop, seek, progress }}>
      {children}
    </BottomPlayerContext.Provider>
  )
}
