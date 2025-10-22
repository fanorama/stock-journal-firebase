// Main Firebase exports
export { app, auth, db } from './config'

// Auth helper functions
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  resendEmailVerification,
  updateUserProfile,
  getAuthErrorMessage,
} from './auth'
