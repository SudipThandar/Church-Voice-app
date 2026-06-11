const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

interface ApiOptions extends RequestInit {
  skipAuth?: boolean
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("church-voice-token")
}

export function setToken(token: string | null): void {
  if (typeof window === "undefined") return
  if (token) {
    localStorage.setItem("church-voice-token", token)
  } else {
    localStorage.removeItem("church-voice-token")
  }
}

export function getStoredUser(): { id: string; email: string; name: string; role: string } | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("church-voice-user")
  return stored ? JSON.parse(stored) : null
}

export function setStoredUser(user: { id: string; email: string; name: string; role: string } | null): void {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("church-voice-user", JSON.stringify(user))
  } else {
    localStorage.removeItem("church-voice-user")
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    if (response.status === 401) {
      setToken(null)
      setStoredUser(null)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string; role: string } }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
        skipAuth: true,
      }),
    login: (data: { email: string; password: string }) =>
      request<{ token: string; user: { id: string; email: string; name: string; role: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
        skipAuth: true,
      }),
    me: () =>
      request<{ user: { id: string; email: string; name: string; role: string } }>("/auth/me"),
  },
  books: {
    list: () =>
      request<{ books: any[] }>("/books"),
    listAll: () =>
      request<{ books: any[] }>("/books/all"),
    get: (id: string) =>
      request<{ book: any }>(`/books/${id}`),
    create: (data: any) =>
      request<{ book: any }>("/books", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ book: any }>(`/books/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ message: string }>(`/books/${id}`, { method: "DELETE" }),
  },
  recordings: {
    upload: (bookId: string, chapterId: string, verseId: string, audio: Blob, duration: number) => {
      const formData = new FormData()
      formData.append("audio", audio)
      formData.append("duration", String(duration))

      const token = getToken()
      return fetch(`${API_BASE}/recordings/${bookId}/chapters/${chapterId}/verses/${verseId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }).then((r) => {
        if (!r.ok) throw new Error("Upload failed")
        return r.json()
      })
    },
    get: (bookId: string, chapterId: string, verseId: string) =>
      request<{ recording: any }>(`/recordings/${bookId}/chapters/${chapterId}/verses/${verseId}`),
    listForChapter: (bookId: string, chapterId: string) =>
      request<{ recordings: any[] }>(`/recordings/${bookId}/chapters/${chapterId}`),
  },
  analytics: {
    get: () =>
      request<{ analytics: any }>("/analytics"),
  },
}
