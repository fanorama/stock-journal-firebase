import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCollection } from 'vuefire'
import type { Trade, TradeInput } from '@/types'
import {
  getTradesCollection,
  createTrade as createTradeFirestore,
  updateTrade as updateTradeFirestore,
  deleteTrade as deleteTradeFirestore,
  buildTradesQuery,
} from '@/firebase/firestore'
import { useAuthStore } from './auth'
import { usePortfoliosStore } from './portfolios'

/**
 * Trades store for managing portfolio trades with Firestore integration
 * Uses VueFire for real-time synchronization with Firestore
 */
export const useTradesStore = defineStore('trades', () => {
  // Get auth and portfolio stores
  const authStore = useAuthStore()
  const portfoliosStore = usePortfoliosStore()

  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Filters
  const filters = ref<{
    symbol?: string
    type?: 'BUY' | 'SELL'
    startDate?: Date
    endDate?: Date
  }>({})

  // Reactive Firestore collection binding for active portfolio's trades
  const tradesCollection = computed(() => {
    if (!authStore.user?.uid || !portfoliosStore.activePortfolioId) return null

    // If filters are set, use query builder
    if (Object.keys(filters.value).length > 0) {
      return buildTradesQuery(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        filters.value
      )
    }

    return getTradesCollection(authStore.user.uid, portfoliosStore.activePortfolioId)
  })

  // Use VueFire to bind trades collection with real-time updates
  const {
    data: trades,
    pending: tradesPending,
    error: tradesError,
  } = useCollection<Trade>(tradesCollection)

  // Getters

  /**
   * Check if there are any trades
   */
  const hasTrades = computed(() => {
    return trades.value && trades.value.length > 0
  })

  /**
   * Get trades list
   */
  const tradesList = computed(() => {
    return trades.value || []
  })

  /**
   * Get total trades count
   */
  const tradesCount = computed(() => {
    return trades.value?.length || 0
  })

  /**
   * Get trade by ID
   */
  const getTradeById = computed(() => {
    return (tradeId: string) => {
      return trades.value?.find((t) => t.id === tradeId)
    }
  })

  /**
   * Get trades by symbol
   */
  const getTradesBySymbol = computed(() => {
    return (symbol: string) => {
      return trades.value?.filter((t) => t.symbol === symbol) || []
    }
  })

  /**
   * Get unique symbols traded
   */
  const uniqueSymbols = computed(() => {
    if (!trades.value) return []
    const symbols = new Set(trades.value.map((t) => t.symbol))
    return Array.from(symbols).sort()
  })

  /**
   * Get trades grouped by symbol
   */
  const tradesBySymbol = computed(() => {
    if (!trades.value) return {}

    const grouped: Record<string, Trade[]> = {}
    trades.value.forEach((trade) => {
      if (!grouped[trade.symbol]) {
        grouped[trade.symbol] = []
      }
      grouped[trade.symbol]!.push(trade)
    })

    return grouped
  })

  /**
   * Get total buy trades
   */
  const buyTrades = computed(() => {
    return trades.value?.filter((t) => t.type === 'BUY') || []
  })

  /**
   * Get total sell trades
   */
  const sellTrades = computed(() => {
    return trades.value?.filter((t) => t.type === 'SELL') || []
  })

  // Actions

  /**
   * Create a new trade
   */
  const createTrade = async (input: TradeInput): Promise<string> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk membuat trade')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk membuat trade')
    }

    isLoading.value = true
    error.value = null

    try {
      const tradeId = await createTradeFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        input
      )

      return tradeId
    } catch (err: any) {
      error.value = err.message || 'Gagal membuat trade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing trade
   */
  const updateTrade = async (
    tradeId: string,
    updates: Partial<TradeInput>
  ): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk update trade')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk update trade')
    }

    isLoading.value = true
    error.value = null

    try {
      await updateTradeFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        tradeId,
        updates
      )
    } catch (err: any) {
      error.value = err.message || 'Gagal update trade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a trade
   */
  const deleteTrade = async (tradeId: string): Promise<void> => {
    if (!authStore.user?.uid) {
      throw new Error('User harus login untuk delete trade')
    }

    if (!portfoliosStore.activePortfolioId) {
      throw new Error('Portfolio harus dipilih untuk delete trade')
    }

    isLoading.value = true
    error.value = null

    try {
      await deleteTradeFirestore(
        authStore.user.uid,
        portfoliosStore.activePortfolioId,
        tradeId
      )
    } catch (err: any) {
      error.value = err.message || 'Gagal delete trade'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set filters for trades
   */
  const setFilters = (newFilters: typeof filters.value) => {
    filters.value = { ...newFilters }
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    filters.value = {}
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    trades: tradesList,
    isLoading: computed(() => isLoading.value || tradesPending.value),
    error: computed(() => error.value || tradesError.value?.message || null),
    filters: computed(() => filters.value),

    // Getters
    hasTrades,
    tradesCount,
    getTradeById,
    getTradesBySymbol,
    uniqueSymbols,
    tradesBySymbol,
    buyTrades,
    sellTrades,

    // Actions
    createTrade,
    updateTrade,
    deleteTrade,
    setFilters,
    clearFilters,
    clearError,
  }
})
