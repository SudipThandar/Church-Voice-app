import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Geist, Geist_Mono, Cinzel, Outfit } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/shared/navbar"
import { BottomPlayerProvider } from "@/components/shared/bottom-player-provider"
import { BottomPlayer } from "@/components/shared/bottom-player"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Church Voice - Scripture Recording Platform",
  description: "Professional scripture recording and listening platform for churches",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const isAdmin = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <TooltipProvider>
          <BottomPlayerProvider>
            <Navbar isAdmin={isAdmin} />
            <main className="flex-1">{children}</main>
            <BottomPlayer />
          </BottomPlayerProvider>
        </TooltipProvider>
      </body>
    </html>
  )
}
