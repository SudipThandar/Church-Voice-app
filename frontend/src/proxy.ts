import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session"

const PROTECTED_PAGE_PREFIXES = ["/admin", "/management", "/upload", "/recording", "/analytics"]
const PROTECTED_API_PREFIXES = ["/api/admin"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtectedPage = PROTECTED_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!isProtectedPage && !isProtectedApi) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const valid = await verifySessionToken(token)

  if (valid) return NextResponse.next()

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loginUrl = new URL("/login", request.url)
  loginUrl.searchParams.set("redirect", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/management/:path*",
    "/upload/:path*",
    "/recording/:path*",
    "/analytics/:path*",
    "/api/admin/:path*",
  ],
}
