import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      loading: true,

      // Actions
      setUser: (user) => set({ user }),
      
      setSession: (session) => set({ session, user: session?.user || null }),
      
      setLoading: (loading) => set({ loading }),
      
      clearAuth: () => set({ user: null, session: null }),

      // Computed
      isAuthenticated: () => {
        const { user } = get()
        return !!user
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      })
    }
  )
)

export default useAuthStore
