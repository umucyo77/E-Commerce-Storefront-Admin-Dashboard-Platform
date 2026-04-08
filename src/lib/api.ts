import axios from 'axios'
import { STORAGE_KEYS } from './constants'
import { readStorage } from './storage'
import type { AuthSession } from '../types'

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    'https://e-commas-apis-production.up.railway.app',
  
})

api.interceptors.request.use((config) => {
  const session = readStorage<AuthSession | null>(STORAGE_KEYS.auth, null)
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Request failed'
    )
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}

type MaybeWrapped<T> = {
  data?: T
  message?: string
  success?: boolean
}

export function unwrapApiData<T>(payload: T | MaybeWrapped<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const wrapped = payload as MaybeWrapped<T>
    if (wrapped.data !== undefined) {
      const nested = wrapped.data as unknown
      if (nested && typeof nested === 'object' && 'data' in (nested as object)) {
        const nestedData = (nested as { data?: T }).data
        if (nestedData !== undefined) return nestedData
      }
      return wrapped.data
    }
  }
  return payload as T
}
