import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { STORAGE_KEYS } from '../lib/constants'
import { readStorage, removeStorage, writeStorage } from '../lib/storage'
import type { AuthSession, UserRole } from '../types'
import { loginUser, registerUser } from '../services/authService'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  fullName: string
  email: string
  password: string
}

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  userRole: UserRole | null
  login: (input: LoginInput) => Promise<AuthSession>
  register: (input: RegisterInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() =>
    readStorage<AuthSession | null>(STORAGE_KEYS.auth, null),
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: !!session,
      userRole: session?.user.role ?? null,
      login: async (input) => {
        const nextSession = await loginUser(input)
        setSession(nextSession)
        writeStorage(STORAGE_KEYS.auth, nextSession)
        return nextSession
      },
      register: async (input) => {
        await registerUser(input)
      },
      logout: () => {
        setSession(null)
        removeStorage(STORAGE_KEYS.auth)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
