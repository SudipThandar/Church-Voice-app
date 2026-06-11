export interface ParsedChapter {
  number: number
  title: string
  verses: ParsedVerse[]
}

export interface ParsedVerse {
  number: number
  text: string
}

export interface ParsedBook {
  title: string
  chapters: ParsedChapter[]
  totalVerses: number
}



function detectChapterLines(text: string): { chapterNum: number; startIndex: number }[] {
  const lines = text.split(/\n+/)
  const chapters: { chapterNum: number; startIndex: number }[] = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    const match = trimmed.match(/^chapter\s+(\d+)/i) ||
                  trimmed.match(/^book\s+(\d+)/i) ||
                  trimmed.match(/^(\d+)\s*$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (num > 0 && num <= 200) {
        chapters.push({ chapterNum: num, startIndex: index })
      }
    }
  })

  return chapters
}

function parseVersesFromChapterText(chapterText: string): ParsedVerse[] {
  const verses: ParsedVerse[] = []
  const lines = chapterText.split(/\n+/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const verseMatch = line.match(/^(\d+)[:.](\d+)\s+(.+)/) ||
                       line.match(/^(\d+)[:.](\d+)/)
    if (verseMatch) {
      verses.push({
        number: parseInt(verseMatch[2], 10),
        text: verseMatch[3] || line,
      })
    }
  }

  if (verses.length === 0) {
    lines.forEach((line, i) => {
      verses.push({
        number: i + 1,
        text: line,
      })
    })
  }

  return verses
}

function parseChaptersWithVerses(text: string): ParsedChapter[] {
  const chapters: ParsedChapter[] = []

  const chapterHeaders = detectChapterLines(text)
  const lines = text.split(/\n+/)

  if (chapterHeaders.length === 0) {
    const verses = parseVersesFromChapterText(text)
    if (verses.length > 0) {
      chapters.push({
        number: 1,
        title: "Chapter 1",
        verses,
      })
    }
    return chapters
  }

  for (let i = 0; i < chapterHeaders.length; i++) {
    const current = chapterHeaders[i]
    const next = chapterHeaders[i + 1]
    const startLine = current.startIndex + 1
    const endLine = next ? next.startIndex : lines.length
    const chapterText = lines.slice(startLine, endLine).join("\n")
    const verses = parseVersesFromChapterText(chapterText)
    const chapterTitle = lines[current.startIndex].trim() || `Chapter ${current.chapterNum}`

    chapters.push({
      number: current.chapterNum,
      title: chapterTitle,
      verses: verses.length > 0 ? verses : [{ number: 1, text: chapterText.trim() }],
    })
  }

  return chapters
}

export async function parsePDF(file: File): Promise<ParsedBook> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfjsLib = await import("pdfjs-dist")

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString()

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  let fullText = ""

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageText = content.items.map((item: any) => item.str ?? "").join(" ")
    fullText += pageText + "\n"
  }

  const chapters = parseChaptersWithVerses(fullText)
  const totalVerses = chapters.reduce((sum, ch) => sum + ch.verses.length, 0)

  return { title: file.name.replace(/\.pdf$/i, ""), chapters, totalVerses }
}

export async function parseEPUB(file: File): Promise<ParsedBook> {
  const ePub = (await import("epubjs")).default
  const book = ePub(await file.arrayBuffer())
  await book.ready

  const spineItems: { href?: string }[] = await book.loaded.spine
  let fullText = ""

  for (let i = 0; i < spineItems.length; i++) {
    try {
      const section = book.section(i)
      if (section?.href) {
        const doc = await section.load(book.load.bind(book))
        if (doc?.body) {
          const text = doc.body.textContent || ""
          fullText += text + "\n"
        }
      }
    } catch {
      // skip sections that fail to load
    }
  }

  const meta: { title?: string } = await book.loaded.metadata
  const title = meta?.title || file.name.replace(/\.epub$/i, "")
  const chapters = parseChaptersWithVerses(fullText)
  const totalVerses = chapters.reduce((sum, ch) => sum + ch.verses.length, 0)

  if (totalVerses === 0 && chapters.length > 0) {
    return { title, chapters, totalVerses: chapters.length }
  }

  return { title, chapters, totalVerses }
}

export async function parseFile(file: File): Promise<ParsedBook> {
  if (file.name.toLowerCase().endsWith(".pdf")) {
    return parsePDF(file)
  }
  if (file.name.toLowerCase().endsWith(".epub")) {
    return parseEPUB(file)
  }
  throw new Error("Unsupported file format. Please upload a PDF or EPUB file.")
}