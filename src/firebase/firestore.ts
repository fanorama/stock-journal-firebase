/**
 * Firestore Helper Functions
 *
 * This file contains utility functions for interacting with Firestore collections.
 * It provides type-safe wrappers around Firestore operations.
 */

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type QueryConstraint,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type {
  Portfolio,
  PortfolioInput,
  Trade,
  TradeInput,
  Journal,
  JournalInput,
  Strategy,
  StrategyInput,
  DailyPlan,
  DailyPlanInput,
} from '@/types'

// ============================================================================
// Collection References
// ============================================================================

/**
 * Get portfolios collection reference for a user
 */
export function getPortfoliosCollection(userId: string): CollectionReference {
  return collection(db, `users/${userId}/portfolios`)
}

/**
 * Get specific portfolio document reference
 */
export function getPortfolioDoc(
  userId: string,
  portfolioId: string
): DocumentReference {
  return doc(db, `users/${userId}/portfolios/${portfolioId}`)
}

/**
 * Get trades collection reference for a portfolio
 */
export function getTradesCollection(
  userId: string,
  portfolioId: string
): CollectionReference {
  return collection(db, `users/${userId}/portfolios/${portfolioId}/trades`)
}

/**
 * Get specific trade document reference
 */
export function getTradeDoc(
  userId: string,
  portfolioId: string,
  tradeId: string
): DocumentReference {
  return doc(db, `users/${userId}/portfolios/${portfolioId}/trades/${tradeId}`)
}

/**
 * Get journals collection reference for a portfolio
 */
export function getJournalsCollection(
  userId: string,
  portfolioId: string
): CollectionReference {
  return collection(db, `users/${userId}/portfolios/${portfolioId}/journals`)
}

/**
 * Get specific journal document reference
 */
export function getJournalDoc(
  userId: string,
  portfolioId: string,
  journalId: string
): DocumentReference {
  return doc(
    db,
    `users/${userId}/portfolios/${portfolioId}/journals/${journalId}`
  )
}

/**
 * Get strategies collection reference for a user
 */
export function getStrategiesCollection(userId: string): CollectionReference {
  return collection(db, `users/${userId}/strategies`)
}

/**
 * Get specific strategy document reference
 */
export function getStrategyDoc(
  userId: string,
  strategyId: string
): DocumentReference {
  return doc(db, `users/${userId}/strategies/${strategyId}`)
}

/**
 * Get daily-plans collection reference for a user
 */
export function getDailyPlansCollection(userId: string): CollectionReference {
  return collection(db, `users/${userId}/daily-plans`)
}

/**
 * Get specific daily plan document reference
 * @param userId - User ID
 * @param planId - Plan ID (date string in YYYY-MM-DD format)
 */
export function getDailyPlanDoc(
  userId: string,
  planId: string
): DocumentReference {
  return doc(db, `users/${userId}/daily-plans/${planId}`)
}

/**
 * Get today's plan document reference
 * Automatically generates planId from current date
 */
export function getTodaysPlanDoc(userId: string): DocumentReference {
  const today = new Date()
  const planId = formatDateToId(today)
  return getDailyPlanDoc(userId, planId)
}

/**
 * Get plan document reference for a specific date
 * @param userId - User ID
 * @param date - Date object or date string (YYYY-MM-DD)
 */
export function getDatePlanDoc(
  userId: string,
  date: Date | string
): DocumentReference {
  const planId = typeof date === 'string' ? date : formatDateToId(date)
  return getDailyPlanDoc(userId, planId)
}

// ============================================================================
// Portfolio Operations
// ============================================================================

/**
 * Create a new portfolio
 */
export async function createPortfolio(
  userId: string,
  input: PortfolioInput
): Promise<string> {
  const portfoliosRef = getPortfoliosCollection(userId)
  const docRef = await addDoc(portfoliosRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Update an existing portfolio
 */
export async function updatePortfolio(
  userId: string,
  portfolioId: string,
  updates: Partial<PortfolioInput>
): Promise<void> {
  const portfolioRef = getPortfolioDoc(userId, portfolioId)
  await updateDoc(portfolioRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a portfolio and all its subcollections
 * Note: This requires deleting all trades and journals manually
 * or using Cloud Functions for cascading delete
 */
export async function deletePortfolio(
  userId: string,
  portfolioId: string
): Promise<void> {
  // TODO: Implement cascading delete for trades and journals
  // For MVP, we'll just delete the portfolio document
  // In production, use Cloud Functions or batch delete
  const portfolioRef = getPortfolioDoc(userId, portfolioId)
  await deleteDoc(portfolioRef)
}

// ============================================================================
// Trade Operations
// ============================================================================

/**
 * Create a new trade
 */
export async function createTrade(
  userId: string,
  portfolioId: string,
  input: TradeInput
): Promise<string> {
  const tradesRef = getTradesCollection(userId, portfolioId)

  // Convert date to Timestamp if it's a Date object
  const tradeData = {
    ...input,
    date: input.date instanceof Date ? Timestamp.fromDate(input.date) : input.date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(tradesRef, tradeData)
  return docRef.id
}

/**
 * Update an existing trade
 */
export async function updateTrade(
  userId: string,
  portfolioId: string,
  tradeId: string,
  updates: Partial<TradeInput>
): Promise<void> {
  const tradeRef = getTradeDoc(userId, portfolioId, tradeId)

  const updateData: any = {
    ...updates,
    updatedAt: serverTimestamp(),
  }

  // Convert date to Timestamp if it's a Date object
  if (updates.date && updates.date instanceof Date) {
    updateData.date = Timestamp.fromDate(updates.date)
  }

  await updateDoc(tradeRef, updateData)
}

/**
 * Delete a trade
 */
export async function deleteTrade(
  userId: string,
  portfolioId: string,
  tradeId: string
): Promise<void> {
  const tradeRef = getTradeDoc(userId, portfolioId, tradeId)
  await deleteDoc(tradeRef)
}

// ============================================================================
// Journal Operations
// ============================================================================

/**
 * Create a new journal entry
 */
export async function createJournal(
  userId: string,
  portfolioId: string,
  input: JournalInput
): Promise<string> {
  const journalsRef = getJournalsCollection(userId, portfolioId)
  const docRef = await addDoc(journalsRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Update an existing journal entry
 */
export async function updateJournal(
  userId: string,
  portfolioId: string,
  journalId: string,
  updates: Partial<JournalInput>
): Promise<void> {
  const journalRef = getJournalDoc(userId, portfolioId, journalId)
  await updateDoc(journalRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a journal entry
 */
export async function deleteJournal(
  userId: string,
  portfolioId: string,
  journalId: string
): Promise<void> {
  const journalRef = getJournalDoc(userId, portfolioId, journalId)
  await deleteDoc(journalRef)
}

// ============================================================================
// Strategy Operations
// ============================================================================

/**
 * Create a new strategy
 */
export async function createStrategy(
  userId: string,
  input: StrategyInput
): Promise<string> {
  const strategiesRef = getStrategiesCollection(userId)
  const docRef = await addDoc(strategiesRef, {
    ...input,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Update an existing strategy
 */
export async function updateStrategy(
  userId: string,
  strategyId: string,
  updates: Partial<StrategyInput>
): Promise<void> {
  const strategyRef = getStrategyDoc(userId, strategyId)
  await updateDoc(strategyRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a strategy
 * Note: This does not delete strategyId references in trades.
 * Trades with deleted strategy will have orphaned strategyId.
 * UI layer should handle this gracefully.
 */
export async function deleteStrategy(
  userId: string,
  strategyId: string
): Promise<void> {
  const strategyRef = getStrategyDoc(userId, strategyId)
  await deleteDoc(strategyRef)
}

// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Build a query for trades with filters
 */
export function buildTradesQuery(
  userId: string,
  portfolioId: string,
  filters?: {
    symbol?: string
    type?: 'BUY' | 'SELL'
    startDate?: Date
    endDate?: Date
  }
): Query {
  const tradesRef = getTradesCollection(userId, portfolioId)
  const constraints: QueryConstraint[] = []

  if (filters?.symbol) {
    constraints.push(where('symbol', '==', filters.symbol))
  }

  if (filters?.type) {
    constraints.push(where('type', '==', filters.type))
  }

  if (filters?.startDate) {
    constraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)))
  }

  if (filters?.endDate) {
    constraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)))
  }

  // Order by date descending (most recent first)
  constraints.push(orderBy('date', 'desc'))

  return query(tradesRef, ...constraints)
}

/**
 * Build a query for journals with filters
 */
export function buildJournalsQuery(
  userId: string,
  portfolioId: string,
  filters?: {
    tradeId?: string
    startDate?: Date
    endDate?: Date
  }
): Query {
  const journalsRef = getJournalsCollection(userId, portfolioId)
  const constraints: QueryConstraint[] = []

  if (filters?.tradeId) {
    constraints.push(where('tradeId', '==', filters.tradeId))
  }

  if (filters?.startDate) {
    constraints.push(
      where('createdAt', '>=', Timestamp.fromDate(filters.startDate))
    )
  }

  if (filters?.endDate) {
    constraints.push(
      where('createdAt', '<=', Timestamp.fromDate(filters.endDate))
    )
  }

  // Order by creation date descending (most recent first)
  constraints.push(orderBy('createdAt', 'desc'))

  return query(journalsRef, ...constraints)
}

// ============================================================================
// Daily Plan Operations
// ============================================================================

/**
 * Create a new daily plan
 * @param userId - User ID
 * @param input - Daily plan input data
 * @returns The plan ID (date string)
 */
export async function createDailyPlan(
  userId: string,
  input: DailyPlanInput
): Promise<string> {
  const planId = input.planDate // Use date as ID (YYYY-MM-DD)
  const planRef = getDailyPlanDoc(userId, planId)

  await setDoc(planRef, {
    id: planId,
    userId,
    planDate: input.planDate,
    watchlist: input.watchlist || [],
    checklist: input.checklist || [],
    checklistProgress: {
      completed: 0,
      total: input.checklist?.length || 0,
    },
    review: {
      notes: '',
      adherenceRate: 0,
    },
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return planId
}

/**
 * Update an existing daily plan
 * @param userId - User ID
 * @param planId - Plan ID (date string)
 * @param updates - Partial updates to the plan
 */
export async function updateDailyPlan(
  userId: string,
  planId: string,
  updates: Partial<Omit<DailyPlan, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const planRef = getDailyPlanDoc(userId, planId)
  await updateDoc(planRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a daily plan
 * @param userId - User ID
 * @param planId - Plan ID (date string)
 */
export async function deleteDailyPlan(
  userId: string,
  planId: string
): Promise<void> {
  const planRef = getDailyPlanDoc(userId, planId)
  await deleteDoc(planRef)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format Date object to plan ID string (YYYY-MM-DD)
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToId(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Convert Firestore Timestamp to Date
 */
export function timestampToDate(timestamp: Timestamp): Date {
  return timestamp.toDate()
}

/**
 * Convert Date to Firestore Timestamp
 */
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date)
}
