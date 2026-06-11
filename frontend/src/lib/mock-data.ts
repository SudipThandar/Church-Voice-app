import { Book, AnalyticsData, UploadResult } from "./types"

export const books: Book[] = []

export const analyticsData: AnalyticsData = {
  recordingCompletion: 0,
  activeListeners: 0,
  listeningHours: 0,
  totalRecordings: 0,
  popularBooks: [],
  monthlyGrowth: [],
}

export const uploadResult: UploadResult = {
  title: "",
  detectedChapters: 0,
  detectedVerses: 0,
  language: "",
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getBookById(_id: string): Book | undefined {
  return undefined
}