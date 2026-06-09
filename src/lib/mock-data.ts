import { Book, AnalyticsData, UploadResult } from "./types"
import { sampleVerses } from "./verse-data"

const coverColors = [
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

function buildBook(
  id: string,
  title: string,
  author: string,
  description: string,
  language: string,
  narrator: string,
  chapterCount: number,
  verseMap: Record<number, number>,
  completion: number,
  coverIndex: number
): Book {
  let totalVerses = 0
  const chapters = Array.from({ length: chapterCount }, (_, i) => {
    const ch = i + 1
    const verseCount = verseMap[ch] || 10
    const verses = Array.from({ length: verseCount }, (_, j) => {
      const v = j + 1
      const key = `${id}-${ch}`
      const textPool = sampleVerses[key]
      const text = textPool ? textPool[j % textPool.length] : `Verse ${v} of chapter ${ch}. This is a sacred text passage.`
      return {
        id: `${id}-${ch}-${v}`,
        number: v,
        text,
        duration: Math.floor(Math.random() * 15) + 8,
      }
    })
    totalVerses += verseCount
    return {
      id: `${id}-${ch}`,
      number: ch,
      title: `Chapter ${ch}`,
      verses,
      duration: verses.reduce((sum, v) => sum + v.duration, 0),
    }
  })

  const totalDuration = chapters.reduce((sum, ch) => sum + ch.duration, 0)

  return {
    id,
    title,
    author,
    description,
    coverColor: coverColors[coverIndex % coverColors.length],
    language,
    narrator,
    totalChapters: chapterCount,
    totalVerses,
    totalDuration,
    chapters,
    completion,
  }
}

export const books: Book[] = [
  buildBook(
    "john",
    "Gospel of John",
    "John the Apostle",
    "The Gospel of John presents Jesus Christ as the eternal Word of God, offering a unique perspective on His life, ministry, death, and resurrection. Written that you may believe that Jesus is the Messiah, the Son of God.",
    "English (KJV)",
    "David Thompson",
    21,
    { 1: 18, 2: 12, 3: 21, 4: 15, 5: 16, 6: 18, 7: 14, 8: 20, 9: 12, 10: 15, 11: 17, 12: 16, 13: 12, 14: 14, 15: 11, 16: 13, 17: 10, 18: 12, 19: 14, 20: 11, 21: 14 },
    78,
    0
  ),
  buildBook(
    "psalms",
    "Book of Psalms",
    "King David & Others",
    "The Book of Psalms is a collection of 150 ancient Hebrew poems, songs, and prayers that express the full range of human emotion and experience in relationship with God.",
    "English (KJV)",
    "Sarah Mitchell",
    150,
    Object.fromEntries(Array.from({ length: 150 }, (_, i) => [i + 1, Math.floor(Math.random() * 15) + 5])),
    45,
    1
  ),
  buildBook(
    "romans",
    "Epistle to the Romans",
    "Apostle Paul",
    "Paul's letter to the Romans is his masterpiece of theological exposition, explaining the gospel of God's grace, justification by faith, and the practical outworking of faith in daily living.",
    "English (KJV)",
    "James Anderson",
    16,
    { 1: 17, 2: 14, 3: 18, 4: 12, 5: 15, 6: 13, 7: 16, 8: 18, 9: 14, 10: 12, 11: 16, 12: 13, 13: 11, 14: 14, 15: 13, 16: 12 },
    92,
    2
  ),
  buildBook(
    "genesis",
    "Book of Genesis",
    "Moses",
    "The book of Genesis records the origins of the universe, humanity, sin, and God's covenant people. It lays the foundation for the entire biblical narrative.",
    "English (KJV)",
    "Michael Chen",
    50,
    Object.fromEntries(Array.from({ length: 50 }, (_, i) => [i + 1, Math.floor(Math.random() * 20) + 5])),
    34,
    3
  ),
  buildBook(
    "proverbs",
    "Book of Proverbs",
    "King Solomon",
    "A collection of wise sayings and instructions for living a life of wisdom, righteousness, and fear of the Lord. Practical guidance for every area of life.",
    "English (KJV)",
    "Elizabeth Watson",
    31,
    Object.fromEntries(Array.from({ length: 31 }, (_, i) => [i + 1, Math.floor(Math.random() * 18) + 5])),
    61,
    4
  ),
  buildBook(
    "isaiah",
    "Book of Isaiah",
    "Isaiah the Prophet",
    "The prophet Isaiah's sweeping vision encompasses judgment, hope, and the coming Messiah. His words echo through the centuries with poetic power and prophetic precision.",
    "English (KJV)",
    "Robert Kim",
    66,
    Object.fromEntries(Array.from({ length: 66 }, (_, i) => [i + 1, Math.floor(Math.random() * 15) + 5])),
    22,
    5
  ),
  buildBook(
    "matthew",
    "Gospel of Matthew",
    "Matthew the Apostle",
    "Matthew presents Jesus as the promised King and Messiah, tracing His genealogy and emphasizing His fulfillment of Old Testament prophecy.",
    "English (KJV)",
    "Daniel Rivera",
    28,
    { 1: 17, 2: 12, 3: 11, 4: 14, 5: 18, 6: 15, 7: 13, 8: 16, 9: 14, 10: 17, 11: 12, 12: 18, 13: 16, 14: 13, 15: 14, 16: 12, 17: 11, 18: 15, 19: 14, 20: 13, 21: 16, 22: 15, 23: 12, 24: 17, 25: 14, 26: 18, 27: 13, 28: 11 },
    55,
    6
  ),
  buildBook(
    "acts",
    "Acts of the Apostles",
    "Luke the Evangelist",
    "The Acts of the Apostles chronicles the birth and growth of the early church, the spread of the gospel from Jerusalem to Rome, and the ministry of Peter and Paul.",
    "English (KJV)",
    "Grace Park",
    28,
    { 1: 14, 2: 17, 3: 12, 4: 16, 5: 14, 6: 11, 7: 18, 8: 13, 9: 15, 10: 14, 11: 12, 12: 11, 13: 16, 14: 13, 15: 15, 16: 14, 17: 12, 18: 13, 19: 14, 20: 16, 21: 13, 22: 12, 23: 11, 24: 14, 25: 12, 26: 13, 27: 15, 28: 14 },
    40,
    7
  ),
  buildBook(
    "revelation",
    "Book of Revelation",
    "John the Revelator",
    "The apocalyptic vision of John reveals the ultimate triumph of Christ over evil, the final judgment, and the promise of a new heaven and a new earth.",
    "English (KJV)",
    "Thomas Wright",
    22,
    { 1: 12, 2: 14, 3: 11, 4: 10, 5: 12, 6: 11, 7: 13, 8: 10, 9: 12, 10: 9, 11: 13, 12: 11, 13: 12, 14: 10, 15: 8, 16: 12, 17: 11, 18: 13, 19: 10, 20: 11, 21: 12, 22: 13 },
    18,
    8
  ),
  buildBook(
    "luke",
    "Gospel of Luke",
    "Luke the Physician",
    "Luke's carefully researched account presents Jesus as the Son of Man, emphasizing His compassion for the poor, the outcast, and the marginalized.",
    "English (KJV)",
    "Catherine Brown",
    24,
    { 1: 18, 2: 14, 3: 16, 4: 13, 5: 15, 6: 17, 7: 12, 8: 14, 9: 16, 10: 13, 11: 15, 12: 14, 13: 12, 14: 11, 15: 13, 16: 14, 17: 12, 18: 13, 19: 11, 20: 14, 21: 12, 22: 15, 23: 13, 24: 14 },
    71,
    9
  ),
]

export const analyticsData: AnalyticsData = {
  recordingCompletion: 47,
  activeListeners: 1234,
  listeningHours: 8456,
  totalRecordings: 5843,
  popularBooks: [
    { title: "Gospel of John", listens: 2847 },
    { title: "Book of Psalms", listens: 2156 },
    { title: "Romans", listens: 1834 },
    { title: "Book of Genesis", listens: 1502 },
    { title: "Proverbs", listens: 1210 },
  ],
  monthlyGrowth: [
    { month: "Jan", recordings: 120, listeners: 450 },
    { month: "Feb", recordings: 150, listeners: 520 },
    { month: "Mar", recordings: 180, listeners: 610 },
    { month: "Apr", recordings: 220, listeners: 750 },
    { month: "May", recordings: 280, listeners: 890 },
    { month: "Jun", recordings: 310, listeners: 1020 },
    { month: "Jul", recordings: 350, listeners: 1150 },
    { month: "Aug", recordings: 400, listeners: 1234 },
  ],
}

export const uploadResult: UploadResult = {
  title: "Gospel of John",
  detectedChapters: 21,
  detectedVerses: 879,
  language: "English (KJV)",
}

export function getBookById(id: string): Book | undefined {
  return books.find((b) => b.id === id)
}
