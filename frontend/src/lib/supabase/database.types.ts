// Hand-written types mirroring scripts/schema.sql, used to type the
// service-role admin client for write operations (insert/upsert/update).

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          slug: string
          title: string
          author: string
          description: string
          language: string
          narrator: string
          cover_color: string
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          author?: string
          description?: string
          language?: string
          narrator?: string
          cover_color?: string
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          author?: string
          description?: string
          language?: string
          narrator?: string
          cover_color?: string
          created_at?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          id: string
          book_id: string
          number: number
          title: string
        }
        Insert: {
          id?: string
          book_id: string
          number: number
          title: string
        }
        Update: {
          id?: string
          book_id?: string
          number?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            referencedRelation: "books"
            referencedColumns: ["id"]
          }
        ]
      }
      verses: {
        Row: {
          id: string
          chapter_id: string
          number: number
          text: string
        }
        Insert: {
          id?: string
          chapter_id: string
          number: number
          text: string
        }
        Update: {
          id?: string
          chapter_id?: string
          number?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "verses_chapter_id_fkey"
            columns: ["chapter_id"]
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          }
        ]
      }
      recordings: {
        Row: {
          id: string
          verse_id: string
          storage_path: string
          duration_seconds: number
          file_size: number
          mime_type: string
          recorded_at: string
        }
        Insert: {
          id?: string
          verse_id: string
          storage_path: string
          duration_seconds?: number
          file_size?: number
          mime_type?: string
          recorded_at?: string
        }
        Update: {
          id?: string
          verse_id?: string
          storage_path?: string
          duration_seconds?: number
          file_size?: number
          mime_type?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recordings_verse_id_fkey"
            columns: ["verse_id"]
            referencedRelation: "verses"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      book_progress: {
        Row: {
          book_id: string
          total_chapters: number
          total_verses: number
          recorded_verses: number
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
  }
}
