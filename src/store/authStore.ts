import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'faculty' | 'student' | null

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  role: Role
  token: string | null
  user: User | null
  login: (role: Role, token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      token: null,
      user: null,
      login: (role, token, user) => set({ role, token, user }),
      logout: () => set({ role: null, token: null, user: null }),
    }),
    {
      name: 'campusbook-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
