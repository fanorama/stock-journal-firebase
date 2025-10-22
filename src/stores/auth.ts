import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'
import {
  auth,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout as firebaseLogout,
  resetPassword as firebaseResetPassword,
  resendEmailVerification,
  getAuthErrorMessage,
} from '@/firebase'

/**
 * Auth store for managing user authentication state
 * Uses Firebase Authentication with email/password and Google OAuth
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isEmailVerified = computed(() => user.value?.emailVerified || false)
  const userDisplayName = computed(() => user.value?.displayName || user.value?.email || '')
  const userEmail = computed(() => user.value?.email || '')
  const userPhotoURL = computed(() => user.value?.photoURL || '')

  // Actions
  /**
   * Initialize auth state observer
   * Called once when app starts
   */
  const initAuth = () => {
    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          user.value = firebaseUser
          isLoading.value = false
          error.value = null
          resolve()
        },
        (err) => {
          console.error('Auth state change error:', err)
          error.value = getAuthErrorMessage(err)
          isLoading.value = false
          resolve()
        }
      )

      // Store unsubscribe function for cleanup
      return unsubscribe
    })
  }

  /**
   * Register new user with email and password
   */
  const register = async (email: string, password: string, displayName?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const userCredential = await registerWithEmail(email, password, displayName)
      user.value = userCredential.user
      return userCredential
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const userCredential = await loginWithEmail(email, password)
      user.value = userCredential.user
      return userCredential
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Login with Google OAuth
   */
  const loginWithGoogleOAuth = async () => {
    isLoading.value = true
    error.value = null

    try {
      const userCredential = await loginWithGoogle()
      user.value = userCredential.user
      return userCredential
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout current user
   */
  const logout = async () => {
    isLoading.value = true
    error.value = null

    try {
      await firebaseLogout()
      user.value = null
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send password reset email
   */
  const resetPassword = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      await firebaseResetPassword(email)
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Resend email verification
   */
  const resendVerificationEmail = async () => {
    if (!user.value) {
      error.value = 'User tidak ditemukan'
      return
    }

    isLoading.value = true
    error.value = null

    try {
      await resendEmailVerification(user.value)
    } catch (err: any) {
      error.value = getAuthErrorMessage(err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    isLoading,
    error,
    // Getters
    isAuthenticated,
    isEmailVerified,
    userDisplayName,
    userEmail,
    userPhotoURL,
    // Actions
    initAuth,
    register,
    login,
    loginWithGoogleOAuth,
    logout,
    resetPassword,
    resendVerificationEmail,
    clearError,
  }
})
