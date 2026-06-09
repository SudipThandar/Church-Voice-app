"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Library, Upload, LayoutDashboard, Mic, BarChart3, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { motion } from "framer-motion"

const navLinks = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/management", label: "Manage", icon: Mic },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-[#0E1524]/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-md shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-foreground font-serif group-hover:text-primary transition-colors">Church Voice</span>
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
                      : "text-muted hover:text-foreground hover:bg-white/5"
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
                          : "text-muted hover:text-foreground"
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
