"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mic, Square, Pause, Play, Save, RotateCcw, CheckCircle, ArrowLeft, BookOpen, Volume2, HardDrive, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchChapterDetail, getRecordingPublicUrl } from "@/lib/queries"
import type { LibraryBook, ChapterDetail } from "@/lib/types"
import { formatDuration } from "@/lib/utils"
import { Waveform } from "@/components/shared/waveform"
import { cn } from "@/lib/utils"
import { useBottomPlayer } from "@/components/shared/bottom-player-provider"

type RecorderState = "idle" | "recording" | "paused" | "preview"

export default function RecordingStudioPage() {
  const params = useParams()
  const bookSlug = params.bookId as string
  const chapterNumber = Number(params.chapterId)

  const [book, setBook] = useState<LibraryBook | null>(null)
  const [chapter, setChapter] = useState<ChapterDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const [currentVerseIndex, setCurrentVerseIndex] = useState(0)
  const [recorderState, setRecorderState] = useState<RecorderState>("idle")
  const [timer, setTimer] = useState(0)
  const [saving, setSaving] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [freshBlob, setFreshBlob] = useState<Blob | null>(null)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const { speed } = useBottomPlayer()

  useEffect(() => {
    let cancelled = false
    fetchChapterDetail(bookSlug, chapterNumber)
      .then((data) => {
        if (cancelled) return
        setBook(data?.book ?? null)
        setChapter(data?.chapter ?? null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bookSlug, chapterNumber])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  useEffect(() => {
    if (recorderState === "recording") {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [recorderState])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
            ? "audio/ogg;codecs=opus"
            : ""

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType })
        audioChunksRef.current = []
        setFreshBlob(blob)
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setRecorderState("recording")
      setTimer(0)
    } catch (err) {
      console.error("Microphone access denied or unavailable", err)
    }
  }, [])

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
    }
    setRecorderState("paused")
  }, [])

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
    }
    setRecorderState("recording")
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setRecorderState("preview")
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const discardRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }
    setIsPreviewPlaying(false)
    setFreshBlob(null)
    setRecorderState("idle")
    setTimer(0)
  }, [])

  const togglePreview = useCallback(() => {
    if (isPreviewPlaying) {
      audioRef.current?.pause()
      setIsPreviewPlaying(false)
      return
    }

    if (!chapter) return
    const verse = chapter.verses[currentVerseIndex]

    let url: string | null = null
    let isObjectUrl = false
    if (freshBlob) {
      url = URL.createObjectURL(freshBlob)
      isObjectUrl = true
    } else if (verse.recording) {
      url = verse.recording.audioUrl
    }
    if (!url) return

    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    audioRef.current.src = url
    audioRef.current.playbackRate = speed

    const cleanup = () => {
      setIsPreviewPlaying(false)
      if (isObjectUrl && url) URL.revokeObjectURL(url)
    }
    audioRef.current.onended = cleanup
    audioRef.current.onpause = cleanup
    audioRef.current.play().catch(() => {
      console.error("Audio playback blocked by browser")
    })
    setIsPreviewPlaying(true)
  }, [chapter, currentVerseIndex, freshBlob, isPreviewPlaying, speed])

  const saveRecording = useCallback(async () => {
    if (!chapter || !book || !freshBlob) return
    const verse = chapter.verses[currentVerseIndex]

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("audio", freshBlob, `verse-${verse.number}.webm`)
      formData.append("verseId", verse.id)
      formData.append("bookSlug", book.slug)
      formData.append("chapterNumber", String(chapter.number))
      formData.append("verseNumber", String(verse.number))
      formData.append("durationSeconds", String(timer))

      const res = await fetch("/api/admin/recordings", { method: "POST", body: formData })
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
      const data = await res.json()

      setChapter((prev) => {
        if (!prev) return prev
        const verses = [...prev.verses]
        verses[currentVerseIndex] = {
          ...verses[currentVerseIndex],
          recording: {
            audioUrl: getRecordingPublicUrl(data.recording.storage_path),
            durationSeconds: data.recording.duration_seconds,
          },
        }
        return { ...prev, verses }
      })

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      setIsPreviewPlaying(false)
      setFreshBlob(null)
      setRecorderState("idle")
      setTimer(0)
    } catch (err) {
      console.error("Failed to save recording", err)
    } finally {
      setSaving(false)
    }
  }, [chapter, book, currentVerseIndex, freshBlob, timer])

  const deleteRecording = useCallback(async () => {
    if (!chapter) return
    const verse = chapter.verses[currentVerseIndex]
    if (!verse.recording) return

    try {
      await fetch("/api/admin/recordings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseId: verse.id }),
      })
    } catch (err) {
      console.error("Failed to delete recording", err)
    }

    setChapter((prev) => {
      if (!prev) return prev
      const verses = [...prev.verses]
      verses[currentVerseIndex] = { ...verses[currentVerseIndex], recording: null }
      return { ...prev, verses }
    })
  }, [chapter, currentVerseIndex])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <Loader2 className="h-10 w-10 mb-4 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading chapter...</p>
      </div>
    )
  }

  if (!book || !chapter) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-muted">
        <p className="text-xl font-medium">Chapter not found</p>
        <Link href="/management" className="mt-4 text-primary hover:underline">Back to Management</Link>
      </div>
    )
  }

  const currentVerse = chapter.verses[currentVerseIndex]
  const totalVerses = chapter.verses.length
  const recordedCount = chapter.verses.filter((v) => !!v.recording).length
  const completionPercent = totalVerses > 0 ? Math.round((recordedCount / totalVerses) * 100) : 0

  const goToNextVerse = () => {
    if (currentVerseIndex < totalVerses - 1) {
      setCurrentVerseIndex((i) => i + 1)
    }
  }

  const goToVerse = (index: number) => {
    if (chapter.verses[index].recording || index === currentVerseIndex) {
      setCurrentVerseIndex(index)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0B0F19] text-[#F8FAFC] py-10">
      <div className="container mx-auto max-w-7xl px-4">

        {/* Studio Title Bar */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href={`/management`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-accent tracking-widest uppercase bg-accent/10 px-2 py-0.5 rounded-md">Recording Deck</span>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold font-serif mt-1">Scripture Studio</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-slate-900/60 border-slate-800 text-slate-300 gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-accent" /> {book.title}
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-900/60 border-slate-800 text-slate-300">
              Chapter {chapter.number}
            </Badge>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">

          {/* Left Panel: Verses index */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="rounded-2xl border border-slate-800 bg-[#0E1524] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-sm tracking-wider text-slate-300 uppercase">Verse Timeline</h3>
                <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">{recordedCount}/{totalVerses}</span>
              </div>
              <div className="flex items-center gap-2 mb-5">
                <Progress value={completionPercent} indicatorClassName="bg-accent" trackClassName="bg-slate-800" className="flex-1" />
                <span className="text-xs font-mono text-slate-400">{completionPercent}%</span>
              </div>

              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-1.5">
                  {chapter.verses.map((verse, i) => {
                    const isCurrent = i === currentVerseIndex
                    const isRecorded = !!verse.recording
                    return (
                      <button
                        key={verse.id}
                        onClick={() => goToVerse(i)}
                        disabled={!isRecorded && !isCurrent}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all border",
                          isCurrent
                            ? "bg-primary border-accent text-white shadow-glow-primary scale-[1.01]"
                            : isRecorded
                              ? "bg-emerald-950/20 border-emerald-900/30 text-emerald-400 hover:bg-emerald-950/45"
                              : "bg-slate-900/40 border-transparent text-slate-450 hover:bg-slate-900/80 cursor-not-allowed"
                        )}
                      >
                        <div className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all",
                          isCurrent ? "bg-white/20 text-white" :
                          isRecorded ? "bg-emerald-900/50 text-emerald-350" :
                          "bg-slate-800 text-slate-400"
                        )}>
                          {isRecorded ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : verse.number}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            "text-xs truncate leading-normal",
                            isCurrent ? "text-white font-medium" : isRecorded ? "text-emerald-300" : "text-slate-400"
                          )}>
                            {verse.text}
                          </p>
                        </div>
                        {isCurrent && recorderState === "recording" && (
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-recording-pulse shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>
          </motion.div>

          {/* Right Panel: Work Deck */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 space-y-6"
          >
            {/* The Teleprompter Box */}
            <div className="rounded-2xl border border-slate-800 bg-[#0E1524] p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/20 text-primary-light border-0 px-3 py-1 font-bold text-xs uppercase tracking-wider">
                  Verse {currentVerse.number} of {totalVerses}
                </Badge>
                {recorderState !== "idle" && (
                  <div className="flex items-center gap-1.5 text-red-500 font-mono font-bold text-sm bg-red-950/20 px-3 py-1 rounded-lg border border-red-900/20 animate-pulse">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>{formatDuration(timer)}</span>
                  </div>
                )}
              </div>

              <motion.div
                key={currentVerse.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-[#090D16] border border-slate-850 p-8 min-h-[160px] flex items-center relative overflow-hidden"
              >
                <div className="absolute top-4 left-4 text-slate-800 font-serif text-6xl select-none leading-none">&ldquo;</div>
                <p className="text-xl leading-relaxed text-slate-100 font-serif relative z-10 pl-6 pr-6">
                  {currentVerse.text}
                </p>
                <div className="absolute bottom-4 right-4 text-slate-800 font-serif text-6xl select-none leading-none">&rdquo;</div>
              </motion.div>
            </div>

            {/* Waveform Console */}
            <div className="rounded-2xl border border-slate-800 bg-[#0E1524] p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none" />

              <div className="rounded-xl bg-[#090D16] border border-slate-900 p-8 shadow-inner">
                <Waveform
                  isActive={recorderState === "recording" || recorderState === "preview"}
                  isRecording={recorderState === "recording"}
                  height={100}
                  barCount={64}
                />
              </div>

              {/* Status Indicator */}
              <div className="mt-4 flex justify-center">
                {recorderState === "recording" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest bg-red-950/30 px-3 py-1.5 rounded-full border border-red-900/30">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-recording-pulse" />
                    LIVE RECORDING
                  </div>
                )}
                {recorderState === "paused" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-3 py-1.5 rounded-full border border-slate-850">
                    Recording Paused
                  </div>
                )}
                {recorderState === "preview" && (
                  <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                    <Volume2 className="h-3.5 w-3.5" />
                    PREVIEW AUDITION
                  </div>
                )}
                {recorderState === "idle" && currentVerse.recording && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/30">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Saved to chapter
                  </div>
                )}
                {recorderState === "idle" && !currentVerse.recording && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900/40 px-3 py-1.5 rounded-full border border-transparent">
                    Mic Ready
                  </div>
                )}
              </div>

              {/* Deck Actions Controls */}
              <div className="mt-8 flex items-center justify-center gap-5 border-t border-slate-800/60 pt-6">
                {recorderState === "idle" && !currentVerse.recording && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg hover:shadow-red-650/40 border-4 border-slate-900 cursor-pointer"
                  >
                    <Mic className="h-8 w-8 text-white fill-current" />
                  </motion.button>
                )}

                {recorderState === "recording" && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-12 w-12 border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300"
                      onClick={pauseRecording}
                    >
                      <Pause className="h-5 w-5" />
                    </Button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="h-16 w-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg border-4 border-slate-900 animate-pulse cursor-pointer"
                    >
                      <Square className="h-6 w-6 text-white fill-current" />
                    </motion.button>
                  </>
                )}

                {recorderState === "paused" && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-12 w-12 border-slate-800 bg-slate-900 text-slate-350"
                      onClick={discardRecording}
                      title="Discard"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resumeRecording}
                      className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg border-4 border-slate-900 cursor-pointer"
                    >
                      <Mic className="h-6 w-6 text-white fill-current animate-ping" />
                    </motion.button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-12 w-12 border-slate-800 bg-slate-900 text-slate-350"
                      onClick={stopRecording}
                      title="End recording"
                    >
                      <Square className="h-5 w-5" />
                    </Button>
                  </>
                )}

                {recorderState === "preview" && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-xl h-12 w-12 border-slate-800 bg-slate-900 text-slate-350"
                      onClick={discardRecording}
                      title="Discard & Re-record"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePreview}
                      className="h-16 w-16 rounded-full bg-accent hover:bg-accent/90 text-dark flex items-center justify-center shadow-lg border-4 border-slate-900 cursor-pointer"
                    >
                      {isPreviewPlaying ? (
                        <Pause className="h-7 w-7" />
                      ) : (
                        <Play className="h-7 w-7 fill-current ml-1" />
                      )}
                    </motion.button>
                    <Button
                      size="icon"
                      className="rounded-xl h-12 w-12 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer disabled:opacity-50"
                      onClick={saveRecording}
                      disabled={saving}
                      title="Save recording"
                    >
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    </Button>
                  </>
                )}

                {recorderState === "idle" && currentVerse.recording && (
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={togglePreview}
                      className="h-12 w-12 rounded-full bg-accent hover:bg-accent/90 text-dark flex items-center justify-center shadow-lg border-2 border-slate-800 cursor-pointer"
                    >
                      {isPreviewPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      )}
                    </motion.button>
                    <Button
                      variant="outline"
                      className="gap-2 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-850 rounded-xl"
                      onClick={deleteRecording}
                    >
                      <Trash2 className="h-4 w-4" /> Clear Recording
                    </Button>
                    <Button className="gap-2 bg-accent text-dark hover:bg-accent/90 font-bold rounded-xl shadow-md cursor-pointer" onClick={goToNextVerse}>
                      Next Verse <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Progress Matrix Grid */}
            <div className="rounded-2xl border border-slate-800 bg-[#0E1524] p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
                <h4 className="text-sm font-bold tracking-wider text-slate-350 uppercase flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-accent" /> Chapter Blueprint
                </h4>
                <span className="text-xs font-mono font-bold text-accent">Completion: {completionPercent}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapter.verses.map((verse, i) => {
                  const isRecorded = !!verse.recording
                  const isCurrent = i === currentVerseIndex
                  return (
                    <button
                      key={verse.id}
                      onClick={() => setCurrentVerseIndex(i)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border cursor-pointer",
                        isRecorded
                          ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
                          : isCurrent
                            ? "bg-primary/20 border-accent text-accent ring-1 ring-accent/25"
                            : "bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850 hover:text-slate-300"
                      )}
                    >
                      {isRecorded ? (
                        <CheckCircle className="h-3 w-3 text-emerald-400" />
                      ) : isCurrent ? (
                        <Mic className="h-3 w-3 text-accent animate-pulse" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-650" />
                      )}
                      <span>Verse {verse.number}</span>
                    </button>
                  )
                })}
              </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  )
}
