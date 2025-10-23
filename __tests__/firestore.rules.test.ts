/**
 * Firestore Security Rules Tests
 *
 * These tests validate the security rules defined in firestore.rules
 * to ensure proper authentication, authorization, and data validation.
 *
 * Run tests with: npm run test:security-rules
 * Or: npm test
 */

import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'
import {
  setDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'

let testEnv: RulesTestEnvironment

const PROJECT_ID = 'stock-journal-test'
const RULES_PATH = './firestore.rules'

// Test user IDs
const USER_ID_A = 'user_a'
const USER_ID_B = 'user_b'

/**
 * Helper function to create test data
 */
const createPortfolioData = () => ({
  name: 'Test Portfolio',
  description: 'Test Description',
  initialCapital: 10000000,
  baseCurrency: 'IDR',
  marketType: 'IDX',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const createTradeData = (portfolioId: string) => ({
  portfolioId,
  symbol: 'BBCA',
  type: 'BUY',
  quantity: 100,
  price: 8500,
  date: serverTimestamp(),
  fees: 25000,
  notes: 'Test trade',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

const createJournalData = (portfolioId: string) => ({
  portfolioId,
  tradeId: 'trade123',
  entryReason: 'Strong technical setup',
  exitStrategy: 'Target 10% profit',
  emotions: 'Confident',
  lessonsLearned: 'Wait for confirmation',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, 'utf8'),
      host: 'localhost',
      port: 8080,
    },
  })
})

afterAll(async () => {
  await testEnv.cleanup()
})

beforeEach(async () => {
  await testEnv.clearFirestore()
})

describe('Firestore Security Rules', () => {
  // ========================================
  // USERS COLLECTION TESTS (Task 6.1)
  // ========================================

  describe('Users Collection', () => {
    test('should deny unauthenticated read access', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()
      const userDoc = doc(unauthedDb, `users/${USER_ID_A}`)

      await assertFails(getDoc(userDoc))
    })

    test('should deny unauthenticated write access', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()
      const userDoc = doc(unauthedDb, `users/${USER_ID_A}`)

      await assertFails(
        setDoc(userDoc, {
          email: 'test@example.com',
          createdAt: serverTimestamp(),
        })
      )
    })

    test('should allow user to read their own document', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // First create the document with admin context
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        await setDoc(doc(adminDb, `users/${USER_ID_A}`), {
          email: 'test@example.com',
          createdAt: new Date(),
        })
      })

      const userDoc = doc(db, `users/${USER_ID_A}`)
      await assertSucceeds(getDoc(userDoc))
    })

    test('should deny user reading another user document', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create user B's document
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        await setDoc(doc(adminDb, `users/${USER_ID_B}`), {
          email: 'userb@example.com',
          createdAt: new Date(),
        })
      })

      const userBDoc = doc(db, `users/${USER_ID_B}`)
      await assertFails(getDoc(userBDoc))
    })

    test('should allow user to create their own document with required fields', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const userDoc = doc(db, `users/${USER_ID_A}`)

      await assertSucceeds(
        setDoc(userDoc, {
          email: 'test@example.com',
          displayName: 'Test User',
          createdAt: serverTimestamp(),
        })
      )
    })

    test('should deny user creating document without email field', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const userDoc = doc(db, `users/${USER_ID_A}`)

      await assertFails(
        setDoc(userDoc, {
          displayName: 'Test User',
          createdAt: serverTimestamp(),
        })
      )
    })

    test('should deny user deleting their own document', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create document first
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        await setDoc(doc(adminDb, `users/${USER_ID_A}`), {
          email: 'test@example.com',
          createdAt: new Date(),
        })
      })

      const userDoc = doc(db, `users/${USER_ID_A}`)
      await assertFails(deleteDoc(userDoc))
    })
  })

  // ========================================
  // PORTFOLIOS SUBCOLLECTION TESTS (Task 6.2)
  // ========================================

  describe('Portfolios Subcollection', () => {
    test('should deny unauthenticated access to portfolios', async () => {
      const unauthedDb = testEnv.unauthenticatedContext().firestore()
      const portfolioRef = collection(unauthedDb, `users/${USER_ID_A}/portfolios`)

      await assertFails(addDoc(portfolioRef, createPortfolioData()))
    })

    test('should allow user to create portfolio with valid data', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertSucceeds(addDoc(portfolioRef, createPortfolioData()))
    })

    test('should deny creating portfolio without required name field', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      const invalidData = { ...createPortfolioData() }
      delete (invalidData as any).name

      await assertFails(addDoc(portfolioRef, invalidData))
    })

    test('should deny creating portfolio with empty name', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertFails(
        addDoc(portfolioRef, {
          ...createPortfolioData(),
          name: '',
        })
      )
    })

    test('should deny creating portfolio with name > 100 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertFails(
        addDoc(portfolioRef, {
          ...createPortfolioData(),
          name: 'a'.repeat(101),
        })
      )
    })

    test('should deny creating portfolio with negative initialCapital', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertFails(
        addDoc(portfolioRef, {
          ...createPortfolioData(),
          initialCapital: -1000,
        })
      )
    })

    test('should deny creating portfolio with invalid baseCurrency', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertFails(
        addDoc(portfolioRef, {
          ...createPortfolioData(),
          baseCurrency: 'INVALID',
        })
      )
    })

    test('should allow valid baseCurrency values', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      const validCurrencies = ['IDR', 'USD', 'EUR', 'SGD', 'JPY']

      for (const currency of validCurrencies) {
        await assertSucceeds(
          addDoc(portfolioRef, {
            ...createPortfolioData(),
            baseCurrency: currency,
          })
        )
      }
    })

    test('should deny creating portfolio with invalid marketType', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      await assertFails(
        addDoc(portfolioRef, {
          ...createPortfolioData(),
          marketType: 'INVALID_MARKET',
        })
      )
    })

    test('should allow valid marketType values', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const portfolioRef = collection(db, `users/${USER_ID_A}/portfolios`)

      const validMarketTypes = ['IDX', 'US_STOCKS', 'CRYPTO', 'FOREX']

      for (const marketType of validMarketTypes) {
        await assertSucceeds(
          addDoc(portfolioRef, {
            ...createPortfolioData(),
            marketType,
          })
        )
      }
    })

    test('should deny user accessing another user portfolios', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create portfolio for user B
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        await addDoc(collection(adminDb, `users/${USER_ID_B}/portfolios`), createPortfolioData())
      })

      const userBPortfolios = collection(db, `users/${USER_ID_B}/portfolios`)
      await assertFails(addDoc(userBPortfolios, createPortfolioData()))
    })

    test('should allow user to update their own portfolio', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create portfolio first
      let portfolioId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios`),
          createPortfolioData()
        )
        portfolioId = docRef.id
      })

      const portfolioDoc = doc(db, `users/${USER_ID_A}/portfolios/${portfolioId!}`)
      await assertSucceeds(
        updateDoc(portfolioDoc, {
          name: 'Updated Portfolio Name',
          updatedAt: serverTimestamp(),
        })
      )
    })

    test('should allow user to delete their own portfolio', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create portfolio first
      let portfolioId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios`),
          createPortfolioData()
        )
        portfolioId = docRef.id
      })

      const portfolioDoc = doc(db, `users/${USER_ID_A}/portfolios/${portfolioId!}`)
      await assertSucceeds(deleteDoc(portfolioDoc))
    })
  })

  // ========================================
  // TRADES SUBCOLLECTION TESTS (Task 6.3)
  // ========================================

  describe('Trades Subcollection', () => {
    let portfolioId: string

    beforeEach(async () => {
      // Create a portfolio for testing trades
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios`),
          createPortfolioData()
        )
        portfolioId = docRef.id
      })
    })

    test('should allow user to create trade with valid data', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertSucceeds(addDoc(tradesRef, createTradeData(portfolioId)))
    })

    test('should deny creating trade without required symbol field', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      const invalidData = { ...createTradeData(portfolioId) }
      delete (invalidData as any).symbol

      await assertFails(addDoc(tradesRef, invalidData))
    })

    test('should deny creating trade with invalid type', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          type: 'INVALID',
        })
      )
    })

    test('should allow valid trade types (BUY and SELL)', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertSucceeds(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          type: 'BUY',
        })
      )

      await assertSucceeds(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          type: 'SELL',
        })
      )
    })

    test('should deny creating trade with zero quantity', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          quantity: 0,
        })
      )
    })

    test('should deny creating trade with negative quantity', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          quantity: -100,
        })
      )
    })

    test('should deny creating trade with zero price', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          price: 0,
        })
      )
    })

    test('should deny creating trade with negative price', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          price: -1000,
        })
      )
    })

    test('should deny creating trade with negative fees', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          fees: -100,
        })
      )
    })

    test('should allow creating trade with zero fees', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertSucceeds(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          fees: 0,
        })
      )
    })

    test('should deny creating trade with notes > 1000 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          notes: 'a'.repeat(1001),
        })
      )
    })

    test('should deny creating trade with symbol > 10 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const tradesRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`)

      await assertFails(
        addDoc(tradesRef, {
          ...createTradeData(portfolioId),
          symbol: 'VERYLONGSYMBOL',
        })
      )
    })

    test('should allow user to update their own trade', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create trade first
      let tradeId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`),
          createTradeData(portfolioId)
        )
        tradeId = docRef.id
      })

      const tradeDoc = doc(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades/${tradeId!}`)
      await assertSucceeds(
        updateDoc(tradeDoc, {
          quantity: 200,
          updatedAt: serverTimestamp(),
        })
      )
    })

    test('should allow user to delete their own trade', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create trade first
      let tradeId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios/${portfolioId}/trades`),
          createTradeData(portfolioId)
        )
        tradeId = docRef.id
      })

      const tradeDoc = doc(db, `users/${USER_ID_A}/portfolios/${portfolioId}/trades/${tradeId!}`)
      await assertSucceeds(deleteDoc(tradeDoc))
    })
  })

  // ========================================
  // JOURNALS SUBCOLLECTION TESTS (Task 6.4)
  // ========================================

  describe('Journals Subcollection', () => {
    let portfolioId: string

    beforeEach(async () => {
      // Create a portfolio for testing journals
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios`),
          createPortfolioData()
        )
        portfolioId = docRef.id
      })
    })

    test('should allow user to create journal with valid data', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertSucceeds(addDoc(journalsRef, createJournalData(portfolioId)))
    })

    test('should allow creating journal without optional fields', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertSucceeds(
        addDoc(journalsRef, {
          portfolioId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      )
    })

    test('should deny creating journal without portfolioId', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      const invalidData = { ...createJournalData(portfolioId) }
      delete (invalidData as any).portfolioId

      await assertFails(addDoc(journalsRef, invalidData))
    })

    test('should deny creating journal with entryReason > 5000 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertFails(
        addDoc(journalsRef, {
          ...createJournalData(portfolioId),
          entryReason: 'a'.repeat(5001),
        })
      )
    })

    test('should deny creating journal with exitStrategy > 5000 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertFails(
        addDoc(journalsRef, {
          ...createJournalData(portfolioId),
          exitStrategy: 'a'.repeat(5001),
        })
      )
    })

    test('should deny creating journal with emotions > 5000 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertFails(
        addDoc(journalsRef, {
          ...createJournalData(portfolioId),
          emotions: 'a'.repeat(5001),
        })
      )
    })

    test('should deny creating journal with lessonsLearned > 5000 characters', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()
      const journalsRef = collection(db, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`)

      await assertFails(
        addDoc(journalsRef, {
          ...createJournalData(portfolioId),
          lessonsLearned: 'a'.repeat(5001),
        })
      )
    })

    test('should allow user to update their own journal', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create journal first
      let journalId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`),
          createJournalData(portfolioId)
        )
        journalId = docRef.id
      })

      const journalDoc = doc(
        db,
        `users/${USER_ID_A}/portfolios/${portfolioId}/journals/${journalId!}`
      )
      await assertSucceeds(
        updateDoc(journalDoc, {
          entryReason: 'Updated entry reason',
          updatedAt: serverTimestamp(),
        })
      )
    })

    test('should allow user to delete their own journal', async () => {
      const db = testEnv.authenticatedContext(USER_ID_A).firestore()

      // Create journal first
      let journalId: string
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const adminDb = context.firestore()
        const docRef = await addDoc(
          collection(adminDb, `users/${USER_ID_A}/portfolios/${portfolioId}/journals`),
          createJournalData(portfolioId)
        )
        journalId = docRef.id
      })

      const journalDoc = doc(
        db,
        `users/${USER_ID_A}/portfolios/${portfolioId}/journals/${journalId!}`
      )
      await assertSucceeds(deleteDoc(journalDoc))
    })
  })
})
