import { Router, Response } from "express"
import { Book } from "../models/Book"
import { authenticate, AuthRequest } from "../middleware/auth"

const router = Router()

router.get("/:bookId/chapters/:chapterId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.bookId)
    if (!book) {
      res.status(404).json({ error: "Book not found" })
      return
    }

    const chapter = book.chapters.find((ch) => ch.id === req.params.chapterId)
    if (!chapter) {
      res.status(404).json({ error: "Chapter not found" })
      return
    }

    res.json({ chapter })
  } catch (error) {
    console.error("Error fetching chapter:", error)
    res.status(500).json({ error: "Failed to fetch chapter" })
  }
})

router.patch("/:bookId/chapters/:chapterId/verses/:verseId", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId, chapterId, verseId } = req.params
    const { text, duration } = req.body

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

    if (text !== undefined) verse.text = text
    if (duration !== undefined) verse.duration = duration

    chapter.duration = chapter.verses.reduce((sum, v) => sum + v.duration, 0)
    book.totalDuration = book.chapters.reduce((sum, ch) => sum + ch.duration, 0)

    await book.save()

    res.json({ verse })
  } catch (error) {
    console.error("Error updating verse:", error)
    res.status(500).json({ error: "Failed to update verse" })
  }
})

export default router
