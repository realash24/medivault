import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { User, AuthTokens } from '@/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { setIsLoading(false); return }
    try {
      const userData = await api.get<User>('/api/auth/me/')
      setUser(userData)
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchUser() }, [fetchUser])

  // Session timeout: warn at 25 min, logout at 30 min
  useEffect(() => {
    if (!user) return
    let warnTimer: ReturnType<typeof setTimeout>
    let logoutTimer: ReturnType<typeof setTimeout>
    const resetTimers = () => {
      clearTimeout(warnTimer)
      clearTimeout(logoutTimer)
      warnTimer = setTimeout(() => {
        // Could show a toast, but keep it simple
        console.warn('Session expiring soon')
      }, 25 * 60 * 1000)
      logoutTimer = setTimeout(() => {
        logout()
      }, 30 * 60 * 1000)
    }
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetTimers))
    resetTimers()
    return () => {
      clearTimeout(warnTimer)
      clearTimeout(logoutTimer)
      events.forEach((e) => window.removeEventListener(e, resetTimers))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const login = async (email: string, password: string) => {
    const tokens = await api.post<AuthTokens>('/api/auth/token/', { email, password })
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    const userData = await api.get<User>('/api/auth/me/')
    setUser(userData)
  }

  const register = async (email: string, password: string) => {
    await api.post('/api/auth/register/', { email, password })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
