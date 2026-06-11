"use client"

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react"
import type { PlaylistItem, TrackInfo } from "@/lib/types"

export type { PlaylistItem, TrackInfo }

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  track: TrackInfo | null
  currentIndex: number
}

interface BottomPlayerContextType {
  playerState: PlayerState
  play: (track: TrackInfo) => void
  pause: () => void
  resume: () => void
  stop: () => void
  seek: (time: number) => void
  next: () => void
  previous: () => void
  progress: number
  speed: number
  volume: number
  setSpeed: (speed: number) => void
  setVolume: (volume: number) => void
}

const BottomPlayerContext = createContext<BottomPlayerContextType | null>(null)

export function useBottomPlayer() {
  const ctx = useContext(BottomPlayerContext)
  if (!ctx) throw new Error("useBottomPlayer must be used within BottomPlayerProvider")
  return ctx
}

const initialState: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  track: null,
  currentIndex: 0,
}

export function BottomPlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<PlayerState>(initialState)
  const [speed, setSpeed] = useState(1)
  const [volume, setVolume] = useState(80)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trackRef = useRef<TrackInfo | null>(null)
  const indexRef = useRef(0)
  const speedRef = useRef(speed)
  const volumeRef = useRef(volume)

  const loadAndPlay = useCallback((item: PlaylistItem) => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = item.audioUrl
    audio.playbackRate = speedRef.current
    audio.volume = volumeRef.current / 100
    audio.currentTime = 0
    audio.play().catch(() => {})
  }, [])

  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio

    const onTimeUpdate = () => setPlayerState((prev) => ({ ...prev, currentTime: audio.currentTime }))
    const onLoadedMetadata = () => {
      if (Number.isFinite(audio.duration)) {
        setPlayerState((prev) => ({ ...prev, duration: audio.duration }))
        return
      }
      // Chrome reports Infinity for MediaRecorder-produced webm files,
      // which lack a duration in their header. Seeking past the end
      // forces the browser to compute the real duration.
      const onSeeked = () => {
        audio.removeEventListener("seeked", onSeeked)
        setPlayerState((prev) => ({ ...prev, duration: Number.isFinite(audio.duration) ? audio.duration : 0 }))
        audio.currentTime = 0
      }
      audio.addEventListener("seeked", onSeeked)
      audio.currentTime = 1e101
    }
    const onPlay = () => setPlayerState((prev) => ({ ...prev, isPlaying: true }))
    const onPause = () => setPlayerState((prev) => ({ ...prev, isPlaying: false }))
    const onEnded = () => {
      const track = trackRef.current
      if (track && indexRef.current < track.items.length - 1) {
        indexRef.current += 1
        loadAndPlay(track.items[indexRef.current])
        setPlayerState((prev) => ({ ...prev, currentIndex: indexRef.current, currentTime: 0 }))
      } else {
        setPlayerState((prev) => ({ ...prev, isPlaying: false }))
      }
    }

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("loadedmetadata", onLoadedMetadata)
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("ended", onEnded)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("loadedmetadata", onLoadedMetadata)
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("ended", onEnded)
      audio.pause()
    }
  }, [loadAndPlay])

  useEffect(() => {
    speedRef.current = speed
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  useEffect(() => {
    volumeRef.current = volume
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  const play = useCallback(
    (track: TrackInfo) => {
      const playable = track.items.filter((i) => !!i.audioUrl)
      if (playable.length === 0) return
      const finalTrack = { ...track, items: playable }
      trackRef.current = finalTrack
      indexRef.current = 0
      setPlayerState({ isPlaying: true, currentTime: 0, duration: 0, track: finalTrack, currentIndex: 0 })
      loadAndPlay(playable[0])
    },
    [loadAndPlay]
  )

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.ended || audio.currentTime >= (audio.duration || Infinity)) {
      audio.currentTime = 0
    }
    audio.play().catch(() => {})
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
    }
    trackRef.current = null
    indexRef.current = 0
    setPlayerState(initialState)
  }, [])

  const seek = useCallback((time: number) => {
    if (!Number.isFinite(time) || time < 0) return
    const audio = audioRef.current
    if (audio) audio.currentTime = time
    setPlayerState((prev) => ({ ...prev, currentTime: time }))
  }, [])

  const next = useCallback(() => {
    const track = trackRef.current
    if (!track || indexRef.current >= track.items.length - 1) return
    indexRef.current += 1
    loadAndPlay(track.items[indexRef.current])
    setPlayerState((prev) => ({ ...prev, currentIndex: indexRef.current, currentTime: 0 }))
  }, [loadAndPlay])

  const previous = useCallback(() => {
    const track = trackRef.current
    if (!track || indexRef.current <= 0) return
    indexRef.current -= 1
    loadAndPlay(track.items[indexRef.current])
    setPlayerState((prev) => ({ ...prev, currentIndex: indexRef.current, currentTime: 0 }))
  }, [loadAndPlay])

  const progress = playerState.duration > 0 ? playerState.currentTime / playerState.duration : 0

  return (
    <BottomPlayerContext.Provider
      value={{ playerState, play, pause, resume, stop, seek, next, previous, progress, speed, volume, setSpeed, setVolume }}
    >
      {children}
    </BottomPlayerContext.Provider>
  )
}
