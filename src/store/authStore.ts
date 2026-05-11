import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'faculty' | 'student' | 'FACULTY' | 'STUDENT' | null

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  role: 'faculty' | 'student' | null
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
      login: (role, token, user) => {
        const normalizedRole = role?.toLowerCase() as 'faculty' | 'student' | null;
        const normalizedUser = user ? { ...user, role: user.role?.toLowerCase() } : null;
        set({ role: normalizedRole, token, user: normalizedUser });
      },
      logout: () => set({ role: null, token: null, user: null }),
    }),
    {
      name: 'campusbook-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
