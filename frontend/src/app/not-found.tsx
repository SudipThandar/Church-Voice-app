import Link from "next/link"
import { BookOpen, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-background px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/5 border border-border/40 mb-6">
            <BookOpen className="h-12 w-12 text-primary/40" />
          </div>
          <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">404 Error</span>
          <h1 className="text-5xl font-bold text-dark font-serif mt-4">Page Not Found</h1>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            This scripture volume doesn&apos;t exist in our library. It may have been removed or the link may be incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="bg-accent text-dark hover:bg-accent/90 font-bold px-8 h-12 text-base rounded-xl shadow-lg cursor-pointer">
              <Home className="mr-2 h-5 w-5" />
              Return Home
            </Button>
          </Link>
          <Link href="/library">
            <Button variant="outline" className="border-border/80 hover:bg-muted/40 px-8 h-12 text-base font-semibold rounded-xl cursor-pointer">
              Browse Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
