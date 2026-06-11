// Signed session cookie helpers. Uses Web Crypto so this works in both
// Node (route handlers, layouts) and the Edge runtime (middleware).

export const SESSION_COOKIE_NAME = "cv_session"
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function toBase64Url(bytes: Uint8Array | ArrayBuffer): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ""
  for (const b of arr) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(base64url.length / 4) * 4, "=")
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

async function getSigningKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET is not set")
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ])
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS })
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload))
  const key = await getSigningKey()
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  return `${payloadB64}.${toBase64Url(signature)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false
  const [payloadB64, sigB64] = token.split(".")
  if (!payloadB64 || !sigB64) return false

  try {
    const key = await getSigningKey()
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      new TextEncoder().encode(payloadB64)
    )
    if (!valid) return false

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)))
    return typeof payload.exp === "number" && payload.exp > Date.now()
  } catch {
    return false
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_MS / 1000
