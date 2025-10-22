import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth'
import { auth } from './config'

/**
 * Register a new user with email and password
 * @param email User email
 * @param password User password
 * @param displayName User display name (optional)
 * @returns UserCredential
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Update display name if provided
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName })
    }

    // Send email verification
    await sendEmailVerification(userCredential.user)

    return userCredential
  } catch (error) {
    console.error('Error registering user:', error)
    throw error
  }
}

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns UserCredential
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}

/**
 * Sign in with Google OAuth
 * @returns UserCredential
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    return userCredential
  } catch (error) {
    console.error('Error logging in with Google:', error)
    throw error
  }
}

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}

/**
 * Send password reset email
 * @param email User email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw error
  }
}

/**
 * Resend email verification
 * @param user Current user
 */
export const resendEmailVerification = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user)
  } catch (error) {
    console.error('Error sending email verification:', error)
    throw error
  }
}

/**
 * Update user profile
 * @param user Current user
 * @param displayName New display name
 * @param photoURL New photo URL (optional)
 */
export const updateUserProfile = async (
  user: User,
  displayName: string,
  photoURL?: string
): Promise<void> => {
  try {
    await updateProfile(user, { displayName, photoURL })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

/**
 * Get authentication error message
 * @param error Firebase auth error
 * @returns User-friendly error message
 */
export const getAuthErrorMessage = (error: any): string => {
  const errorCode = error?.code || ''

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
    case 'auth/invalid-email':
      return 'Format email tidak valid.'
    case 'auth/operation-not-allowed':
      return 'Operasi tidak diizinkan. Hubungi administrator.'
    case 'auth/weak-password':
      return 'Password terlalu lemah. Minimal 6 karakter.'
    case 'auth/user-disabled':
      return 'Akun telah dinonaktifkan.'
    case 'auth/user-not-found':
      return 'Email tidak terdaftar.'
    case 'auth/wrong-password':
      return 'Password salah.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi nanti.'
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah.'
    case 'auth/popup-closed-by-user':
      return 'Login dibatalkan.'
    case 'auth/popup-blocked':
      return 'Popup diblokir browser. Izinkan popup untuk login dengan Google.'
    default:
      return error?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  }
}
