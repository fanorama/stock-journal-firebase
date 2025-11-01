import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import type { Journal, JournalInput } from '@/types'
import {
  getJournalsCollection,
  createJournal as createJournalFirestore,
  updateJournal as updateJournalFirestore,
  deleteJournal as deleteJournalFirestore,
} from '@/firebase/firestore'
import { useAuthStore } from './auth'
import { usePortfoliosStore } from './portfolios'

/**
 * Journals store for managing portfolio journal entries with Firestore integration
 * Uses VueFire for real-time synchronization with Firestore
 */
export const useJournalsStore = defineStore('journals', () => {
  // Get auth and portfolio stores
  const authStore = useAuthStore()
  const portfoliosStore = usePortfoliosStore()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Reactive Firestore collection binding for active portfolio's journals
  const journalsCollection = computed(() => {
    if (!authStore.user?.uid || !portfoliosStore.activePortfolioId) return null
    return getJournalsCollection(authStore.user.uid, portfoliosStore.activePortfolioId)
  })

  // Use VueFire to bind journals collection with real-time updates
  const {
    data: journals,
    pending: journalsPending,
    error: journalsError,
  } = useCollection<Journal>(journalsCollection)

  // Getters

  /**
   * Check if there are any journals
   */
  const hasJournals = computed(() => {
    return journals.value && journals.value.length > 0
  })

  /**
   * Get journals list
   */
  const journalsList = computed(() => {
    return journals.value || []
  })

  /**
   * Get total journals count
   */
  const journalsCount = computed(() => {
    return journals.value?.length || 0
  })

  /**
   * Get journal by ID
   */
  const getJournalById = computed(() => {
    return (journalId: string) => {
      return journals.value?.find((j) => j.id === journalId)
    }
  })

  /**
   * Get journals by trade ID
   */
  const getJournalsByTradeId = computed(() => {
    return (tradeId: string) => {
      return journals.value?.filter((j) => j.tradeId === tradeId) || []
    }
  })

  /**
   * Get standalone journals (not linked to any trade)
   */
  const standaloneJournals = computed(() => {
    return journals.value?.filter((j) => !j.tradeId) || []
  })

  /**
   * Get trade-linked journals
   */
  const tradeLinkedJournals = computed(() => {
    return journals.value?.filter((j) => j.tradeId) || []
  })

  // Actions

  /**
   * Create a new journal entry
   */
  const createJournal = async (input: JournalInput): Promise<string> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk membuat journal')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk membuat journal')
    }

    isLoading.value = true
    error.value = null

    try {
      const journalId = await createJournalFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        input
      )

      return journalId
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat journal'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing journal entry
   */
  const updateJournal = async (
    journalId: string,
    updates: Partial<JournalInput>
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk update journal')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk update journal')
    }

    isLoading.value = true
    error.value = null

    try {
      await updateJournalFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        journalId,
        updates
      )
    } catch (err: any) {
      error.value = err.message || 'Gagal update journal'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a journal entry
   */
  const deleteJournal = async (journalId: string): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk delete journal')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk delete journal')
    }

    isLoading.value = true
    error.value = null

    try {
      await deleteJournalFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        journalId
      )
    } catch (err: any) {
      error.value = err.message || 'Gagal delete journal'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    journals: journalsList,
    isLoading: computed(() => isLoading.value || journalsPending.value),
    error: computed(() => error.value || journalsError.value?.message || null),

    // Getters
    hasJournals,
    journalsCount,
    getJournalById,
    getJournalsByTradeId,
    standaloneJournals,
    tradeLinkedJournals,

    // Actions
    createJournal,
    updateJournal,
    deleteJournal,
    clearError,
  }
})
