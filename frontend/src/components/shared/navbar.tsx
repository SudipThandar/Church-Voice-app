"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BookOpen, Library, Upload, LayoutDashboard, Mic, BarChart3, Menu, X, LogIn, LogOut, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { motion } from "framer-motion"

const publicLinks = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
]

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/management", label: "Manage", icon: Mic },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const navLinks = isAdmin ? [...publicLinks, ...adminLinks] : publicLinks

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-md shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-dark font-serif group-hover:text-primary transition-colors">Church Voice</span>
            <span className="ml-2 text-xs font-semibold text-accent tracking-widest uppercase">Scripture</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative gap-2 text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-lg",
                    isActive 
                      ? "text-primary bg-primary/5 font-semibold" 
                      : "text-muted hover:text-dark hover:bg-muted/30"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted")} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent"
                      transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-full text-muted hover:text-red-500 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/95 text-white font-bold h-9 px-4 rounded-xl cursor-pointer">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-border/40">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </div>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 pt-12 rounded-l-2xl border-l border-border/40">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                return (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-base h-11 rounded-xl",
                        isActive 
                          ? "bg-primary/5 text-primary font-bold border-l-4 border-accent" 
                          : "text-muted hover:text-dark"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
            <div className="mt-6 pt-4 border-t border-border/20">
              {isAdmin ? (
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-dark flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Admin
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { handleLogout(); setOpen(false) }}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/95 text-white font-bold cursor-pointer">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
