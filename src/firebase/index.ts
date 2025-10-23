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

// Firestore helper functions
export {
  // Collection references
  getPortfoliosCollection,
  getPortfolioDoc,
  getTradesCollection,
  getTradeDoc,
  getJournalsCollection,
  getJournalDoc,
  // Portfolio operations
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  // Trade operations
  createTrade,
  updateTrade,
  deleteTrade,
  // Journal operations
  createJournal,
  updateJournal,
  deleteJournal,
  // Query helpers
  buildTradesQuery,
  buildJournalsQuery,
  // Utility functions
  timestampToDate,
  dateToTimestamp,
} from './firestore'
