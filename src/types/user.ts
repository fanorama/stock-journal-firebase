import type { User as FirebaseUser } from 'firebase/auth'

/**
 * User interface extending Firebase User
 */
export interface User extends FirebaseUser {
  // Additional user properties can be added here if needed
}

/**
 * Auth state interface
 */
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
