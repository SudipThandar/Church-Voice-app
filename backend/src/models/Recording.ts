import mongoose, { Document, Schema } from "mongoose"

export interface IRecording extends Document {
  bookId: mongoose.Types.ObjectId
  chapterId: string
  verseId: string
  userId: mongoose.Types.ObjectId
  audioUrl: string
  duration: number
  fileSize: number
  mimeType: string
  status: "completed" | "processing" | "error"
  createdAt: Date
  updatedAt: Date
}

const recordingSchema = new Schema<IRecording>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    chapterId: { type: String, required: true },
    verseId: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, default: "audio/webm" },
    status: {
      type: String,
      enum: ["completed", "processing", "error"],
      default: "completed",
    },
  },
  { timestamps: true }
)

recordingSchema.index({ bookId: 1, chapterId: 1, verseId: 1 }, { unique: true })
recordingSchema.index({ userId: 1 })

export const Recording = mongoose.model<IRecording>("Recording", recordingSchema)
