export const RECORDINGS_BUCKET = "recordings"

export const COVER_COLORS = [
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

export function buildRecordingPath(
  bookSlug: string,
  chapterNumber: number,
  verseNumber: number,
  extension: string
): string {
  return `${bookSlug}/${chapterNumber}/${verseNumber}.${extension}`
}
