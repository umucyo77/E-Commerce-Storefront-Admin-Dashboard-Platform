import { ADMIN_EMAIL, ADMIN_PASSWORD, STORAGE_KEYS } from '../lib/constants'
import { api, unwrapApiData } from '../lib/api'
import { readStorage, writeStorage } from '../lib/storage'
import type { AuthSession, User } from '../types'

interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  user: User
}

function normalizeRole(role: string | undefined): 'ADMIN' | 'USER' {
  if (role === 'ADMIN') return 'ADMIN'
  return 'USER'
}

export async function registerUser(payload: RegisterPayload) {
  await api.post('/api/auth/users/register', {
    email: payload.email,
    password: payload.password,
    role: 'USER',
  })
  const users = readStorage<RegisterPayload[]>(STORAGE_KEYS.users, [])
  const exists = users.some((user) => user.email === payload.email)
  if (!exists) {
    writeStorage(STORAGE_KEYS.users, [...users, payload])
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthSession> {
  try {
    const response = await api.post<{ token: string; user: User }>(
      '/api/auth/users/login',
      payload,
    )
    const auth = unwrapApiData<LoginResponse>(response.data)
    return {
      token: auth.token,
      user: {
        ...auth.user,
        role: normalizeRole(auth.user.role),
      },
    }
  } catch {
    if (payload.email === ADMIN_EMAIL && payload.password === ADMIN_PASSWORD) {
      throw new Error(
        'Admin login failed on server. Use a real backend admin account/token.',
      )
    }

    const users = readStorage<RegisterPayload[]>(STORAGE_KEYS.users, [])
    const found = users.find(
      (user) =>
        user.email === payload.email && user.password === payload.password,
    )
    if (!found) throw new Error('Invalid email or password')
    return {
      token: `user-local-${found.email}`,
      user: {
        id: found.email,
        email: found.email,
        fullName: found.fullName,
        role: 'USER',
      },
    }
  }
}
