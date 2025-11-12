import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import type { Strategy, StrategyInput, StrategyStats } from '@/types'
import {
  getStrategiesCollection,
  createStrategy as createStrategyFirestore,
  updateStrategy as updateStrategyFirestore,
  deleteStrategy as deleteStrategyFirestore,
} from '@/firebase/firestore'
import { useAuthStore } from './auth'
import { useTradesStore } from './trades'

/**
 * Strategies store for managing trading strategies with Firestore integration
 * Uses VueFire for real-time synchronization with Firestore
 */
export const useStrategiesStore = defineStore('strategies', () => {
  // Get auth store to access current user
  const authStore = useAuthStore()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Reactive Firestore collection binding
  // This will automatically sync with Firestore and update when data changes
  const strategiesCollection = computed(() => {
    if (!authStore.user?.uid) return null
    return getStrategiesCollection(authStore.user.uid)
  })

  // Use VueFire to bind strategies collection
  const {
    data: strategies,
    pending: strategiesPending,
    error: strategiesError,
  } = useCollection<Strategy>(strategiesCollection)

  // Getters
  const hasStrategies = computed(() => {
    return strategies.value && strategies.value.length > 0
  })

  const strategiesList = computed(() => {
    return strategies.value || []
  })

  const strategiesCount = computed(() => {
    return strategies.value?.length || 0
  })

  const getStrategyById = computed(() => {
    return (strategyId: string) => {
      return strategies.value?.find((s) => s.id === strategyId)
    }
  })

  /**
   * Get strategy statistics from linked trades
   * This computes win rate, profit factor, average gain/loss, etc.
   * Note: For MVP, this only calculates from current active portfolio trades
   * TODO: Extend to aggregate across all portfolios
   */
  const getStrategyStats = computed(() => {
    return (strategyId: string): StrategyStats => {
      const tradesStore = useTradesStore()

      // Get all trades linked to this strategy from active portfolio
      const strategyTrades = tradesStore.trades.filter(
        (trade) => trade.strategyId === strategyId
      )

      // For MVP: Simple stats based on trades count
      // Advanced P&L calculations can be added later with closed trades logic
      const totalTrades = strategyTrades.length

      // Initialize stats with placeholder values
      // TODO: Implement actual P&L calculation with closed trades matching
      return {
        strategyId,
        totalTrades,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        profitFactor: 0,
        averageGain: 0,
        averageLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        totalPnL: 0,
        totalPnLPercent: 0,
      }
    }
  })

  /**
   * Get all strategies with their stats
   */
  const strategiesWithStats = computed(() => {
    return strategiesList.value.map((strategy) => ({
      ...strategy,
      stats: getStrategyStats.value(strategy.id),
    }))
  })

  // Actions

  /**
   * Create a new strategy
   */
  const createStrategy = async (input: StrategyInput): Promise<string> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk membuat strategy')
    }

    isLoading.value = true
    error.value = null

    try {
      const strategyId = await createStrategyFirestore(
        authStore.user.uid,
        input
      )
      return strategyId
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat strategy'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing strategy
   */
  const updateStrategy = async (
    strategyId: string,
    updates: Partial<StrategyInput>
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk update strategy')
    }

    isLoading.value = true
    error.value = null

    try {
      await updateStrategyFirestore(authStore.user.uid, strategyId, updates)
    } catch (err: any) {
      error.value = err.message || 'Gagal update strategy'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a strategy
   * Note: This will leave orphaned strategyId in trades
   */
  const deleteStrategy = async (strategyId: string): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk delete strategy')
    }

    isLoading.value = true
    error.value = null

    try {
      await deleteStrategyFirestore(authStore.user.uid, strategyId)
    } catch (err: any) {
      error.value = err.message || 'Gagal delete strategy'
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
    strategies: strategiesList,
    isLoading: computed(() => isLoading.value || strategiesPending.value),
    error: computed(() => error.value || strategiesError.value?.message || null),

    // Getters
    hasStrategies,
    strategiesCount,
    getStrategyById,
    getStrategyStats,
    strategiesWithStats,

    // Actions
    createStrategy,
    updateStrategy,
    deleteStrategy,
    clearError,
  }
})
