import mongoose, { Document, Schema } from "mongoose"

export interface IVerse {
  id: string
  number: number
  text: string
  duration: number
  audioUrl?: string
  recordingStatus: "pending" | "completed" | "error"
}

export interface IChapter {
  id: string
  number: number
  title: string
  verses: IVerse[]
  duration: number
}

export interface IBook extends Document {
  title: string
  author: string
  description: string
  coverColor: string
  language: string
  narrator: string
  totalChapters: number
  totalVerses: number
  totalDuration: number
  chapters: IChapter[]
  completion: number
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const verseSchema = new Schema<IVerse>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    text: { type: String, required: true },
    duration: { type: Number, default: 0 },
    audioUrl: { type: String },
    recordingStatus: {
      type: String,
      enum: ["pending", "completed", "error"],
      default: "pending",
    },
  },
  { _id: false }
)

const chapterSchema = new Schema<IChapter>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    verses: [verseSchema],
    duration: { type: Number, default: 0 },
  },
  { _id: false }
)

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverColor: { type: String, default: "from-blue-900 to-indigo-800" },
    language: { type: String, default: "en" },
    narrator: { type: String, default: "" },
    totalChapters: { type: Number, default: 0 },
    totalVerses: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    chapters: [chapterSchema],
    completion: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
)

bookSchema.index({ title: "text", author: "text" })
bookSchema.index({ createdBy: 1 })

export const Book = mongoose.model<IBook>("Book", bookSchema)
