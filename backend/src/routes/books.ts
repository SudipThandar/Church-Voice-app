import { Router, Response } from "express"
import { z } from "zod"
import { Book } from "../models/Book"
import { authenticate, AuthRequest } from "../middleware/auth"
import { validate } from "../middleware/validate"

const router = Router()

const bookColors = [
  "from-blue-900 to-indigo-800",
  "from-amber-800 to-yellow-700",
  "from-emerald-800 to-teal-700",
  "from-red-800 to-rose-700",
  "from-purple-800 to-violet-700",
  "from-green-800 to-emerald-700",
  "from-indigo-800 to-blue-700",
  "from-amber-900 to-orange-800",
  "from-teal-800 to-cyan-700",
  "from-rose-800 to-pink-700",
]

const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    description: z.string().default(""),
    language: z.string().default("en"),
    narrator: z.string().default(""),
    chapters: z.array(z.object({
      id: z.string(),
      number: z.number(),
      title: z.string(),
      verses: z.array(z.object({
        id: z.string(),
        number: z.number(),
        text: z.string(),
        duration: z.number().default(0),
      })),
    })),
  }),
})

const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    description: z.string().optional(),
    language: z.string().optional(),
    narrator: z.string().optional(),
  }),
})

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const books = await Book.find({ createdBy: req.user!._id }).sort({ createdAt: -1 })
    res.json({ books })
  } catch (error) {
    console.error("Error fetching books:", error)
    res.status(500).json({ error: "Failed to fetch books" })
  }
})

router.get("/all", authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const books = await Book.find().sort({ createdAt: -1 })
    res.json({ books })
  } catch (error) {
    console.error("Error fetching all books:", error)
    res.status(500).json({ error: "Failed to fetch books" })
  }
})

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      res.status(404).json({ error: "Book not found" })
      return
    }
    res.json({ book })
  } catch (error) {
    console.error("Error fetching book:", error)
    res.status(500).json({ error: "Failed to fetch book" })
  }
})

router.post("/", authenticate, validate(createBookSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, description, language, narrator, chapters } = req.body

    const bookCount = await Book.countDocuments()
    const coverColor = bookColors[bookCount % bookColors.length]

    let totalVerses = 0
    const chaptersWithDurations = chapters.map((ch: { verses: { duration: number }[] }) => {
      totalVerses += ch.verses.length
      return {
        ...ch,
        duration: ch.verses.reduce((sum: number, v: { duration: number }) => sum + v.duration, 0),
      }
    })

    const totalDuration = chaptersWithDurations.reduce(
      (sum: number, ch: { duration: number }) => sum + ch.duration,
      0
    )

    const book = await Book.create({
      title,
      author,
      description,
      coverColor,
      language,
      narrator,
      chapters: chaptersWithDurations,
      totalChapters: chaptersWithDurations.length,
      totalVerses,
      totalDuration,
      completion: 0,
      createdBy: req.user!._id,
    })

    res.status(201).json({ book })
  } catch (error) {
    console.error("Error creating book:", error)
    res.status(500).json({ error: "Failed to create book" })
  }
})

router.patch("/:id", authenticate, validate(updateBookSchema), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user!._id },
      { $set: req.body },
      { new: true }
    )
    if (!book) {
      res.status(404).json({ error: "Book not found" })
      return
    }
    res.json({ book })
  } catch (error) {
    console.error("Error updating book:", error)
    res.status(500).json({ error: "Failed to update book" })
  }
})

router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user!._id,
    })
    if (!book) {
      res.status(404).json({ error: "Book not found" })
      return
    }
    res.json({ message: "Book deleted" })
  } catch (error) {
    console.error("Error deleting book:", error)
    res.status(500).json({ error: "Failed to delete book" })
  }
})

export default router
