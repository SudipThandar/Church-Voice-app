import { Router, Response } from "express"
import multer from "multer"
import { Book } from "../models/Book"
import { Recording } from "../models/Recording"
import { authenticate, AuthRequest } from "../middleware/auth"
import { uploadAudio, getAudioUrl, isR2Configured } from "../utils/storage"

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true)
    } else {
      cb(new Error("Only audio files are allowed"))
    }
  },
})

router.post(
  "/:bookId/chapters/:chapterId/verses/:verseId",
  authenticate,
  upload.single("audio"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bookId, chapterId, verseId } = req.params as Record<string, string>

      if (!req.file) {
        res.status(400).json({ error: "Audio file is required" })
        return
      }

      const book = await Book.findById(bookId)
      if (!book) {
        res.status(404).json({ error: "Book not found" })
        return
      }

      const chapter = book.chapters.find((ch) => ch.id === chapterId)
      if (!chapter) {
        res.status(404).json({ error: "Chapter not found" })
        return
      }

      const verse = chapter.verses.find((v) => v.id === verseId)
      if (!verse) {
        res.status(404).json({ error: "Verse not found" })
        return
      }

      let audioUrl = ""
      let storageKey = ""

      if (isR2Configured()) {
        storageKey = await uploadAudio(
          req.file.buffer,
          req.file.mimetype,
          bookId,
          chapterId,
          verseId
        )
        audioUrl = storageKey
      } else {
        audioUrl = `local-dev/${bookId}/${chapterId}/${verseId}`
        storageKey = audioUrl
      }

      let recording = await Recording.findOne({
        bookId,
        chapterId,
        verseId,
      })

      if (recording) {
        recording.audioUrl = audioUrl
        recording.duration = Number(req.body.duration) || 0
        recording.fileSize = req.file.size
        recording.mimeType = req.file.mimetype
        recording.status = "completed"
        await recording.save()
      } else {
        recording = await Recording.create({
          bookId,
          chapterId,
          verseId,
          userId: req.user!._id,
          audioUrl,
          duration: Number(req.body.duration) || 0,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: "completed",
        })
      }

      verse.audioUrl = audioUrl
      verse.recordingStatus = "completed"
      verse.duration = Number(req.body.duration) || verse.duration

      const chapterVerses = chapter.verses
      const completedVerses = chapterVerses.filter((v) => v.recordingStatus === "completed").length
      book.completion = Math.round(
        (book.chapters.reduce((sum, ch) =>
          sum + ch.verses.filter((v) => v.recordingStatus === "completed").length, 0
        ) / book.totalVerses) * 100
      )

      await book.save()

      res.status(201).json({ recording })
    } catch (error) {
      console.error("Error uploading recording:", error)
      res.status(500).json({ error: "Failed to upload recording" })
    }
  }
)

router.get(
  "/:bookId/chapters/:chapterId/verses/:verseId",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bookId, chapterId, verseId } = req.params

      const recording = await Recording.findOne({ bookId, chapterId, verseId })
      if (!recording) {
        res.status(404).json({ error: "Recording not found" })
        return
      }

      let url = recording.audioUrl
      if (isR2Configured()) {
        url = await getAudioUrl(recording.audioUrl)
      }

      res.json({ recording: { ...recording.toJSON(), signedUrl: url } })
    } catch (error) {
      console.error("Error fetching recording:", error)
      res.status(500).json({ error: "Failed to fetch recording" })
    }
  }
)

router.get(
  "/:bookId/chapters/:chapterId",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { bookId, chapterId } = req.params
      const recordings = await Recording.find({ bookId, chapterId })

      const recordingsWithUrls = await Promise.all(
        recordings.map(async (rec) => {
          let url = rec.audioUrl
          if (isR2Configured()) {
            url = await getAudioUrl(rec.audioUrl)
          }
          return { ...rec.toJSON(), signedUrl: url }
        })
      )

      res.json({ recordings: recordingsWithUrls })
    } catch (error) {
      console.error("Error fetching recordings:", error)
      res.status(500).json({ error: "Failed to fetch recordings" })
    }
  }
)

export default router
