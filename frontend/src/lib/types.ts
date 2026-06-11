export interface Verse {
  id: string
  number: number
  text: string
  duration: number
}

export interface Chapter {
  id: string
  number: number
  title: string
  verses: Verse[]
  duration: number
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  coverColor: string
  language: string
  narrator: string
  totalChapters: number
  totalVerses: number
  totalDuration: number
  chapters: Chapter[]
  completion: number
}

export interface Recording {
  verseId: string
  status: "completed" | "pending" | "error"
  duration: number
}

export interface AnalyticsData {
  recordingCompletion: number
  activeListeners: number
  listeningHours: number
  totalRecordings: number
  popularBooks: { title: string; listens: number }[]
  monthlyGrowth: { month: string; recordings: number; listeners: number }[]
}

export interface UploadResult {
  title: string
  detectedChapters: number
  detectedVerses: number
  language: string
}
