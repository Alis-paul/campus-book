import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Only lowercase roles are valid in the store.
// The backend always stores and returns lowercase roles.
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      token: null,
      user: null,

      login: (role, token, user) => {
        // Normalize role — DB may return 'faculty'/'student' or even 'FACULTY'/'STUDENT'
        const normalizedRole = (role || '').toLowerCase() as Role;
        const validRole: Role = (normalizedRole === 'faculty' || normalizedRole === 'student')
          ? normalizedRole
          : null;

        const normalizedUser: User | null = user
          ? { ...user, role: (user.role || '').toLowerCase() }
          : null;

        set({ role: validRole, token, user: normalizedUser });
      },

      logout: () => set({ role: null, token: null, user: null }),

      // Update role in store after a role change (e.g., after calling PATCH /users/me/role)
      updateRole: (role: string) => {
        const normalizedRole = role.toLowerCase() as Role;
        set(state => ({
          role: normalizedRole,
          user: state.user ? { ...state.user, role: normalizedRole } : null,
        }));
      },
    }),
    {
      name: 'campusbook-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
