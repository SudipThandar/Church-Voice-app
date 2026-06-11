"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, BookOpen, Globe, User, Layers, Sparkles, Trash2, Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { getStoredBooks, removeBook, updateBook } from "@/lib/book-storage"
import { Book } from "@/lib/types"

export default function LibraryPage() {
  const [search, setSearch] = useState("")
  const [books, setBooks] = useState<Book[]>(() => getStoredBooks())

  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editAuthor, setEditAuthor] = useState("")
  const [editNarrator, setEditNarrator] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLanguage, setEditLanguage] = useState("")

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.narrator.toLowerCase().includes(search.toLowerCase())
  )

  const handleRemove = (id: string, title: string) => {
    if (window.confirm(`Remove "${title}" from library?`)) {
      removeBook(id)
      setBooks(getStoredBooks())
    }
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setEditTitle(book.title)
    setEditAuthor(book.author)
    setEditNarrator(book.narrator)
    setEditDescription(book.description)
    setEditLanguage(book.language)
  }

  const handleSaveEdit = () => {
    if (!editingBook || !editTitle.trim()) return
    updateBook(editingBook.id, {
      title: editTitle.trim(),
      author: editAuthor.trim(),
      narrator: editNarrator.trim(),
      description: editDescription.trim(),
      language: editLanguage.trim(),
    })
    setBooks(getStoredBooks())
    setEditingBook(null)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left"
      >
        <span className="text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">Archive</span>
        <h1 className="text-4xl font-bold text-dark font-serif mt-3">Scripture Library</h1>
        <p className="mt-2 text-muted text-lg">Access and listen to complete recorded scripture volumes.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-12 max-w-2xl mx-auto md:mx-0 group"
      >
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted group-hover:text-primary transition-colors" />
        <Input
          placeholder="Search by book title, author, or narrator..."
          className="pl-12 h-14 text-base bg-white border-border/80 rounded-2xl shadow-sm focus-visible:ring-accent group-hover:border-primary/30 transition-all duration-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative group/card"
          >
            <Link href={`/book/${book.id}`} className="group block h-full">
              <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-border/40 bg-white shadow-premium hover:shadow-glow-primary hover:-translate-y-2 transition-all duration-300">
                <div className={`relative bg-gradient-to-br ${book.coverColor} p-6 pb-10 flex flex-col justify-between aspect-[4/5] overflow-hidden rounded-t-2xl`}>
                  <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/25 via-black/10 to-transparent z-10 pointer-events-none" />
                  <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-white/10 z-10 pointer-events-none" />
                  
                  <div className="absolute top-4 right-4 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/35 text-white backdrop-blur-md px-2.5 py-1 text-[10px] font-bold border border-white/10 shadow-sm">
                      <Sparkles className="h-3 w-3 text-accent fill-accent" />
                      {book.completion > 0 ? `${book.completion}% Completed` : "Not Started"}
                    </span>
                  </div>

                  <div className="flex items-center justify-center flex-1 py-4">
                    <BookOpen className="h-16 w-16 text-white/20 group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  <div className="relative z-10 pl-2">
                    <h3 className="text-xl font-bold text-white font-serif line-clamp-2 leading-tight tracking-wide group-hover:text-accent transition-colors duration-200">{book.title}</h3>
                    <p className="text-xs text-white/70 font-semibold tracking-wider uppercase mt-1.5">{book.author}</p>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between bg-white border-t border-border/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted font-medium border-b border-border/20 pb-2.5">
                      <span className="text-[10px] tracking-widest uppercase">Language</span>
                      <span className="text-dark flex items-center gap-1">
                        <Globe className="h-3 w-3 text-primary" /> {book.language}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted font-medium border-b border-border/20 pb-2.5">
                      <span className="text-[10px] tracking-widest uppercase">Narrator</span>
                      <span className="text-dark truncate max-w-[150px] flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" /> {book.narrator}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-muted font-medium bg-muted/30 px-3 py-2 rounded-xl">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    <span>{book.totalChapters} chapters · {book.totalVerses} verses</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20">
              <Dialog>
                <DialogTrigger
                  onClick={() => openEdit(book)}
                  className="h-8 w-8 rounded-full bg-white border border-blue-200 text-blue-500 hover:bg-blue-50 hover:text-blue-600 shadow-md cursor-pointer inline-flex items-center justify-center"
                  title={`Edit ${book.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Book Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Book Title</label>
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Author</label>
                        <Input value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Narrator</label>
                        <Input value={editNarrator} onChange={(e) => setEditNarrator(e.target.value)} className="h-11 rounded-xl" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Language</label>
                      <Input value={editLanguage} onChange={(e) => setEditLanguage(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-xl border border-border/80 bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2 border-t border-border/20">
                    <DialogClose className="cursor-pointer px-4 py-2 rounded-xl border border-border/80 text-sm font-semibold hover:bg-muted/40">Cancel</DialogClose>
                    <DialogClose className="cursor-pointer px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/95" onClick={handleSaveEdit}>Save Changes</DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(book.id, book.title)}
                className="h-8 w-8 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 shadow-md cursor-pointer"
                title={`Remove ${book.title}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted bg-white border border-border/40 rounded-3xl p-10 max-w-md mx-auto mt-10 shadow-premium">
          <BookOpen className="h-16 w-16 mb-4 text-muted/30" />
          <p className="text-xl font-bold text-dark font-serif">No Volumes Found</p>
          <p className="text-sm mt-1 text-center">
            {books.length === 0
              ? "Your library is empty. Upload a scripture manuscript to get started."
              : "We couldn't find any scripture books matching that query. Please search again."}
          </p>
          {books.length === 0 && (
            <Link href="/upload">
              <Button className="mt-6 bg-accent text-dark hover:bg-accent/90 font-bold px-6 rounded-xl cursor-pointer">
                Upload Scripture
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}