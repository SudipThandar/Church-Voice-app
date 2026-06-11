import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { RECORDINGS_BUCKET, buildRecordingPath } from "@/lib/storage"

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm"
  if (mimeType.includes("ogg")) return "ogg"
  if (mimeType.includes("mp4") || mimeType.includes("m4a") || mimeType.includes("aac")) return "m4a"
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3"
  if (mimeType.includes("wav")) return "wav"
  return "webm"
}

export async function POST(request: Request) {
  const formData = await request.formData()

  const audio = formData.get("audio")
  const verseId = formData.get("verseId")
  const bookSlug = formData.get("bookSlug")
  const chapterNumber = formData.get("chapterNumber")
  const verseNumber = formData.get("verseNumber")
  const durationSeconds = formData.get("durationSeconds")

  if (
    !(audio instanceof File) ||
    typeof verseId !== "string" ||
    typeof bookSlug !== "string" ||
    typeof chapterNumber !== "string" ||
    typeof verseNumber !== "string"
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const mimeType = audio.type || "audio/webm"
  const extension = extensionForMimeType(mimeType)
  const storagePath = buildRecordingPath(bookSlug, Number(chapterNumber), Number(verseNumber), extension)

  const supabase = getSupabaseAdminClient()

  const { error: uploadError } = await supabase.storage.from(RECORDINGS_BUCKET).upload(storagePath, audio, {
    contentType: mimeType,
    upsert: true,
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: recording, error: dbError } = await supabase
    .from("recordings")
    .upsert(
      {
        verse_id: verseId,
        storage_path: storagePath,
        duration_seconds: durationSeconds ? Number(durationSeconds) : 0,
        file_size: audio.size,
        mime_type: mimeType,
        recorded_at: new Date().toISOString(),
      },
      { onConflict: "verse_id" }
    )
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, recording })
}

export async function DELETE(request: Request) {
  const { verseId } = await request.json()
  if (typeof verseId !== "string") {
    return NextResponse.json({ error: "Missing verseId" }, { status: 400 })
  }

  const supabase = getSupabaseAdminClient()

  const { data: recording, error: fetchError } = await supabase
    .from("recordings")
    .select("storage_path")
    .eq("verse_id", verseId)
    .maybeSingle()
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }
  if (!recording) {
    return NextResponse.json({ ok: true })
  }

  await supabase.storage.from(RECORDINGS_BUCKET).remove([(recording as { storage_path: string }).storage_path])

  const { error: deleteError } = await supabase.from("recordings").delete().eq("verse_id", verseId)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
