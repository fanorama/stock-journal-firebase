import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCollection, useDocument } from 'vuefire'
import type { Portfolio, PortfolioInput } from '@/types'
import {
  getPortfoliosCollection,
  getPortfolioDoc,
  createPortfolio as createPortfolioFirestore,
  updatePortfolio as updatePortfolioFirestore,
  deletePortfolio as deletePortfolioFirestore,
} from '@/firebase/firestore'
import { useAuthStore } from './auth'

/**
 * Portfolios store for managing user portfolios with Firestore integration
 * Uses VueFire for real-time synchronization with Firestore
 */
export const usePortfoliosStore = defineStore('portfolios', () => {
  // Get auth store to access current user
  const authStore = useAuthStore()

  // State
  const activePortfolioId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Reactive Firestore collection binding
  // This will automatically sync with Firestore and update when data changes
  const portfoliosCollection = computed(() => {
    if (!authStore.user?.uid) return null
    return getPortfoliosCollection(authStore.user.uid)
  })

  // Use VueFire to bind portfolios collection
  const {
    data: portfolios,
    pending: portfoliosPending,
    error: portfoliosError,
  } = useCollection<Portfolio>(portfoliosCollection)

  // Reactive document binding for active portfolio
  const activePortfolioDoc = computed(() => {
    if (!authStore.user?.uid || !activePortfolioId.value) return null
    return getPortfolioDoc(authStore.user.uid, activePortfolioId.value)
  })

  const {
    data: activePortfolio,
    pending: activePortfolioPending,
    error: activePortfolioError,
  } = useDocument<Portfolio>(activePortfolioDoc)

  // Getters
  const hasPortfolios = computed(() => {
    return portfolios.value && portfolios.value.length > 0
  })

  const portfoliosList = computed(() => {
    return portfolios.value || []
  })

  const portfoliosCount = computed(() => {
    return portfolios.value?.length || 0
  })

  const getPortfolioById = computed(() => {
    return (portfolioId: string) => {
      return portfolios.value?.find((p) => p.id === portfolioId)
    }
  })

  // Actions

  /**
   * Initialize portfolios - load active portfolio from localStorage
   */
  const initPortfolios = () => {
    const savedPortfolioId = localStorage.getItem('activePortfolioId')
    if (savedPortfolioId) {
      activePortfolioId.value = savedPortfolioId
    } else if (portfolios.value && portfolios.value.length > 0) {
      // Set first portfolio as active if none saved
      const firstPortfolio = portfolios.value[0]
      if (firstPortfolio) {
        setActivePortfolio(firstPortfolio.id)
      }
    }
  }

  /**
   * Set active portfolio
   */
  const setActivePortfolio = (portfolioId: string) => {
    activePortfolioId.value = portfolioId
    localStorage.setItem('activePortfolioId', portfolioId)
  }

  /**
   * Create a new portfolio
   */
  const createPortfolio = async (input: PortfolioInput): Promise<string> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk membuat portfolio')
    }

    isLoading.value = true
    error.value = null

    try {
      const portfolioId = await createPortfolioFirestore(authStore.user.uid, input)

      // Set as active portfolio if it's the first one
      if (!activePortfolioId.value) {
        setActivePortfolio(portfolioId)
      }

      return portfolioId
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat portfolio'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing portfolio
   */
  const updatePortfolio = async (
    portfolioId: string,
    updates: Partial<PortfolioInput>
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk update portfolio')
    }

    isLoading.value = true
    error.value = null

    try {
      await updatePortfolioFirestore(authStore.user.uid, portfolioId, updates)
    } catch (err: any) {
      error.value = err.message || 'Gagal update portfolio'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a portfolio
   */
  const deletePortfolio = async (portfolioId: string): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk delete portfolio')
    }

    isLoading.value = true
    error.value = null

    try {
      await deletePortfolioFirestore(authStore.user.uid, portfolioId)

      // If deleting active portfolio, switch to another one
      if (activePortfolioId.value === portfolioId) {
        const remaining = portfolios.value?.filter((p) => p.id !== portfolioId)
        if (remaining && remaining.length > 0) {
          const firstRemaining = remaining[0]
          if (firstRemaining) {
            setActivePortfolio(firstRemaining.id)
          }
        } else {
          activePortfolioId.value = null
          localStorage.removeItem('activePortfolioId')
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Gagal delete portfolio'
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
    portfolios: portfoliosList,
    activePortfolioId,
    activePortfolio,
    isLoading: computed(() => isLoading.value || portfoliosPending.value),
    error: computed(() => error.value || portfoliosError.value?.message || null),

    // Getters
    hasPortfolios,
    portfoliosCount,
    getPortfolioById,

    // Actions
    initPortfolios,
    setActivePortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    clearError,
  }
})
