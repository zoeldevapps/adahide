import {AddressDerivationType} from '../wallet/types'
import create from 'zustand'
import {commonMiddlewares} from './middlewares'

interface AuthState {
  derivationType: AddressDerivationType
  setDerivationType: (to: AddressDerivationType) => void
}

export const useAuthStore = create<AuthState>()(
  commonMiddlewares(
    (set) => ({
      derivationType: 'hd',
      setDerivationType: (to) => set((_state) => ({derivationType: to})),
    }),
    {
      name: 'auth-storage',
    }
  )
)
