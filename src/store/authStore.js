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

      clearAuth: () => set({ user: null, session: null, loading: false }),

      // Computed
      isAuthenticated: () => {
        const { user } = get()
        return !!user
      }
    }),
    {
      name: 'auth-storage',
      // Only persist user and session, not loading state
      partialize: (state) => ({
        user: state.user,
        session: state.session
      }),
      // Merge strategy to handle hydration
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        // Always start with loading true on app init
        loading: true
      })
    }
  )
)

export default useAuthStore
