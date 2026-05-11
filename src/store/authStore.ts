import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'faculty' | 'student' | null

interface AuthState {
  role: Role
  token: string | null
  login: (role: Role, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      token: null,
      login: (role, token) => set({ role, token }),
      logout: () => set({ role: null, token: null }),
    }),
    {
      name: 'campusbook-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
