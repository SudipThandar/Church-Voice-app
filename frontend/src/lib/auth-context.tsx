"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api, setToken, setStoredUser, getStoredUser } from "./api"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
      api.auth.me().then((res) => {
        setUser(res.user)
        setStoredUser(res.user)
      }).catch(() => {
        setUser(null)
        setStoredUser(null)
        setToken(null)
      }).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password })
    setToken(res.token)
    setUser(res.user)
    setStoredUser(res.user)
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await api.auth.register({ email, password, name })
    setToken(res.token)
    setUser(res.user)
    setStoredUser(res.user)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setStoredUser(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
