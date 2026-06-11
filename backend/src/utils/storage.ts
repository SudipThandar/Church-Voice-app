import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "../config/env"
import { v4 as uuidv4 } from "uuid"

let s3Client: S3Client | null = null

function getClient(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.r2.endpoint,
      region: "auto",
      credentials: {
        accessKeyId: env.r2.accessKeyId,
        secretAccessKey: env.r2.secretAccessKey,
      },
      forcePathStyle: true,
    })
  }
  return s3Client
}

export function isR2Configured(): boolean {
  return !!(env.r2.endpoint && env.r2.accessKeyId && env.r2.secretAccessKey)
}

export async function uploadAudio(
  buffer: Buffer,
  mimeType: string,
  bookId: string,
  chapterId: string,
  verseId: string
): Promise<string> {
  const key = `audio/${bookId}/${chapterId}/${verseId}/${uuidv4()}.webm`
  const client = getClient()

  await client.send(
    new PutObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  )

  return key
}

export async function getAudioUrl(key: string): Promise<string> {
  if (env.r2.publicUrl) {
    return `${env.r2.publicUrl}/${key}`
  }

  const client = getClient()
  const command = new GetObjectCommand({
    Bucket: env.r2.bucketName,
    Key: key,
  })

  return getSignedUrl(client, command, { expiresIn: 3600 })
}

export async function deleteAudio(key: string): Promise<void> {
  const client = getClient()
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.r2.bucketName,
      Key: key,
    })
  )
}

export async function listAudioForChapter(
  bookId: string,
  chapterId: string
): Promise<string[]> {
  const client = getClient()
  const prefix = `audio/${bookId}/${chapterId}/`

  const result = await client.send(
    new ListObjectsV2Command({
      Bucket: env.r2.bucketName,
      Prefix: prefix,
    })
  )

  return (result.Contents || []).map((obj) => obj.Key || "").filter(Boolean)
}
