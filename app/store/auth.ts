import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

// Helper functions for cookie management
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}

const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user: User, token: string) => {
        setCookie('auth-token', token, 7)
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      },
      logout: () => {
        removeCookie('auth-token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },
      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // When the store is rehydrated, set loading to false
        if (state) {
          state.setLoading(false)
        }
      },
    }
  )
) 