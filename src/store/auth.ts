import create from 'zustand'
import {commonMiddlewares} from './middlewares'

export type DerivationType = 'single' | 'hd'

interface AuthState {
  derivationType: DerivationType
  setDerivationType: (to: DerivationType) => void
}

export const useAuthStore = create<AuthState>()(
  commonMiddlewares(
    (set) => ({
      derivationType: 'hd',
      setDerivationType: (to) => set((state) => ({derivationType: to})),
    }),
    {
      name: 'auth-storage',
    }
  )
)
