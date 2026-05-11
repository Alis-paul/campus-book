import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Role = 'faculty' | 'student' | null

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  course?: string;
  year?: number;
  avatar?: string;
  bio?: string;
}

interface AuthState {
  role: Role
  token: string | null
  user: User | null
  login: (role: string | null | undefined, token: string, user: User) => void
  logout: () => void
  updateRole: (role: string) => void
  // DEMO MODE HELPER
  setDemoSession: (role: 'faculty' | 'student') => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      token: null,
      user: null,

      login: (role, token, user) => {
        const r = (role || '').toLowerCase()
        const validRole: Role = (r === 'faculty' || r === 'student') ? r : null

        const normalizedUser: User | null = user
          ? { ...user, role: (user.role || '').toLowerCase() }
          : null

        set({ role: validRole, token, user: normalizedUser })
      },

      logout: () => set({ role: null, token: null, user: null }),

      updateRole: (role: string) => {
        const r = role.toLowerCase()
        const validRole: Role = (r === 'faculty' || r === 'student') ? r : null
        
        set((state): Partial<AuthState> => {
          if (!state.user) return { role: validRole };
          
          const updatedUser: User = {
            ...state.user,
            role: r
          };

          return {
            role: validRole,
            user: updatedUser
          };
        });
      },

      setDemoSession: (role) => {
        set({
          role: role,
          token: `demo-${role}`,
          user: {
            id: `demo-${role}-id`,
            name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            email: `demo-${role}@example.com`,
            role: role,
            college: 'CampusBook Demo University'
          }
        });
      }
    }),
    {
      name: 'campusbook-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
